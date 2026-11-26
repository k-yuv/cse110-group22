import { Arc, Circle, Group, Ring } from 'react-konva';
import { COLORS } from '../../../theme';

// The ring a coffee cup leaves behind: a pale wash inside a darker ring,
// since coffee dries darkest at its edge, a fainter ring around it, and a few
// drips. Everything below is a fraction of its width, so it keeps its shape
// at any size.

// The stain is round.
export const COFFEE_RING_ASPECT = 1;

// Scrubbing works anywhere inside this, not just on the brown parts.
const SCRUB_RADIUS = 0.48;

const WASH = { radius: 0.34, opacity: 0.45 };
const MAIN_RING = { inner: 0.33, outer: 0.36, opacity: 0.8 };
const OUTER_RING = { inner: 0.42, outer: 0.44, opacity: 0.55 };
// A darker patch along part of the main ring, where more coffee pooled.
// Angles are in degrees, clockwise from the right.
const POOL = { inner: 0.33, outer: 0.385, start: -70, angle: 110, opacity: 0.5 };

const DRIPS = [
  { x: 0.08, y: 0.6, radius: 0.05 },
  { x: 0.05, y: 0.74, radius: 0.025 },
  { x: 0.13, y: 0.86, radius: 0.035 },
  { x: 0.52, y: 0.03, radius: 0.015 },
  { x: 0.9, y: 0.17, radius: 0.02 },
  { x: 0.96, y: 0.27, radius: 0.012 },
];
const DRIP_OPACITY = 0.7;

interface CoffeeRingProps {
  width: number;
  height: number;
}

// Drawn with its top left corner at 0, 0. Only width sets its size; height is
// accepted so it can be used as a mess's drawing.
export default function CoffeeRing({ width }: CoffeeRingProps) {
  const middle = { x: width / 2, y: width / 2 };

  return (
    <Group>
      <Circle {...middle} radius={SCRUB_RADIUS * width} fill="transparent" />

      <Circle {...middle} radius={WASH.radius * width} fill={COLORS.stainLight} opacity={WASH.opacity} />
      <Ring
        {...middle}
        innerRadius={OUTER_RING.inner * width}
        outerRadius={OUTER_RING.outer * width}
        fill={COLORS.stainMid}
        opacity={OUTER_RING.opacity}
      />
      <Ring
        {...middle}
        innerRadius={MAIN_RING.inner * width}
        outerRadius={MAIN_RING.outer * width}
        fill={COLORS.stainDark}
        opacity={MAIN_RING.opacity}
      />
      <Arc
        {...middle}
        innerRadius={POOL.inner * width}
        outerRadius={POOL.outer * width}
        rotation={POOL.start}
        angle={POOL.angle}
        fill={COLORS.stainDark}
        opacity={POOL.opacity}
      />

      {DRIPS.map(({ x, y, radius }) => (
        <Circle
          key={`${x},${y}`}
          x={x * width}
          y={y * width}
          radius={radius * width}
          fill={COLORS.stainMid}
          opacity={DRIP_OPACITY}
        />
      ))}
    </Group>
  );
}
