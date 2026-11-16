import { useEffect, useRef } from 'react';
import { Image } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';

interface SilhouetteProps {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

// Draws an image as a solid dark shape with the same outline, so an empty
// tool slot shows where the tool goes back. Made from the image itself, so
// replacing a tool's image updates its silhouette too.
export default function Silhouette({ src, x, y, width, height, opacity }: SilhouetteProps) {
  const [image] = useImage(src, 'anonymous');
  const imageRef = useRef<Konva.Image>(null);

  // Konva filters only apply to a cached copy, which can only be made once
  // the image has loaded, and again whenever it's resized.
  useEffect(() => {
    if (image) imageRef.current?.cache();
  }, [image, width, height]);

  return (
    <Image
      ref={imageRef}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={opacity}
      filters={[Konva.Filters.Brighten]}
      brightness={-1}
    />
  );
}
