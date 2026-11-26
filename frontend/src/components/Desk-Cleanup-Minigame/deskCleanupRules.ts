export type ToolId = 'sponge' | 'trash' | 'shredder';

export interface Mess {
  id: string;
  tool: ToolId;
}

// How dirty each mess is, by id: 1 is fully dirty, 0 is clean.
export type Dirtiness = Record<string, number>;

// Scrubbing a stain clean requires moving the sponge * many times the stain's
// width, so cleaning is proportional to size
export const SCRUB_WIDTHS = 3;

// When the stain is close to being done, it is fnished the rest of the way automatically
export const CLEAN_THRESHOLD = 0.05;

// Every mess starts fully dirty.
export function startingDirtiness(messes: readonly Mess[]): Dirtiness {
  return Object.fromEntries(messes.map((mess) => [mess.id, 1]));
}

// Each mess has one tool that cleans it. The wrong tool, or no tool, does nothing.
export function canClean(mess: Mess, heldTool: ToolId | null): boolean {
  return heldTool === mess.tool;
}

// The sponge click and drags to clean. Every other tool cleans with one click.
export function needsScrubbing(mess: Mess): boolean {
  return mess.tool === 'sponge';
}

// Lowers a stain's dirtiness by how far the sponge moved over it.
export function scrub(dirtiness: number, distance: number, messWidth: number): number {
  if (messWidth <= 0) return dirtiness;

  const next = dirtiness - distance / (messWidth * SCRUB_WIDTHS);
  return next <= CLEAN_THRESHOLD ? 0 : next;
}

export function isDeskClean(dirtiness: Dirtiness): boolean {
  return Object.values(dirtiness).every((value) => value === 0);
}

// Random placement. Everything here is in fractions of the window (0 to 1),
// so it works at any window size.

// A rectangle on screen, by its edges.
export interface Area {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// How far a box reaches from its center, as fractions of the window's width
// and height.
export interface HalfSize {
  halfWidth: number;
  halfHeight: number;
}

// Where a box's center goes.
export interface Spot {
  x: number;
  y: number;
}

// Where a mess's center goes, and how far it's turned, in degrees clockwise.
export interface Placement extends Spot {
  rotation: number;
}

// What placing a mess needs to know. size is its width as a fraction of the
// window's height, and aspect its height / width (see deskCleanupContent.ts).
// A mess with under sits under that mess, at the same spot. maxTurn is how
// far it can be turned either way, in degrees (any angle if left out).
export interface MessShape {
  id: string;
  size: number;
  aspect: number;
  under?: string;
  maxTurn?: number;
}

// A random angle between -maxTurn and maxTurn degrees.
export function randomRotation(maxTurn: number, random: () => number): number {
  return (random() * 2 - 1) * maxTurn;
}

// How many random spots to try for each mess before giving up and using the
// last one, so placing never gets stuck.
export const PLACEMENT_TRIES = 100;

function areaAround({ x, y }: Spot, { halfWidth, halfHeight }: HalfSize): Area {
  return { left: x - halfWidth, top: y - halfHeight, right: x + halfWidth, bottom: y + halfHeight };
}

export function overlaps(a: Area, b: Area): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

// Picks a random spot for each box, in order. Every box stays fully inside the
// window (its center is at least half its size from each edge), and tries to
// stay off the blocked areas and the boxes already placed.
export function placeRandomly(sizes: readonly HalfSize[], blocked: readonly Area[], random: () => number): Spot[] {
  const taken = [...blocked];

  return sizes.map((size) => {
    let spot: Spot = { x: 0.5, y: 0.5 };
    for (let tries = 0; tries < PLACEMENT_TRIES; tries++) {
      spot = {
        x: size.halfWidth + random() * (1 - 2 * size.halfWidth),
        y: size.halfHeight + random() * (1 - 2 * size.halfHeight),
      };
      if (!taken.some((area) => overlaps(area, areaAround(spot, size)))) break;
    }
    taken.push(areaAround(spot, size));
    return spot;
  });
}

// The celebration when the desk is clean: stars shoot out of a bottom corner
// in an arc and fall back down off screen.

// One star's arc, as fractions of the window: how far across the screen it
// lands, and how high above the bottom the arc rises.
export interface StarArc {
  travel: number;
  peak: number;
}

// Which bottom corner a star shoots out of.
export type Side = 'left' | 'right';

// Where a star is partway along its arc, from progress 0 (leaving its bottom
// corner) to 1 (landing). It lands endBelow under the bottom edge, so it ends
// fully off screen. A parabola, like something thrown. From the right corner
// it's the same arc, mirrored.
export function starArcPoint(progress: number, { travel, peak }: StarArc, endBelow: number, side: Side): Spot {
  const across = travel * progress;
  return {
    x: side === 'left' ? across : 1 - across,
    y: 1 + endBelow * progress - 4 * peak * progress * (1 - progress),
  };
}

// Places and turns every mess at random. A mess that sits under another one
// (a stain under the cup) goes wherever that one goes, turned its own way, and
// their spot is made big enough for the larger of the two. Spacing uses each
// mess's size once turned. windowAspect is the window's width / height, since
// sizes are fractions of the height.
export function placeMesses(
  messes: readonly MessShape[],
  windowAspect: number,
  blocked: readonly Area[],
  random: () => number,
): Record<string, Placement> {
  const rotations: Record<string, number> = Object.fromEntries(
    messes.map((mess) => [mess.id, randomRotation(mess.maxTurn ?? 180, random)]),
  );

  // How far a turned mess reaches from its center: the box around it once
  // turned, in fractions of the window.
  const halfSize = (mess: MessShape): HalfSize => {
    const radians = (rotations[mess.id] * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));
    const width = mess.size;
    const height = mess.size * mess.aspect;
    return {
      halfWidth: (width * cos + height * sin) / 2 / windowAspect,
      halfHeight: (width * sin + height * cos) / 2,
    };
  };

  const leaders = messes.filter((mess) => !mess.under);
  const sizes = leaders.map((leader) => {
    const group = [leader, ...messes.filter((mess) => mess.under === leader.id)].map(halfSize);
    return {
      halfWidth: Math.max(...group.map((size) => size.halfWidth)),
      halfHeight: Math.max(...group.map((size) => size.halfHeight)),
    };
  });

  const spots = placeRandomly(sizes, blocked, random);
  const leaderSpots: Record<string, Spot> = Object.fromEntries(leaders.map((leader, index) => [leader.id, spots[index]]));
  return Object.fromEntries(
    messes.map((mess) => [mess.id, { ...leaderSpots[mess.under ?? mess.id], rotation: rotations[mess.id] }]),
  );
}
