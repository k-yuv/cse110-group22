import type { ReactNode } from 'react';
import { Group } from 'react-konva';
import type { PixelPlacement } from '../deskContent';

interface DeskItemProps {
  name: string;
  placement: PixelPlacement;
  height: number;
  onClick: () => void;
  children: ReactNode;
}

// Something on the desk that can be clicked, rotated about its center. Its
// children are drawn relative to its top left corner.
export default function DeskItem({ name, placement, height, onClick, children }: DeskItemProps) {
  const { x, y, width, rotation } = placement;

  return (
    <Group
      name={name}
      x={x}
      y={y}
      rotation={rotation}
      offsetX={width / 2}
      offsetY={height / 2}
      onClick={onClick}
      onTap={onClick}
    >
      {children}
    </Group>
  );
}
