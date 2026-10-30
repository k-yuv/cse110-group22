import { Rect, Text } from 'react-konva';
import DeskItem from './DeskItem';
import StickyNote from './StickyNote';
import { COLORS, DONE_TEXT, LOCKED_TEXT, type NotePlacement, type PixelPlacement } from '../deskContent';

interface FolderProps {
  label: string;
  placement: PixelPlacement;
  note: NotePlacement;
  done: boolean;
  locked: boolean;
  onClick: () => void;
}

// A manila folder for one of the main activities, with a sticky note on it
// when it is locked or done.
export default function Folder({ label, placement, note, done, locked, onClick }: FolderProps) {
  const w = placement.width;
  const h = w * 1.32;
  const noteProps = { x: note.x * w, y: note.y * w, rotation: note.rotation, size: w * 0.44 };

  return (
    <DeskItem name={label} placement={placement} height={h} onClick={onClick}>
      <Rect x={w * 0.92} y={w * 0.24} width={w * 0.18} height={w * 0.6} cornerRadius={w * 0.024} fill={COLORS.folder} />
      <Rect
        width={w}
        height={h}
        cornerRadius={w * 0.024}
        fill={COLORS.folder}
        shadowColor="black"
        shadowOpacity={0.15}
        shadowBlur={w * 0.03}
      />
      <Text
        text={label}
        x={w * 0.12}
        y={w * 0.28}
        width={w * 0.76}
        align="center"
        fontSize={w * 0.104}
        fontStyle="bold"
        fill={COLORS.text}
      />

      {locked && <StickyNote text={LOCKED_TEXT} color={COLORS.lockedNote} {...noteProps} />}
      {done && <StickyNote text={DONE_TEXT} color={COLORS.doneNote} {...noteProps} fontScale={0.2} />}
    </DeskItem>
  );
}
