import { useEffect, useState } from 'react';
import { getProgress, type ActivityId } from '../../services/progress';
import { getDeskState } from './deskRules';
import { ACTIVITY_LABELS, CREATE_ARTICLE_LABEL, type PixelPlacement, type Placement } from './deskContent';

// Item sizes follow the desk's width, but on a short, wide window they follow
// its height instead so everything still fits on screen.
const MAX_WIDTH_TO_HEIGHT = 1.5;

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

// Owns the player's progress and decides what's open on the desk from it.
export function useDeskModel() {
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

  // TODO: open each activity's screen once it's built.
  function handleOpenActivity(id: ActivityId) {
    if (!activities[id].locked) console.log(`${ACTIVITY_LABELS[id]} is not implemented yet`);
  }

  function handleCreateArticle() {
    if (!createArticleLocked) console.log(`${CREATE_ARTICLE_LABEL} is not implemented yet`);
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
  };
}
