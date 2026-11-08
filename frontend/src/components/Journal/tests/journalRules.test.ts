import { describe, it, expect } from 'vitest';
import { BOOK, JOURNAL_PLACEMENTS } from '../journalContent';
import { dockBounds, HOVER_MARGIN } from '../journalRules';

describe('dockBounds', () => {
  const WINDOW = { width: 1280, height: 832 };

  function boundsFor(name: keyof typeof JOURNAL_PLACEMENTS) {
    return dockBounds(JOURNAL_PLACEMENTS[name], WINDOW.width, WINDOW.height, WINDOW.width);
  }

  it.each(['desk', 'corner'] as const)('keeps the %s journal inside the window', (name) => {
    const { x, y, width, height } = boundsFor(name);

    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(x + width).toBeLessThanOrEqual(WINDOW.width);
    expect(y + height).toBeLessThanOrEqual(WINDOW.height);
  });

  it('leaves room for the hover glow around an unrotated journal', () => {
    const placement = { x: 0.5, y: 0.5, width: 0.2, rotation: 0, label: '' };
    const { width, height } = dockBounds(placement, 1000, 1000, 1000);
    const margin = 200 * HOVER_MARGIN;

    expect(width).toBeCloseTo(200 + 2 * margin);
    expect(height).toBeCloseTo((200 * BOOK.height) / BOOK.width + 2 * margin);
  });

  it('fits the whole glow and hover growth inside the margin', () => {
    // Growth on one side plus the glow's spread at the grown size.
    expect(HOVER_MARGIN).toBeGreaterThanOrEqual((1.06 - 1) / 2 + 0.15 * 1.06);
  });

  it('is cut off at the bottom when the journal runs off the window', () => {
    const { y, height } = boundsFor('desk');

    expect(y + height).toBe(WINDOW.height);
  });

  it('is bigger when rotated, to fit the corners', () => {
    const placement = { x: 0.5, y: 0.5, width: 0.2, rotation: 0, label: '' };

    const flat = dockBounds(placement, 1000, 1000, 1000);
    const rotated = dockBounds({ ...placement, rotation: 12 }, 1000, 1000, 1000);

    expect(rotated.height).toBeGreaterThan(flat.height);
  });
});
