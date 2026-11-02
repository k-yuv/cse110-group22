import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

interface URLImageProps {
  src: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export const URLImage: React.FC<URLImageProps> = ({ src, x, y, width, height }) => {
  const [image] = useImage(src, 'anonymous');

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
    />
  );
};