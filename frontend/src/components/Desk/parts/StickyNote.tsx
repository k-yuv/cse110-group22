import { Group, Rect, Text } from 'react-konva';
import { COLORS } from '../../../theme';

interface StickyNoteProps {
  text: string;
  color: string;
  x: number;
  y: number;
  size: number;
  rotation?: number;
  // As a fraction of the note's size.
  fontScale?: number;
}

export default function StickyNote({ text, color, x, y, size, rotation = 0, fontScale = 0.16 }: StickyNoteProps) {
  return (
    <Group x={x} y={y} rotation={rotation}>
      <Rect
        width={size}
        height={size}
        fill={color}
        shadowColor="black"
        shadowOpacity={0.2}
        shadowBlur={size * 0.05}
        shadowOffsetY={size * 0.03}
      />
      <Text
        text={text}
        width={size}
        height={size}
        padding={size * 0.09}
        align="center"
        verticalAlign="middle"
        fontSize={size * fontScale}
        fontStyle="bold"
        fill={COLORS.text}
      />
    </Group>
  );
}
