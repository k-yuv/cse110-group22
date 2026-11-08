import type { CSSProperties } from 'react';

// Small helpers shared by more than one screen.

// Hidden from sight but available to screen readers and tests. Canvas screens
// use it for real HTML copies of what they draw, since nothing inside a canvas
// is readable.
export const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

// Splits a list into pages. There's always at least one page, even when empty.
export function paginate<T>(items: readonly T[], perPage: number): T[][] {
  const pages: T[][] = [];

  for (let start = 0; start < items.length; start += perPage) {
    pages.push(items.slice(start, start + perPage));
  }

  return pages.length > 0 ? pages : [[]];
}
