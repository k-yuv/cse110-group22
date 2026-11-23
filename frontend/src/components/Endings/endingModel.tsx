import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { ArticleEnding } from '../../services/article';
import { ROUTES } from '../../routes';
import { ENDING_CONTENT } from './endingContent';

function windowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

// State for an ending screen. Which ending the player gets is decided by
// submitArticle; this only supplies its content and the Return button.
export function useEndingModel(ending: ArticleEnding) {
  const navigate = useNavigate();
  const [size, setSize] = useState(windowSize);

  useEffect(() => {
    const handleResize = () => setSize(windowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    content: ENDING_CONTENT[ending],
    width: size.width,
    height: size.height,
    onReturnToTitle: () => navigate(ROUTES.title),
  };
}
