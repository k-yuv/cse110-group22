import type { Mess, ToolId } from './deskCleanupRules';
import donutImage from '../../assets/donut-Cleanup.png';
import paperBallImage from '../../assets/paper-ball-Cleanup.png';
import cupImage from '../../assets/Coffee-cup-Cleanup.png';
import mailImage from '../../assets/Shred-mail-Cleanup.png';
import coffeeRingImage from '../../assets/Coffee-Stain1-Cleanup.png';
import coffeeSplashImage from '../../assets/Coffee-Stain2-Cleanup.png';
import spongeImage from '../../assets/Sponge-Cleanup.png';
import trashImage from '../../assets/trash-can-Cleanup.png';
import shredderImage from '../../assets/Shredder-Cleanup.png';

export const TODO_TEXT = 'TO DO: Cleanup desk';
export const CONTINUE_LABEL = 'Continue';
export const STILL_DIRTY_MESSAGE = 'I still have stuff to clean';

// How long the message stays before it has faded away.
export const MESSAGE_SECONDS = 3;

// Where something sits, relative to the window so the layout works at any
// window size:
// - x, y: its center as a fraction of the window's width and height.
// - size: its width as a fraction of the window's height. Its height comes
//   from aspect (the image's height / width), so it keeps its shape.
export interface DeskPlacement {
  x: number;
  y: number;
  size: number;
  aspect: number;
}

export interface DeskMess extends Mess, DeskPlacement {
  image: string;
}

// Every mess on the desk and the tool that cleans it. Drawn in this order, so
// the stains come first and sit under the cup and the donut.
export const MESSES: DeskMess[] = [
  { id: 'coffeeRing', tool: 'sponge', image: coffeeRingImage, x: 0.12, y: 0.5, size: 0.18, aspect: 715 / 728 },
  { id: 'coffeeSplash', tool: 'sponge', image: coffeeSplashImage, x: 0.25, y: 0.22, size: 0.32, aspect: 364 / 430 },
  { id: 'donut', tool: 'trash', image: donutImage, x: 0.25, y: 0.2, size: 0.24, aspect: 1768 / 2500 },
  { id: 'paperBall1', tool: 'trash', image: paperBallImage, x: 0.6, y: 0.15, size: 0.13, aspect: 1 },
  { id: 'paperBall2', tool: 'trash', image: paperBallImage, x: 0.72, y: 0.14, size: 0.13, aspect: 1 },
  { id: 'cup', tool: 'trash', image: cupImage, x: 0.12, y: 0.5, size: 0.17, aspect: 248 / 250 },
  { id: 'mail', tool: 'shredder', image: mailImage, x: 0.84, y: 0.45, size: 0.3, aspect: 1 },
];

export interface DeskTool {
  id: ToolId;
  image: string;
  aspect: number;
}

// The tools in the bar, from left to right.
export const TOOLS: DeskTool[] = [
  { id: 'sponge', image: spongeImage, aspect: 1 },
  { id: 'trash', image: trashImage, aspect: 157 / 112 },
  { id: 'shredder', image: shredderImage, aspect: 1280 / 1248 },
];

// The tool bar at the bottom middle: its center x, its top y, and its width
// as fractions of the window. Its height is a fraction of the window's height.
export const TOOL_BAR = { x: 0.5, y: 0.8, width: 0.5, height: 0.2 };

// Each tool fits in a square this big, as a fraction of the window's height.
export const TOOL_SIZE = 0.14;

// How dark a held tool's empty slot is.
export const SILHOUETTE_OPACITY = 0.35;
