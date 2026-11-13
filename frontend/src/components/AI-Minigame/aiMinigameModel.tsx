import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../routes';
import { getAiImages, submitAiAnswer, type AiImage } from '../../services/aiImage';
import { ANSWER_ERROR, LOAD_ERROR, type Box } from './aiMinigameContent';

const MAX_WIDTH_TO_HEIGHT = 1.5;

export interface AiResult {
  correct: number;
  total: number;
}

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function useAiMinigameModel() {
  const navigate = useNavigate();
  const [size, setSize] = useState(getWindowSize);
  const [images, setImages] = useState<AiImage[]>([]);
  const [index, setIndex] = useState(0);
  // How many guesses so far this game were right.
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<AiResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAiImages()
      .then(setImages)
      .catch(() => setError(LOAD_ERROR));
  }, []);

  const currentImage: AiImage | undefined = images[index];
  const isLastImage = index === images.length - 1;

  // TODO: replace with the shared URLImage component once
  // feature/23-frontend-title-screen is merged.
  const [loadedImage, setLoadedImage] = useState<{ src: string; element: HTMLImageElement }>();
  useEffect(() => {
    if (!currentImage) return;
    const element = new window.Image();
    element.onload = () => setLoadedImage({ src: currentImage.src, element });
    element.src = currentImage.src;
    return () => {
      element.onload = null;
    };
  }, [currentImage]);

  const imageReady = currentImage !== undefined && loadedImage?.src === currentImage.src;
  const imageElement = imageReady ? loadedImage.element : undefined;

  const busy = submitting || !imageReady;

  useEffect(() => {
    const handleResize = () => setSize(getWindowSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sizeUnit = Math.min(size.width, size.height * MAX_WIDTH_TO_HEIGHT);

  function place({ x, y, width, height }: Box) {
    const pixelWidth = width * sizeUnit;
    const pixelHeight = height * sizeUnit;
    return {
      x: x * size.width - pixelWidth / 2,
      y: y * size.height - pixelHeight / 2,
      width: pixelWidth,
      height: pixelHeight,
    };
  }

  function handleBackToDesk() {
    navigate(ROUTES.desk);
  }

  // Sends this one guess to the backend, adds it to the score, then moves on
  // (or shows the score after the last image). If the request fails, the
  // player stays on the same image and can try again.
  async function handleAnswer(isAi: boolean) {
    if (!currentImage || busy) return;

    setSubmitting(true);
    setError('');
    try {
      const { correct } = await submitAiAnswer(currentImage.id, isAi);
      const newCorrectCount = correctCount + (correct ? 1 : 0);
      setCorrectCount(newCorrectCount);

      if (isLastImage) {
        setResult({ correct: newCorrectCount, total: images.length });
      } else {
        setIndex(index + 1);
      }
    } catch {
      setError(ANSWER_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePlayAgain() {
    setIndex(0);
    setCorrectCount(0);
    setResult(null);
    setError('');
  }

  return {
    width: size.width,
    height: size.height,
    sizeUnit,
    place,
    currentImage,
    imageElement,
    imageNumber: index + 1,
    totalImages: images.length,
    result,
    busy,
    error,
    onAnswer: handleAnswer,
    onBackToDesk: handleBackToDesk,
    onPlayAgain: handlePlayAgain,
  };
}
