import { useEffect, useState } from 'react';
import { getCollectedEvidence, type Evidence } from '../../services/evidence';
import {
  getArticleSubject,
  submitArticle,
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
  const [subject, setSubject] = useState<ArticleSubject | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getCollectedEvidence(), getArticleSubject(levelId)])
      .then(([collected, articleSubject]) => {
        setEvidence(collected);
        setSubject(articleSubject);
      })
      .catch(() => setError('Could not load evidence'))
      .finally(() => setLoading(false));
  }, [levelId]);

  const requiredCount = subject?.requiredCount ?? 0;
  const isFull = selectedIds.length >= requiredCount;
  const pageCount = Math.max(1, Math.ceil(evidence.length / evidencePerPage));

  function handleToggleEvidence(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((selectedId) => selectedId !== id);
      if (current.length >= requiredCount) return current;
      return [...current, id];
    });
  }

  async function handleSubmit() {
    if (!subject || !isFull) return;
    setError('');
    setSubmitting(true);

    try {
      const result = await submitArticle(subject.id, selectedIds);
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
    selectedEvidence: selectedIds
      .map((id) => evidence.find((item) => item.id === id))
      .filter((item): item is Evidence => item !== undefined),
    prompt: subject?.prompt ?? '',
    selectedCount: selectedIds.length,
    requiredCount,
    error,
    loading,
    canSubmit: isFull && !submitting,
    isSelected: (id: string) => selectedIds.includes(id),
    canSelectMore: !isFull,
    onToggleEvidence: handleToggleEvidence,
    onSubmit: handleSubmit,
  };
}
