import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { completeActivity } from '../../services/progress';
import { ROUTES } from '../../routes';
import { InterviewController } from './InterviewController';

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function useInterviewModel() {
  const navigate = useNavigate();
  const [controller] = useState(() => new InterviewController());
  const [, refresh] = useState(0);
  const [size, setSize] = useState(getWindowSize);
  const [error, setError] = useState('');
  const [finishing, setFinishing] = useState(false);
  const state = controller.model.getState();

  useEffect(() => {
    const handleResize = () => setSize(getWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function update(action: () => void) {
    action();
    refresh((value) => value + 1);
  }

  async function finishInterview() {
    if (finishing) return;
    setError('');
    setFinishing(true);

    try {
      await completeActivity('interviews');
      navigate(ROUTES.desk);
    } catch {
      setError('Could not save interview progress');
    } finally {
      setFinishing(false);
    }
  }

  return {
    questions: state.questions,
    question: state.question,
    choice: state.choice,
    complete: state.questions.length === 0,
    windowWidth: size.width,
    windowHeight: size.height,
    error,
    finishing,
    onSelectQuestion: (id: string) => update(() => controller.selectQuestion(id)),
    onSelectChoice: (id: string) => update(() => controller.selectChoice(id)),
    onAddToJournal: () => update(() => controller.completeCurrentQuestion()),
    onFinishInterview: finishInterview,
  };
}
