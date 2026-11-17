import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../routes';
import { checkAiAnswers, getAiImages, type AiAnswers, type AiImage, type AiResult } from '../../services/aiImage';
import type { Box } from './aiMinigameContent';
import { useBackConfirmationModel } from '../Back-Confirmation/backConfirmationModel';

const MAX_WIDTH_TO_HEIGHT = 1.5;

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function useAiMinigameModel() {
  const navigate = useNavigate();
  const [size, setSize] = useState(getWindowSize);
  const [images, setImages] = useState<AiImage[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AiAnswers>({});
  const [result, setResult] = useState<AiResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAiImages().then(setImages);
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

  // Leaving mid-game loses the answers so far, so ask first. Once the
  // results are showing there's nothing left to lose.
  const { onBack, confirmation } = useBackConfirmationModel({
    onLeave: () => navigate(ROUTES.desk),
    hasProgressToLose: result === null,
  });

  async function handleAnswer(isAi: boolean) {
    if (!currentImage || busy) return;
    const newAnswers = { ...answers, [currentImage.id]: isAi };
    setAnswers(newAnswers);

    if (!isLastImage) {
      setIndex(index + 1);
      return;
    }

    setSubmitting(true);
    try {
      setResult(await checkAiAnswers(newAnswers));
    } finally {
      setSubmitting(false);
    }
  }

  function handlePlayAgain() {
    setIndex(0);
    setAnswers({});
    setResult(null);
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
    onAnswer: handleAnswer,
    onBackToDesk: onBack,
    backConfirmation: confirmation,
    onPlayAgain: handlePlayAgain,
  };
}
