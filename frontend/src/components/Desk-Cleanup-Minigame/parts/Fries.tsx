import { Group, Rect } from 'react-konva';
import { COLORS } from '../../../theme';

// Three fries leaning together, drawn as one mess so throwing it away clears
// all three. Everything below is a fraction of its width, so it keeps its
// shape at any size.

export const FRIES_ASPECT = 0.9;

const FRY_LENGTH = 0.75;
const FRY_THICKNESS = 0.13;
const OUTLINE_WIDTH = 0.012;

// Each fry's center and how far it leans, in degrees clockwise.
const FRIES = [
  { x: 0.32, y: 0.45, rotation: -22 },
  { x: 0.5, y: 0.42, rotation: 4 },
  { x: 0.68, y: 0.47, rotation: 24 },
];

interface FriesProps {
  width: number;
  height: number;
}

// Drawn with its top left corner at 0, 0. Only width sets its size; height is
// accepted so it can be used as a mess's drawing.
export default function Fries({ width }: FriesProps) {
  const fryWidth = FRY_THICKNESS * width;
  const fryLength = FRY_LENGTH * width;

  return (
    <Group>
      {FRIES.map(({ x, y, rotation }) => (
        <Rect
          key={x}
          x={x * width}
          y={y * width}
          width={fryWidth}
          height={fryLength}
          // Turns around the fry's center instead of its corner.
          offsetX={fryWidth / 2}
          offsetY={fryLength / 2}
          rotation={rotation}
          cornerRadius={fryWidth * 0.3}
          fill={COLORS.fry}
          stroke={COLORS.fryOutline}
          strokeWidth={OUTLINE_WIDTH * width}
        />
      ))}
    </Group>
  );
}
