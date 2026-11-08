export const OPEN_LABEL = 'Open journal';
export const CLOSE_LABEL = 'Close';
export const PREVIOUS_LABEL = '‹ Previous';
export const NEXT_LABEL = 'Next ›';
export const DIALOG_LABEL = 'Journal';
export const EMPTY_TEXT = 'No evidence yet.';
export const LOADING_TEXT = 'Loading...';
export const LOAD_ERROR_TEXT = 'Could not load the journal';
export const RETRY_LABEL = 'Try again';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Where a docked journal sits: x and y are its center as fractions of the
// window, and width is a fraction of the window's size unit.
export interface JournalPlacement {
  x: number;
  y: number;
  width: number;
  rotation: number;
  label: string;
}

// desk matches the Central View Figma frame, running off the bottom of the
// window. corner matches Journal-Corner-View.png, for the activity screens.
export const JOURNAL_PLACEMENTS = {
  desk: { x: 0.4875, y: 0.925, width: 0.353, rotation: 0, label: 'Evidence' },
  corner: { x: 0.055, y: 0.945, width: 0.386, rotation: 12, label: 'Journal' },
} satisfies Record<string, JournalPlacement>;

export type JournalPlacementName = keyof typeof JOURNAL_PLACEMENTS;

// Same limit as the desk: on a short, wide window, sizes follow the height.
export const MAX_WIDTH_TO_HEIGHT = 1.5;

// The book as drawn in the Journal Figma frame. Everything inside it is laid
// out in these units, then scaled to fit.
export const BOOK = {
  width: 578,
  height: 426,
  cornerRadius: 30,
  border: 22,
  pageCornerRadius: 12,
  dividerX: 289,
  dividerTop: 76,
  dividerBottom: 354,
};

// The sticky note on the docked book.
export const DOCK_NOTE = { x: 471, y: 64, size: 134, rotation: 12, fontSize: 26 };

// The open book's evidence notes: the left page fills, then the right page.
export const PAGE_X = [50, 313];
export const NOTES_TOP = 60;
export const NOTE = { width: 215, height: 86, gap: 8, padding: 10 };
export const NOTES_PER_PAGE = 3;
export const NOTES_PER_SPREAD = NOTES_PER_PAGE * PAGE_X.length;

// The open journal: the book, with its buttons in a row below it.
export const OVERLAY = {
  height: 492,
  windowFraction: 0.9,
  backdrop: 'rgba(0, 0, 0, 0.6)',
  pageLabelTop: 366,
  buttonsTop: 444,
  buttonHeight: 48,
  closeX: 186,
  closeWidth: 206,
  pageButtonWidth: 150,
  buttonFontSize: 24,
  pageLabelFontSize: 16,
  zIndex: 1000,
};
