import { describe, it, expect } from 'vitest';
import {
  CLEAN_THRESHOLD,
  SCRUB_WIDTHS,
  canClean,
  isDeskClean,
  needsScrubbing,
  scrub,
  startingDirtiness,
  type Mess,
} from '../deskCleanupRules';

const DONUT: Mess = { id: 'donut', tool: 'trash' };
const MAIL: Mess = { id: 'mail', tool: 'shredder' };
const STAIN: Mess = { id: 'stain', tool: 'sponge' };

// How far the sponge has to move to fully scrub a stain this wide.
const WIDTH = 100;
const FULL_SCRUB = WIDTH * SCRUB_WIDTHS;

describe('startingDirtiness', () => {
  it('starts every mess fully dirty', () => {
    expect(startingDirtiness([DONUT, MAIL, STAIN])).toEqual({ donut: 1, mail: 1, stain: 1 });
  });
});

describe('canClean', () => {
  it('cleans with the matching tool', () => {
    expect(canClean(DONUT, 'trash')).toBe(true);
    expect(canClean(MAIL, 'shredder')).toBe(true);
    expect(canClean(STAIN, 'sponge')).toBe(true);
  });

  it('does nothing with the wrong tool or no tool', () => {
    expect(canClean(DONUT, 'sponge')).toBe(false);
    expect(canClean(MAIL, 'trash')).toBe(false);
    expect(canClean(STAIN, null)).toBe(false);
  });
});

describe('needsScrubbing', () => {
  it('scrubs sponge messes and clicks the rest', () => {
    expect(needsScrubbing(STAIN)).toBe(true);
    expect(needsScrubbing(DONUT)).toBe(false);
    expect(needsScrubbing(MAIL)).toBe(false);
  });
});

describe('scrub', () => {
  it('lowers dirtiness by how far the sponge moved, compared to the stain size', () => {
    expect(scrub(1, FULL_SCRUB / 4, WIDTH)).toBeCloseTo(0.75);
    expect(scrub(0.75, FULL_SCRUB / 4, WIDTH)).toBeCloseTo(0.5);
  });

  it('takes longer on a bigger stain', () => {
    expect(scrub(1, 30, WIDTH * 2)).toBeGreaterThan(scrub(1, 30, WIDTH));
  });

  it('finishes cleaning once the stain is faint enough', () => {
    const almostClean = CLEAN_THRESHOLD + 0.01;
    expect(scrub(almostClean, FULL_SCRUB * 0.02, WIDTH)).toBe(0);
  });

  it('stops at clean when the sponge moves further than needed', () => {
    expect(scrub(1, FULL_SCRUB * 2, WIDTH)).toBe(0);
  });

  it('leaves the stain alone if it has no width', () => {
    expect(scrub(0.6, 50, 0)).toBe(0.6);
  });
});

describe('isDeskClean', () => {
  it('is clean only when every mess is clean', () => {
    expect(isDeskClean({ donut: 0, mail: 0, stain: 0 })).toBe(true);
    expect(isDeskClean({ donut: 0, mail: 0, stain: 0.3 })).toBe(false);
    expect(isDeskClean({ donut: 1, mail: 1, stain: 1 })).toBe(false);
  });
});
