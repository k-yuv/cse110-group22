import type { ReactNode } from 'react';
import { Group } from 'react-konva';
import HoverSpotlight from './HoverSpotlight';
import type { PixelPlacement } from '../deskContent';

interface DeskItemProps {
  name: string;
  placement: PixelPlacement;
  height: number;
  cornerRadius?: number;
  locked?: boolean;
  onClick: () => void;
  children: ReactNode;
}

// Something on the desk that can be clicked, rotated about its center and lit
// up on hover. Its children are drawn relative to its top left corner.
export default function DeskItem({ name, placement, height, cornerRadius, locked, onClick, children }: DeskItemProps) {
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
      <HoverSpotlight width={width} height={height} cornerRadius={cornerRadius} disabled={locked}>
        {children}
      </HoverSpotlight>
    </Group>
  );
}
