import type { ReactNode } from 'react';
import { Group, Line, Rect } from 'react-konva';
import { COLORS } from '../../../theme';
import { BOOK } from '../journalContent';

interface JournalBookProps {
  // The width to draw at. The height follows, to keep the book's shape.
  width: number;
  // Drawn on the pages, laid out in BOOK's units.
  children?: ReactNode;
}

// The open book, shared by the docked journal and the full overlay.
export default function JournalBook({ width, children }: JournalBookProps) {
  const scale = width / BOOK.width;

  return (
    <Group scaleX={scale} scaleY={scale}>
      <Rect width={BOOK.width} height={BOOK.height} cornerRadius={BOOK.cornerRadius} fill={COLORS.journalCover} />
      <Rect
        x={BOOK.border}
        y={BOOK.border}
        width={BOOK.width - BOOK.border * 2}
        height={BOOK.height - BOOK.border * 2}
        cornerRadius={BOOK.pageCornerRadius}
        fill={COLORS.paper}
      />
      <Line
        points={[BOOK.dividerX, BOOK.dividerTop, BOOK.dividerX, BOOK.dividerBottom]}
        stroke={COLORS.divider}
        strokeWidth={2}
      />
      {children}
    </Group>
  );
}
