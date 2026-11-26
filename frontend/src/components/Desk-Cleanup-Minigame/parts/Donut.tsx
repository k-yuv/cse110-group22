import { Arc, Circle, Group, Line } from 'react-konva';
import { COLORS } from '../../../theme';

// A half-eaten donut: the bottom half of a ring, iced, with sprinkles and
// crumbs where it was bitten. Everything below is a fraction of its width, so
// it keeps its shape at any size.

// The ring's center, near the top since only its bottom half is left.
const CENTER = { x: 0.5, y: 0.1 };
const OUTER_RADIUS = 0.48;
const HOLE_RADIUS = 0.25;
// The icing covers the inner part of the ring, leaving dough showing below.
const ICING_RADIUS = 0.4;
const OUTLINE_WIDTH = 0.012;

// The donut's height / width.
export const DONUT_ASPECT = CENTER.y + OUTER_RADIUS + OUTLINE_WIDTH;

// Icing drips over the dough at these angles (0 is the right end, 90 the
// bottom, 180 the left end), as circles this big.
const DRIP_ANGLES = [25, 60, 100, 140];
const DRIP_RADIUS = 0.04;

// Each sprinkle: where it is around the ring (angle in degrees, distance from
// the center), how much it's turned, and its color.
const SPRINKLES = [
  { angle: 160, distance: 0.33, turn: 70, color: COLORS.sprinkleTeal },
  { angle: 140, distance: 0.3, turn: 20, color: COLORS.sprinkleRed },
  { angle: 125, distance: 0.36, turn: -40, color: COLORS.sprinkleBlue },
  { angle: 105, distance: 0.31, turn: 60, color: COLORS.sprinklePink },
  { angle: 85, distance: 0.35, turn: -20, color: COLORS.sprinklePurple },
  { angle: 70, distance: 0.3, turn: 40, color: COLORS.sprinkleYellow },
  { angle: 50, distance: 0.34, turn: -60, color: COLORS.sprinkleTeal },
  { angle: 30, distance: 0.31, turn: 10, color: COLORS.sprinkleRed },
  { angle: 15, distance: 0.36, turn: 80, color: COLORS.sprinklePurple },
];
const SPRINKLE_LENGTH = 0.06;
const SPRINKLE_WIDTH = 0.016;

// Crumbs left above each bitten end.
const CRUMBS = [
  { x: 0.08, y: 0.04, radius: 0.012 },
  { x: 0.15, y: 0.025, radius: 0.016 },
  { x: 0.2, y: 0.055, radius: 0.01 },
  { x: 0.8, y: 0.05, radius: 0.012 },
  { x: 0.86, y: 0.02, radius: 0.016 },
  { x: 0.92, y: 0.05, radius: 0.011 },
];

interface DonutProps {
  width: number;
  height: number;
}

// Drawn with its top left corner at 0, 0. Only width sets its size; height is
// accepted so it can be used as a mess's drawing.
export default function Donut({ width }: DonutProps) {
  const center = { x: CENTER.x * width, y: CENTER.y * width };
  const halfRing = { ...center, angle: 180 };
  const outline = { stroke: COLORS.donutOutline, strokeWidth: OUTLINE_WIDTH * width };

  // A point around the ring, from its angle and distance from the center.
  function around(angle: number, distance: number) {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center.x + Math.cos(radians) * distance * width,
      y: center.y + Math.sin(radians) * distance * width,
    };
  }

  return (
    <Group>
      {/* Dough */}
      <Arc {...halfRing} innerRadius={HOLE_RADIUS * width} outerRadius={OUTER_RADIUS * width} fill={COLORS.donutDough} />

      {/* Icing, dripping over the dough */}
      <Arc {...halfRing} innerRadius={HOLE_RADIUS * width} outerRadius={ICING_RADIUS * width} fill={COLORS.donutIcing} />
      {DRIP_ANGLES.map((angle) => (
        <Circle key={angle} {...around(angle, ICING_RADIUS)} radius={DRIP_RADIUS * width} fill={COLORS.donutIcing} />
      ))}

      {SPRINKLES.map(({ angle, distance, turn, color }) => (
        <Line
          key={angle}
          {...around(angle, distance)}
          points={[(-SPRINKLE_LENGTH / 2) * width, 0, (SPRINKLE_LENGTH / 2) * width, 0]}
          rotation={angle + 90 + turn}
          stroke={color}
          strokeWidth={SPRINKLE_WIDTH * width}
          lineCap="round"
        />
      ))}

      {CRUMBS.map(({ x, y, radius }) => (
        <Circle
          key={`${x},${y}`}
          x={x * width}
          y={y * width}
          radius={radius * width}
          fill={COLORS.donutIcing}
          {...outline}
          strokeWidth={(OUTLINE_WIDTH / 2) * width}
        />
      ))}

      {/* The outline goes on top, so the icing doesn't cover it. */}
      <Arc {...halfRing} innerRadius={HOLE_RADIUS * width} outerRadius={OUTER_RADIUS * width} {...outline} />
    </Group>
  );
}
