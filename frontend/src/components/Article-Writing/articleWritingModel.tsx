import { useEffect, useState } from 'react';
import { getCollectedEvidence, type Evidence } from '../../services/evidence';
import {
  getArticleSubjects,
  submitArticle,
  type ArticleAnswers,
  type ArticleEnding,
  type ArticleSubject,
} from '../../services/article';

interface ArticleWritingModelOptions {
  levelId: string;
  // How many evidence cards fit on one open spread of the journal.
  evidencePerPage: number;
  onFinish: (ending: ArticleEnding) => void;
}

// Owns all state and service calls for the Article Writing screen. Which
// ending the player gets is decided by submitArticle, not here.
export function useArticleWritingModel({ levelId, evidencePerPage, onFinish }: ArticleWritingModelOptions) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [subjects, setSubjects] = useState<ArticleSubject[]>([]);
  const [answers, setAnswers] = useState<ArticleAnswers>({});
  // Subject id → how many times a full answer has had evidence replaced.
  const [replaceCounts, setReplaceCounts] = useState<Record<string, number>>({});
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getCollectedEvidence(), getArticleSubjects(levelId)])
      .then(([collected, articleSubjects]) => {
        setEvidence(collected);
        setSubjects(articleSubjects);
      })
      .catch(() => setError('Could not load evidence'))
      .finally(() => setLoading(false));
  }, [levelId]);

  const isAnswered = (subject: ArticleSubject) =>
    (answers[subject.id]?.length ?? 0) >= subject.requiredCount;

  // The question currently shown on the laptop; evidence clicks go to it.
  // Players only move forward by submitting an answer, but can step back to
  // change an earlier one.
  const subject: ArticleSubject | undefined = subjects[subjectIndex];
  const selectedIds = subject ? answers[subject.id] ?? [] : [];
  const requiredCount = subject?.requiredCount ?? 0;
  const isFull = selectedIds.length >= requiredCount;
  const answeredCount = subjects.filter(isAnswered).length;
  const isLastQuestion = subjectIndex === subjects.length - 1;
  const pageCount = Math.max(1, Math.ceil(evidence.length / evidencePerPage));

  // Clicking new evidence on a full answer replaces one slot in place,
  // cycling through the slots so repeated clicks don't keep hitting the same one.
  function handleToggleEvidence(id: string) {
    if (!subject) return;
    let ids: string[];

    if (selectedIds.includes(id)) {
      ids = selectedIds.filter((selectedId) => selectedId !== id);
    } else if (isFull) {
      const count = replaceCounts[subject.id] ?? 0;
      ids = [...selectedIds];
      ids[count % requiredCount] = id;
      setReplaceCounts({ ...replaceCounts, [subject.id]: count + 1 });
    } else {
      ids = [...selectedIds, id];
    }

    setAnswers({ ...answers, [subject.id]: ids });
  }

  // Submitting an answer moves on to the next question; submitting the last
  // one sends the whole article.
  async function handleSubmit() {
    if (!subject || !isFull) return;
    if (!isLastQuestion) {
      setSubjectIndex((current) => current + 1);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const result = await submitArticle(answers);
      onFinish(result.ending);
    } catch {
      setError('Could not submit article');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    pageEvidence: evidence.slice(page * evidencePerPage, (page + 1) * evidencePerPage),
    page: page + 1,
    pageCount,
    hasPreviousPage: page > 0,
    hasNextPage: page < pageCount - 1,
    onPreviousPage: () => setPage((current) => Math.max(0, current - 1)),
    onNextPage: () => setPage((current) => Math.min(pageCount - 1, current + 1)),
    questionNumber: subjectIndex + 1,
    questionCount: subjects.length,
    hasPreviousQuestion: subjectIndex > 0,
    isLastQuestion,
    onPreviousQuestion: () => setSubjectIndex((current) => Math.max(0, current - 1)),
    selectedEvidence: selectedIds
      .map((id) => evidence.find((item) => item.id === id))
      .filter((item): item is Evidence => item !== undefined),
    prompt: subject?.prompt ?? '',
    selectedCount: selectedIds.length,
    requiredCount,
    answeredCount,
    error,
    loading,
    canSubmit: isFull && !submitting,
    isSelected: (id: string) => selectedIds.includes(id),
    onToggleEvidence: handleToggleEvidence,
    onSubmit: handleSubmit,
  };
}
