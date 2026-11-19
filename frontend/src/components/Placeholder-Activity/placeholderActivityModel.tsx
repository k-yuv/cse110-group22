import { useState } from 'react';
import { useNavigate } from 'react-router';
import { completeActivity, type ActivityId } from '../../services/progress';
import { ROUTES } from '../../routes';
import { SAVE_ERROR } from './placeholderActivityContent';

// Finishing a placeholder marks its activity done and goes back to the desk,
// so the unlock order can be played through before the real screens exist.
export function usePlaceholderActivityModel(activity: ActivityId) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function handleFinish() {
    setError('');
    try {
      await completeActivity(activity);
      navigate(ROUTES.desk);
    } catch {
      setError(SAVE_ERROR);
    }
  }

  return { error, onFinish: handleFinish };
}
