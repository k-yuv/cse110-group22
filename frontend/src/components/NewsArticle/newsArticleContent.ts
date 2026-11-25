export const TODO_TEXT = 'TO DO: Highlight sentences that are misleading or contain misinformation';
export const ADD_EVIDENCE_TODO_TEXT = 'TO DO: Add evidence to journal';
export const TRANSCRIPT_TITLE = 'UC Cat City Catnip Research Study';
export const SUBMIT_LABEL = 'Submit';
export const ADD_EVIDENCE_LABEL = 'Add Evidence to Journal';
export const CONTINUE_LABEL = 'Continue';
export const HINT_TEXT =
  'Compare each sentence in the newspaper to the research study. Pick up the highlighter and highlight the ' +
  'sentences that are misleading or misinformation.';
export const ADD_EVIDENCE_FIRST_MESSAGE = 'I need to add the evidence to my journal first';

// How long that message stays before it has faded away.
export const MESSAGE_SECONDS = 3;
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
export const ARTICLE_COLUMN = { x: 0.09, y: 0.5, width: 0.34, height: 0.34 };

// How many times taller the column's last row (s4) is than the others, since
// its sentence is the longest.
export const LAST_ROW_SCALE = 1.5;

// The blank space under the photo, where the last sentence goes, as fractions
// of the newspaper image's size.
export const UNDER_PHOTO = { x: 0.47, y: 0.785, width: 0.45, height: 0.14 };
