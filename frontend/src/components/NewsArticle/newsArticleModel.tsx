import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getArticleActivity, type ArticleActivity } from '../../services/articles';
import { completeActivity } from '../../services/progress';
import { ROUTES } from '../../routes';
import { gradeHighlights, toggleHighlight, type GradeResult } from './newsArticleRules';
import { addEvidence } from './journalAdapter';
import { useBackConfirmationModel } from '../Back-Confirmation/backConfirmationModel';
import { ADD_EVIDENCE_FIRST_MESSAGE, MESSAGE_SECONDS } from './newsArticleContent';

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

// Owns the article, the player's highlights, and what happens on submit.
export function useNewsArticleModel() {
  const navigate = useNavigate();
  const [size, setSize] = useState(getWindowSize);
  const [activity, setActivity] = useState<ArticleActivity | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [holdingHighlighter, setHoldingHighlighter] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [evidenceAdded, setEvidenceAdded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getArticleActivity()
      .then(setActivity)
      .catch(() => setError('Could not load the article'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => setSize(getWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleToggleHighlighter() {
    setHoldingHighlighter((holding) => !holding);
  }

  // Sentences only react while the highlighter is held, and lock once passed.
  // Changing a highlight clears the old result, since it no longer matches.
  function handleSentenceClick(id: string) {
    if (!holdingHighlighter || result?.passed) return;
    setHighlightedIds((ids) => toggleHighlight(ids, id));
    setResult(null);
  }

  // The message clears itself after a few seconds.
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), MESSAGE_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [message]);

  // Once passed, the highlighter is put away for good. Nothing is saved yet:
  // the player still has to add the evidence to the journal.
  function handleSubmit() {
    if (!activity) return;

    const graded = gradeHighlights(highlightedIds, activity.answerKey);
    setResult(graded);
    if (graded.passed) setHoldingHighlighter(false);
  }

  // Saves the evidence, then the progress. If either fails, the button stays
  // so the player can try again. Evidence already saved isn't added twice.
  async function handleAddEvidence() {
    if (!activity || !result?.passed) return;
    setError('');

    const saved = await Promise.all(activity.evidenceIds.map((id) => addEvidence(id)));
    if (saved.includes(false)) {
      setError('Could not save evidence');
      return;
    }

    try {
      await completeActivity('articles');
    } catch {
      setError('Could not save progress');
      return;
    }

    setEvidenceAdded(true);
    setMessage('');
  }

  // Continue only leaves once the evidence is in the journal.
  function handleContinue() {
    if (!evidenceAdded) {
      setMessage(ADD_EVIDENCE_FIRST_MESSAGE);
      return;
    }
    navigate(ROUTES.desk);
  }

  // Leaving loses the highlights, so ask first. Once passed, the player can't
  // leave at all until the evidence is added.
  const { onBack, confirmation } = useBackConfirmationModel({
    onLeave: () => navigate(ROUTES.desk),
    hasProgressToLose: !result?.passed,
  });
  const canGoBack = !result?.passed || evidenceAdded;

  return {
    activity,
    error,
    loading,
    width: size.width,
    height: size.height,
    holdingHighlighter,
    highlightedIds,
    result,
    evidenceAdded,
    message,
    canGoBack,
    onToggleHighlighter: handleToggleHighlighter,
    onSentenceClick: handleSentenceClick,
    onSubmit: handleSubmit,
    onAddEvidence: handleAddEvidence,
    onContinue: handleContinue,
    onBack,
    backConfirmation: confirmation,
  };
}
