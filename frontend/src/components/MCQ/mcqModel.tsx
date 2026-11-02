import { useEffect, useState } from 'react';
import { getQuestion, submitAnswer, type Question } from '../../services/questions';

// Owns all state and service calls for the MCQ component. Any context this
// component reads or writes should also be wired up here, never in the view.
export function useMcqModel(chapter: number, number: number) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // The choice the user clicked, and whether the backend said it's correct.
  // `selected` is set while waiting for the answer, so `correct` is still null.
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    getQuestion(chapter, number)
      .then(setQuestion)
      .catch(() => setError('Could not load question'))
      .finally(() => setLoading(false));
  }, [chapter, number]);

  async function handleChoose(choice: number) {
    // Ignore clicks while an answer is being checked or is already shown.
    if (selected !== null) return;

    setSelected(choice);
    setError('');

    try {
      const result = await submitAnswer(chapter, number, choice);
      setCorrect(result.correct);
    } catch {
      setSelected(null);
      setError('Could not check answer');
    }
  }

  function handleReset() {
    setSelected(null);
    setCorrect(null);
    setError('');
  }

  return {
    question,
    loading,
    error,
    selected,
    correct,
    onChoose: handleChoose,
    onReset: handleReset,
  };
}
