import { Circle, Group, Line, Rect } from 'react-konva';
import { COLORS } from '../../../theme';

// A paper coffee cup seen from above: the brown rim, the lid, and the lid's
// drinking spout. Everything below is a fraction of its width, measured from
// Coffee-cup-Cleanup.png, so it keeps its shape at any size.

// The cup is round.
export const COFFEE_CUP_ASPECT = 1;

const RIM_RADIUS = 0.49;
const LID_RADIUS = 0.43;
// The raised ring pressed into the lid, a little below the middle.
const LID_RING = { x: 0.5, y: 0.56, radius: 0.33 };
// The raised spout at the top, as its outline's corners, and the slot to
// drink from.
const SPOUT = [
  [0.39, 0.07],
  [0.61, 0.07],
  [0.67, 0.27],
  [0.5, 0.31],
  [0.33, 0.27],
];
const SLOT = { x: 0.44, y: 0.09, width: 0.12, height: 0.055 };
const VENT = { x: 0.5, y: 0.8, radius: 0.012 };
const LINE_WIDTH = 0.012;

interface CoffeeCupProps {
  width: number;
  height: number;
}

// Drawn with its top left corner at 0, 0. Only width sets its size; height is
// accepted so it can be used as a mess's drawing.
export default function CoffeeCup({ width }: CoffeeCupProps) {
  const middle = width / 2;
  const line = { stroke: COLORS.cupLine, strokeWidth: LINE_WIDTH * width };

  return (
    <Group>
      <Circle x={middle} y={middle} radius={RIM_RADIUS * width} fill={COLORS.cupRim} {...line} />
      <Circle x={middle} y={middle} radius={LID_RADIUS * width} fill={COLORS.cupLid} {...line} />
      <Circle x={LID_RING.x * width} y={LID_RING.y * width} radius={LID_RING.radius * width} {...line} />

      {/* Drawn after the lid's ring, so the spout sits on top of it. */}
      <Line
        points={SPOUT.flatMap(([x, y]) => [x * width, y * width])}
        closed
        fill={COLORS.cupLid}
        lineJoin="round"
        {...line}
      />
      <Rect
        x={SLOT.x * width}
        y={SLOT.y * width}
        width={SLOT.width * width}
        height={SLOT.height * width}
        cornerRadius={(SLOT.height / 2) * width}
        fill={COLORS.cupLine}
      />

      <Circle x={VENT.x * width} y={VENT.y * width} radius={VENT.radius * width} fill={COLORS.cupLine} />
    </Group>
  );
}
