import type { Box, JournalPlacement } from './journalContent';
import { BOOK } from './journalContent';
import { GLOW_BLUR_RATIO, HOVER_SCALE } from '../Desk/parts/HoverSpotlight';

// How much room a docked journal needs around it, as a share of its width, so
// its hover glow isn't cut off by the canvas edge: the growth on each side plus
// the glow's spread (which grows with it). The book is wider than it is tall,
// so its width is the side the glow follows.
export const HOVER_MARGIN = (HOVER_SCALE - 1) / 2 + GLOW_BLUR_RATIO * HOVER_SCALE;

// The part of the window a docked journal covers, in pixels: the box around the
// rotated book, cut off at the window's edges. Its canvas is only this big, so
// the screen underneath keeps its clicks everywhere else.
export function dockBounds(
  { x, y, width: widthFraction, rotation }: JournalPlacement,
  windowWidth: number,
  windowHeight: number,
  sizeUnit: number,
): Box {
  const width = widthFraction * sizeUnit;
  const height = (width * BOOK.height) / BOOK.width;
  const angle = (rotation * Math.PI) / 180;
  const margin = width * HOVER_MARGIN;
  const halfWidth = (Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle))) / 2 + margin;
  const halfHeight = (Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle))) / 2 + margin;

  const left = Math.max(0, x * windowWidth - halfWidth);
  const top = Math.max(0, y * windowHeight - halfHeight);
  const right = Math.min(windowWidth, x * windowWidth + halfWidth);
  const bottom = Math.min(windowHeight, y * windowHeight + halfHeight);

  return { x: left, y: top, width: right - left, height: bottom - top };
}
