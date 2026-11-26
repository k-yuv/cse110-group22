import { describe, it, expect } from 'vitest';
import {
  CLEAN_THRESHOLD,
  SCRUB_WIDTHS,
  canClean,
  isDeskClean,
  needsScrubbing,
  overlaps,
  placeMesses,
  placeRandomly,
  randomRotation,
  scrub,
  starArcPoint,
  startingDirtiness,
  type Area,
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

// A fake Math.random that returns these numbers in order, then repeats.
function randomFrom(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

const SMALL = { halfWidth: 0.1, halfHeight: 0.1 };
const LEFT_HALF: Area = { left: 0, top: 0, right: 0.5, bottom: 1 };

describe('placeRandomly', () => {
  it('keeps every box fully inside the window, even at the extremes', () => {
    const [lowest] = placeRandomly([SMALL], [], () => 0);
    const [highest] = placeRandomly([SMALL], [], () => 0.999999);

    expect(lowest).toEqual({ x: 0.1, y: 0.1 });
    expect(highest.x).toBeCloseTo(0.9);
    expect(highest.y).toBeCloseTo(0.9);
  });

  it('tries again when a spot lands on a blocked area', () => {
    // First try: x = 0.1 (in the left half). Second try: x = 0.9.
    const [spot] = placeRandomly([SMALL], [LEFT_HALF], randomFrom([0, 0.5, 1, 0.5]));

    expect(spot.x).toBeCloseTo(0.9);
  });

  it('keeps boxes from overlapping each other', () => {
    // Both boxes first try the same spot in the middle.
    const [first, second] = placeRandomly([SMALL, SMALL], [], randomFrom([0.5, 0.5, 0.5, 0.5, 0, 0]));

    expect(first).toEqual({ x: 0.5, y: 0.5 });
    expect(second).toEqual({ x: 0.1, y: 0.1 });
  });

  it('still places a box if there is no free spot', () => {
    const everywhere: Area = { left: 0, top: 0, right: 1, bottom: 1 };

    expect(placeRandomly([SMALL], [everywhere], () => 0.5)).toEqual([{ x: 0.5, y: 0.5 }]);
  });
});

describe('overlaps', () => {
  it('only counts boxes that share some space', () => {
    expect(overlaps(LEFT_HALF, { left: 0.4, top: 0, right: 0.6, bottom: 1 })).toBe(true);
    expect(overlaps(LEFT_HALF, { left: 0.5, top: 0, right: 1, bottom: 1 })).toBe(false);
  });
});

describe('randomRotation', () => {
  it('turns anywhere between maxTurn either way', () => {
    expect(randomRotation(90, () => 0)).toBe(-90);
    expect(randomRotation(90, () => 0.5)).toBe(0);
    expect(randomRotation(90, () => 1)).toBe(90);
  });
});

describe('placeMesses', () => {
  const CUP = { id: 'cup', size: 0.2, aspect: 1 };
  const RING = { id: 'ring', size: 0.4, aspect: 1, under: 'cup' };

  it('puts a mess that sits under another one at the same spot, turned its own way', () => {
    const placements = placeMesses([RING, CUP], 1, [], randomFrom([0.25, 0.75, 0.3]));

    expect(placements.ring.x).toBe(placements.cup.x);
    expect(placements.ring.y).toBe(placements.cup.y);
    expect(placements.ring.rotation).toBe(-90);
    expect(placements.cup.rotation).toBe(90);
  });

  it('keeps the bigger of the two inside the window', () => {
    // Turned all the way round (-180), which takes the same room as not
    // turned. The ring is the bigger one: half of 0.4 is 0.2 from every edge.
    const { cup } = placeMesses([RING, CUP], 1, [], () => 0);

    expect(cup.x).toBeCloseTo(0.2);
    expect(cup.y).toBeCloseTo(0.2);
  });

  it("uses the window's shape, since sizes are fractions of its height", () => {
    // On a window twice as wide as tall, 0.2 of the height is 0.1 of the width.
    const { cup } = placeMesses([CUP], 2, [], () => 0);

    expect(cup.x).toBeCloseTo(0.05);
    expect(cup.y).toBeCloseTo(0.1);
  });

  it('only turns a mess as far as its maxTurn', () => {
    const envelope = { id: 'envelope', size: 0.2, aspect: 0.75, maxTurn: 90 };

    for (const value of [0, 0.2, 0.5, 0.8, 0.999]) {
      const { rotation } = placeMesses([envelope], 1, [], () => value).envelope;
      expect(Math.abs(rotation)).toBeLessThanOrEqual(90);
    }
  });

  it('spaces a turned mess by its turned size', () => {
    // A wide, short mess turned on its side (-90) is tall and narrow instead.
    const wide = { id: 'wide', size: 0.4, aspect: 0.5, maxTurn: 90 };

    const { x, y } = placeMesses([wide], 1, [], () => 0).wide;

    expect(x).toBeCloseTo(0.1);
    expect(y).toBeCloseTo(0.2);
  });
});

describe('starArcPoint', () => {
  const ARC = { travel: 0.7, peak: 0.6 };
  const END_BELOW = 0.1;

  it('starts at the bottom left corner', () => {
    expect(starArcPoint(0, ARC, END_BELOW, 'left')).toEqual({ x: 0, y: 1 });
  });

  it('lands its travel across the screen, below the bottom edge', () => {
    const { x, y } = starArcPoint(1, ARC, END_BELOW, 'left');

    expect(x).toBeCloseTo(0.7);
    expect(y).toBeCloseTo(1.1);
  });

  it('rises about its peak above the bottom halfway along', () => {
    const { x, y } = starArcPoint(0.5, ARC, END_BELOW, 'left');

    expect(x).toBeCloseTo(0.35);
    expect(y).toBeCloseTo(1 + 0.05 - 0.6);
  });

  it('lands further across for a longer travel', () => {
    const near = starArcPoint(1, { travel: 0.65, peak: 0.6 }, END_BELOW, 'left');
    const far = starArcPoint(1, { travel: 0.75, peak: 0.6 }, END_BELOW, 'left');

    expect(far.x - near.x).toBeCloseTo(0.1);
  });

  it('mirrors the arc from the bottom right corner', () => {
    expect(starArcPoint(0, ARC, END_BELOW, 'right')).toEqual({ x: 1, y: 1 });

    for (const progress of [0.25, 0.5, 1]) {
      const left = starArcPoint(progress, ARC, END_BELOW, 'left');
      const right = starArcPoint(progress, ARC, END_BELOW, 'right');
      expect(right.x).toBeCloseTo(1 - left.x);
      expect(right.y).toBeCloseTo(left.y);
    }
  });
});
