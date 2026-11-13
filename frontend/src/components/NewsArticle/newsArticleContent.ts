export const TODO_TEXT = 'TO DO: highlight misinformation';
export const TRANSCRIPT_TITLE = 'Trusted transcript';
export const SUBMIT_LABEL = 'Submit';
export const CONTINUE_LABEL = 'Continue';
// Named in the back confirmation's message.
export const ACTIVITY_NAME = 'Online Articles';

export const COLORS = {
  background: '#86624f',
  card: '#fff6df',
  highlight: '#fff176',
  text: '#000000',
};

export const FONT = 'Georgia, serif';

// Where each part sits, as fractions of the window, like the desk (see
// deskContent.ts): x and y are the top left corner, unless named center.
export const TRANSCRIPT_LAYOUT = { x: 0.06, y: 0.2, width: 0.32, height: 0.5 };

// Where the highlighter rests. Its image is square, sized as a fraction of
// the window's height.
export const HIGHLIGHTER_LAYOUT = { centerX: 0.5, y: 0.86, size: 0.12 };

// Where the tip is in Highlighter.png, as fractions of its size. While it's
// held, the tip sits on the mouse pointer.
export const HIGHLIGHTER_TIP = { x: 0.13, y: 0.05 };

// How dark the outline left behind is (Highlighter-Outline.png is a black
// silhouette of Highlighter.png).
export const OUTLINE_OPACITY = 0.35;

// The newspaper is as big as it can be within maxWidth and maxHeight while
// keeping its image's shape (Newspaper-Template-2.png is 494 x 619 px).
export const NEWSPAPER_LAYOUT = { centerX: 0.7, y: 0.1, maxWidth: 0.42, maxHeight: 0.76, aspect: 494 / 619 };

// The blank column under "BREAKING NEWS" where the sentences go, as fractions
// of the newspaper image's size.
export const ARTICLE_COLUMN = { x: 0.09, y: 0.525, width: 0.34, height: 0.31 };
