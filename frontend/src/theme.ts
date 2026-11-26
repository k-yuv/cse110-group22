import type { CSSProperties } from 'react';

// Colors and fonts shared by every screen. Add new colors here rather than
// defining them inside a component, so screens stay consistent.
export const COLORS = {
  // Desk
  desk: '#86624f',
  folder: '#fff6df',
  doneNote: '#f29b9b',
  lockedNote: '#f6dbd1',
  todoNote: '#cdeab5',
  photoFrame: '#f2f2f7',
  photo: '#e9a0c5',
  minigameBadge: '#f25757',
  createArticle: '#ffffff',
  pen: '#2b2b2b',
  hoverGlow: '#fff2a8',
  text: '#000000',

  // Article writing
  wall: '#fff6df',
  journalCover: '#553a16',
  journalNote: '#f7ddd0',
  journalText: '#4c2100',
  journalButton: '#d9d9d9',
  paper: '#f5fcfc',
  divider: '#c8c8c8',
  laptop: '#222222',
  card: '#ffffff',
  cardSelected: '#f3d9a4',
  mutedText: '#555555',
  progressBar: '#df831a',
  progressBorder: '#4c2100',
  progressDone: '#ffb404',
  progressTodo: '#fff7dd',
  error: '#b00020',

  // Endings
  endingPanel: '#fffdf6',
  endingHeadline: '#4c2100',
  endingFloor: '#c9a27e',
  endingWood: '#8a5a3b',
  endingWoodDark: '#5e3a22',
  endingNight: '#22305a',
  catFur: '#8d939c',
  catFurDark: '#5f646c',
  catInnerEar: '#f2b8c6',
  catEye: '#fff7c2',
  shirt: '#ffffff',
  tie: '#c0392b',
  nameplate: '#e3b341',
  handcuffs: '#c7ccd4',
  sirenRed: '#ff3b3b',
  sirenBlue: '#3b8bff',
  streetWall: '#b9c0cc',
  // Edge colour of GoodEnding.png, shown around the image if it doesn't fill the screen.
  goodEndingBackdrop: '#32313b',
  streetBrick: '#a3abb8',
  sidewalk: '#8f96a3',
  titleButtonFill: '#F7FCFD',
  titleButtonStroke: '#6FB3F3',
  // Back button
  backButton: '#6e4440',
  backButtonArrow: '#ffffff',
  backButtonHover: '#7a4e4a',

  // Popups, matching Settings and the title screen buttons
  overlay: 'rgba(0, 0, 0, 0.6)',
  popupBox: '#f7fcfd',
  popupBorder: '#6fb3f3',
  popupText: '#4c2100',

  // Back confirmation
  goBackButton: '#e39a90',
  stayButton: '#7dbe87',
  goBackButtonHover: '#d98b81',
  stayButtonHover: '#6fb07a',
};

// Display font used by the title screen and endings (loaded in index.html).
export const DISPLAY_FONT = 'Coiny, Arial, sans-serif';

// Konva's default font, which the desk uses for all its text.
export const FONT = 'Arial, sans-serif';

// The large brown button: Continue, News Article's buttons.
export const BUTTON_STYLE: CSSProperties = {
    padding: '14px 48px',
    border: 'none',
    borderRadius: 10,
    background: COLORS.journalButton,
    color: COLORS.journalText,
    fontFamily: FONT,
    fontSize: 22,
    cursor: 'pointer',
};
