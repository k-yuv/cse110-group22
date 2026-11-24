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
