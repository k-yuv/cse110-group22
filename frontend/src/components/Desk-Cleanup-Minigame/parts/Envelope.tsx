import { Group, Line, Rect } from 'react-konva';
import { COLORS } from '../../../theme';

// The envelope's height / width, so it keeps its shape at any size.
export const ENVELOPE_ASPECT = 283 / 375;

// Where the flap's lines go, as fractions of the envelope's width and height,
// measured from envelope reference.jpg. The flap runs from the top corners
// down to a point a little below the middle, and two lines run from its
// sides down to the bottom corners.
const FLAP = [
  [0.02, 0.06],
  [0.36, 0.43],
  [0.49, 0.54],
  [0.64, 0.43],
  [0.97, 0.05],
];
const LEFT_FOLD = [
  [0.36, 0.43],
  [0.03, 0.95],
];
const RIGHT_FOLD = [
  [0.64, 0.43],
  [0.97, 0.94],
];

interface EnvelopeProps {
  width: number;
  height: number;
  color?: string;
}

// An envelope drawn with Konva shapes, with its top left corner at 0, 0.
// Green unless another color is given.
export default function Envelope({ width, height, color = COLORS.envelopeGreen }: EnvelopeProps) {
  // Fractions to pixels, flattened the way Konva's Line wants its points.
  const toPoints = (points: number[][]) => points.flatMap(([x, y]) => [x * width, y * height]);
  const line = {
    stroke: COLORS.envelopeLine,
    strokeWidth: width * 0.016,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  };

  return (
    <Group>
      <Rect width={width} height={height} cornerRadius={width * 0.03} fill={color} />
      <Line points={toPoints(FLAP)} {...line} />
      <Line points={toPoints(LEFT_FOLD)} {...line} />
      <Line points={toPoints(RIGHT_FOLD)} {...line} />
    </Group>
  );
}

type SizeProps = Omit<EnvelopeProps, 'color'>;

// The same envelope in each color, ready to use as a mess's drawing.
export function RedEnvelope(props: SizeProps) {
  return <Envelope {...props} color={COLORS.envelopeRed} />;
}

export function BlueEnvelope(props: SizeProps) {
  return <Envelope {...props} color={COLORS.envelopeBlue} />;
}
