import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getArticleActivity, type ArticleActivity } from '../../services/articles';
import { completeActivity } from '../../services/progress';
import { ROUTES } from '../../routes';
import { gradeHighlights, toggleHighlight, type GradeResult } from './newsArticleRules';
import { addEvidence } from './journalAdapter';

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

  async function handleSubmit() {
    if (!activity) return;

    const graded = gradeHighlights(highlightedIds, activity.answerKey);
    setResult(graded);
    if (!graded.passed) return;

    // The level is done, so the highlighter is put away for good.
    setHoldingHighlighter(false);
    activity.answerKey.forEach((entry) => addEvidence(entry.evidence));
    try {
      await completeActivity('articles');
    } catch {
      setError('Could not save progress');
    }
  }

  function handleContinue() {
    navigate(ROUTES.desk);
  }

  return {
    activity,
    error,
    loading,
    width: size.width,
    height: size.height,
    holdingHighlighter,
    highlightedIds,
    result,
    onToggleHighlighter: handleToggleHighlighter,
    onSentenceClick: handleSentenceClick,
    onSubmit: handleSubmit,
    onContinue: handleContinue,
  };
}
