import { Circle, Ellipse, Group, Line } from 'react-konva';
import { COLORS } from '../../../theme';

// A splat of ketchup: a lumpy red blob with a shiny spot and a few droplets.
// Everything below is a fraction of its width, so it keeps its shape at any
// size.

export const KETCHUP_ASPECT = 0.8;

const CENTER = { x: 0.5, y: 0.4 };
// The blob's edge: how far it reaches from the center at each of 12 evenly
// spaced angles, going clockwise from the right. Uneven distances make it
// lumpy, and the curve through them smooths it out. Squashed to fit the
// stain's height.
const EDGE = [0.38, 0.3, 0.42, 0.33, 0.4, 0.28, 0.36, 0.44, 0.31, 0.39, 0.29, 0.41];
const SQUASH = 0.8;
const SMOOTHNESS = 0.4;

const SHINE = { x: 0.4, y: 0.3, radiusX: 0.1, radiusY: 0.05, rotation: -20, opacity: 0.5 };

const DROPLETS = [
  { x: 0.06, y: 0.3, radius: 0.025 },
  { x: 0.93, y: 0.55, radius: 0.03 },
  { x: 0.85, y: 0.12, radius: 0.018 },
  { x: 0.2, y: 0.72, radius: 0.02 },
];

interface KetchupProps {
  width: number;
  height: number;
}

// Drawn with its top left corner at 0, 0. Only width sets its size; height is
// accepted so it can be used as a mess's drawing.
export default function Ketchup({ width }: KetchupProps) {
  const edge = EDGE.flatMap((distance, index) => {
    const angle = (index / EDGE.length) * 2 * Math.PI;
    return [
      (CENTER.x + Math.cos(angle) * distance) * width,
      (CENTER.y + Math.sin(angle) * distance * SQUASH) * width,
    ];
  });

  return (
    <Group>
      <Line points={edge} closed tension={SMOOTHNESS} fill={COLORS.ketchup} />
      <Ellipse
        x={SHINE.x * width}
        y={SHINE.y * width}
        radiusX={SHINE.radiusX * width}
        radiusY={SHINE.radiusY * width}
        rotation={SHINE.rotation}
        fill={COLORS.ketchupShine}
        opacity={SHINE.opacity}
      />
      {DROPLETS.map(({ x, y, radius }) => (
        <Circle key={`${x},${y}`} x={x * width} y={y * width} radius={radius * width} fill={COLORS.ketchup} />
      ))}
    </Group>
  );
}
