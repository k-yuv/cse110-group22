import type { ActivityId } from '../../services/progress';

export const ACTIVITY_LABELS: Record<ActivityId, string> = {
  articles: 'Online Articles',
  social: 'Social Media Posts',
  interviews: 'Interviews',
  aiMinigame: 'AI Images',
  deskMinigame: 'TO DO: clean desk!',
};

export const CREATE_ARTICLE_LABEL = 'Create Article';

export const LOCKED_TEXT = 'Must gather more evidence';
export const DONE_TEXT = 'Done!';

// Where an item sits on the desk, relative to the desk's size so the layout
// works at any window size:
// - x, y: the item's center as a fraction of the desk's width and height
//   (0.5, 0.5 is the middle of the screen).
// - width: a fraction of the desk's size. Everything inside an item is drawn
//   in proportion to its width, so it keeps its shape.
// - rotation: degrees clockwise.
export interface Placement {
  x: number;
  y: number;
  width: number;
  rotation: number;
}

// The same placement converted to pixels for the current window.
export type PixelPlacement = Placement;

// Where a sticky note sits on an item, as fractions of that item's width,
// measured from its top left corner.
export interface NotePlacement {
  x: number;
  y: number;
  rotation: number;
}

export interface FolderLayout extends Placement {
  note: NotePlacement;
}

export const FOLDER_LAYOUT: Record<'articles' | 'social' | 'interviews', FolderLayout> = {
  articles: { x: 0.23, y: 0.36, width: 0.2, rotation: -12, note: { x: 0.5, y: 0.62, rotation: 8 } },
  social: { x: 0.48, y: 0.47, width: 0.2, rotation: 22, note: { x: 0.08, y: 0.88, rotation: -8 } },
  interviews: { x: 0.73, y: 0.45, width: 0.2, rotation: 8, note: { x: 0.38, y: 0.64, rotation: 6 } },
};

export const MINIGAME_LAYOUT: Record<'aiMinigame' | 'deskMinigame', Placement> = {
  aiMinigame: { x: 0.15, y: 0.66, width: 0.19, rotation: -12 },
  deskMinigame: { x: 0.9, y: 0.53, width: 0.12, rotation: -3 },
};

export const CREATE_ARTICLE_LAYOUT: Placement = { x: 0.84, y: 0.94, width: 0.28, rotation: 0 };
