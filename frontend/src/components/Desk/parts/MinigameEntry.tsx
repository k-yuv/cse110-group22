import { Circle, Group, Rect, Text } from 'react-konva';
import DeskItem from './DeskItem';
import StickyNote from './StickyNote';
import { COLORS, DONE_TEXT, type PixelPlacement } from '../deskContent';

interface MinigameEntryProps {
  // 'photo' is the AI Images picture, 'todo' is the clean desk sticky note.
  variant: 'photo' | 'todo';
  label: string;
  placement: PixelPlacement;
  done: boolean;
  onClick: () => void;
}

function MinigameBadge({ x, y, radius }: { x: number; y: number; radius: number }) {
  return (
    <Group x={x} y={y}>
      <Circle radius={radius} fill={COLORS.minigameBadge} />
      <Text
        text="Minigame"
        x={-radius}
        y={-radius * 0.19}
        width={radius * 2}
        align="center"
        fontSize={radius * 0.37}
        fontStyle="bold"
        fill="white"
      />
    </Group>
  );
}

export default function MinigameEntry({ variant, label, placement, done, onClick }: MinigameEntryProps) {
  const w = placement.width;

  return (
    <DeskItem name={label} placement={placement} height={w} onClick={onClick}>
      {variant === 'photo' ? (
        <>
          <Rect width={w} height={w} fill={COLORS.photoFrame} shadowColor="black" shadowOpacity={0.15} shadowBlur={w * 0.03} />
          <Rect x={w * 0.125} y={w * 0.09} width={w * 0.75} height={w * 0.75} fill={COLORS.photo} />
          <StickyNote text={label} color={COLORS.lockedNote} x={w * 0.25} y={w * 0.25} size={w * 0.5} rotation={-15} fontScale={0.2} />
          <MinigameBadge x={0} y={0} radius={w * 0.16} />
        </>
      ) : (
        <>
          <StickyNote text={label} color={COLORS.todoNote} x={0} y={0} size={w} fontScale={0.147} />
          <MinigameBadge x={w * 0.93} y={0} radius={w * 0.25} />
        </>
      )}

      {done && (
        <StickyNote text={DONE_TEXT} color={COLORS.doneNote} x={w * 0.65} y={w * 0.7} size={w * 0.4} rotation={8} fontScale={0.22} />
      )}
    </DeskItem>
  );
}
