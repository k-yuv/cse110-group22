import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { completeActivity, getProgress, resetProgress, type ActivityId } from '../../services/progress';
import { ROUTES } from '../../routes';
import { getDeskState, STORY_ORDER } from './deskRules';
import type { PixelPlacement, Placement } from './deskContent';

// Where clicking each activity goes.
const ACTIVITY_ROUTES: Record<ActivityId, string> = {
  articles: ROUTES.onlineArticle,
  social: ROUTES.socialMedia,
  interviews: ROUTES.interview,
  aiMinigame: ROUTES.aiImage,
  deskMinigame: ROUTES.cleanDesk,
};

// Item sizes follow the desk's width, but on a short, wide window they follow
// its height instead so everything still fits on screen.
const MAX_WIDTH_TO_HEIGHT = 1.5;

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

// Owns the player's progress and decides what's open on the desk from it.
export function useDeskModel() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<ActivityId[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(getWindowSize);

  useEffect(() => {
    getProgress()
      .then(setCompleted)
      .catch(() => setError('Could not load progress'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => setSize(getWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { activities, createArticleLocked } = getDeskState(completed);
  const sizeUnit = Math.min(size.width, size.height * MAX_WIDTH_TO_HEIGHT);

  function place({ x, y, width, rotation }: Placement): PixelPlacement {
    return { x: x * size.width, y: y * size.height, width: width * sizeUnit, rotation };
  }

  function handleOpenActivity(id: ActivityId) {
    if (!activities[id].locked) navigate(ACTIVITY_ROUTES[id]);
  }

  function handleCreateArticle() {
    if (!createArticleLocked) navigate(ROUTES.createArticle);
  }

  // TEMPORARY dev controls for testing level progression. Remove these (and
  // their buttons in deskView) once the activity screens can be played.
  const nextLevel = STORY_ORDER.find((id) => !completed.includes(id));

  async function handleCompleteNextLevel() {
    if (!nextLevel) return;
    setError('');

    try {
      setCompleted(await completeActivity(nextLevel));
    } catch {
      setError('Could not save progress');
    }
  }

  async function handleResetProgress() {
    setCompleted(await resetProgress());
  }

  return {
    activities,
    createArticleLocked,
    error,
    loading,
    width: size.width,
    height: size.height,
    place,
    onOpenActivity: handleOpenActivity,
    onCreateArticle: handleCreateArticle,
    hasNextLevel: nextLevel !== undefined,
    onCompleteNextLevel: handleCompleteNextLevel,
    onResetProgress: handleResetProgress,
  };
}
