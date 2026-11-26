import type { ComponentType } from 'react';
import type { Area, Mess, MessShape, StarArc, ToolId } from './deskCleanupRules';
import Envelope, { BlueEnvelope, ENVELOPE_ASPECT, RedEnvelope } from './parts/Envelope';
import Donut, { DONUT_ASPECT } from './parts/Donut';
import CoffeeCup, { COFFEE_CUP_ASPECT } from './parts/CoffeeCup';
import CoffeeRing, { COFFEE_RING_ASPECT } from './parts/CoffeeRing';
import Fries, { FRIES_ASPECT } from './parts/Fries';
import Ketchup, { KETCHUP_ASPECT } from './parts/Ketchup';
import paperBallImage from '../../assets/paper-ball-Cleanup.png';
import coffeeSplashImage from '../../assets/Coffee-Stain2-Cleanup.png';
import spongeImage from '../../assets/Sponge-Cleanup.png';
import trashImage from '../../assets/trash-can-Cleanup.png';
import shredderImage from '../../assets/Shredder-Cleanup.png';

export const TODO_TEXT = 'TO DO: Cleanup desk';
export const CONTINUE_LABEL = 'Continue';
export const STILL_DIRTY_MESSAGE = 'I still have stuff to clean';
export const HINT_TEXT =
  "Pick up a tool from the bar at the bottom. Scrub stains with the sponge: hold the mouse button down and move over them." + 
  "Throw away trash with the trash can and shred mail with the shredder. Both click with the arrow at their top-left corner." + 
  "Click a tool's slot to put it back.";
// Named in the back confirmation's message.
export const ACTIVITY_NAME = 'Desk Cleanup';

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

// A mess drawn with Konva shapes instead of an image file. It's drawn with its
// top left corner at 0, 0, filling width x height.
export type MessDrawing = ComponentType<{ width: number; height: number }>;

// image: an image file's URL, or a drawing. Where it goes is picked at
// random when the minigame opens (see placeMesses in deskCleanupRules.ts).
export interface DeskMess extends Mess, MessShape {
  image: string | MessDrawing;
}

// Every mess is turned to a random angle. An envelope's flap points down, so
// turning it at most this far either way keeps the flap pointing somewhere
// between left and right, never up, which keeps envelopes easy to recognize.
export const ENVELOPE_TURN = 90;

// Every mess on the desk and the tool that cleans it. Drawn in this order, so
// the stains come first and sit under the cup, the donut and the fries they
// belong to.
export const MESSES: DeskMess[] = [
  { id: 'coffeeRing', tool: 'sponge', image: CoffeeRing, size: 0.18, aspect: COFFEE_RING_ASPECT, under: 'cup' },
  { id: 'coffeeSplash', tool: 'sponge', image: coffeeSplashImage, size: 0.32, aspect: 364 / 430, under: 'donut' },
  { id: 'ketchup', tool: 'sponge', image: Ketchup, size: 0.22, aspect: KETCHUP_ASPECT, under: 'fries' },
  { id: 'donut', tool: 'trash', image: Donut, size: 0.22, aspect: DONUT_ASPECT },
  { id: 'paperBall1', tool: 'trash', image: paperBallImage, size: 0.13, aspect: 1 },
  { id: 'paperBall2', tool: 'trash', image: paperBallImage, size: 0.13, aspect: 1 },
  { id: 'cup', tool: 'trash', image: CoffeeCup, size: 0.17, aspect: COFFEE_CUP_ASPECT },
  { id: 'fries', tool: 'trash', image: Fries, size: 0.15, aspect: FRIES_ASPECT },
  { id: 'greenMail', tool: 'shredder', image: Envelope, size: 0.2, aspect: ENVELOPE_ASPECT, maxTurn: ENVELOPE_TURN },
  { id: 'redMail', tool: 'shredder', image: RedEnvelope, size: 0.2, aspect: ENVELOPE_ASPECT, maxTurn: ENVELOPE_TURN },
  { id: 'blueMail', tool: 'shredder', image: BlueEnvelope, size: 0.2, aspect: ENVELOPE_ASPECT, maxTurn: ENVELOPE_TURN },
];

// The settings, hint and back buttons down the top left corner, in pixels,
// since they're the same size on any window. Messes stay out of this corner.
export const CORNER_BUTTONS = { width: 90, height: 230 };

// Where messes can't be placed, as fractions of the window: the heading at
// the top, the tool bar, and Continue with its message in the bottom right.
export const BLOCKED_AREAS: Area[] = [
  { left: 0.2, top: 0, right: 0.8, bottom: 0.1 },
  { left: 0.25, top: 0.8, right: 0.75, bottom: 1 },
  { left: 0.7, top: 0.88, right: 1, bottom: 1 },
];

// cornerPointer: while held, a small arrow tip sits on the tool's top left
// corner and that tip is what clicks, instead of the tool's middle.
export interface DeskTool {
  id: ToolId;
  image: string;
  aspect: number;
  cornerPointer?: boolean;
}

// The tools in the bar, from left to right.
export const TOOLS: DeskTool[] = [
  { id: 'sponge', image: spongeImage, aspect: 1 },
  { id: 'trash', image: trashImage, aspect: 157 / 112, cornerPointer: true },
  { id: 'shredder', image: shredderImage, aspect: 1280 / 1248, cornerPointer: true },
];

// The tool bar at the bottom middle: its center x, its top y, and its width
// as fractions of the window. Its height is a fraction of the window's height.
export const TOOL_BAR = { x: 0.5, y: 0.8, width: 0.5, height: 0.2 };

// Each tool fits in a square this big, as a fraction of the window's height.
export const TOOL_SIZE = 0.14;

// The celebration once the desk is clean: stars shoot out of both bottom
// corners at once. From each corner, each lands 5% further across and peaks 5%
// higher than the last.
export const CELEBRATION_STARS: StarArc[] = [
  { travel: 0.65, peak: 0.55 },
  { travel: 0.7, peak: 0.6 },
  { travel: 0.75, peak: 0.65 },
];
// Each star is about as big as a paper ball, as a fraction of the window's
// height.
export const STAR_SIZE = 0.13;
// How long each star takes to land, how long to wait between stars, and how
// far each spins on the way, in degrees.
export const STAR_SECONDS = 1.6;
export const STAR_STAGGER_SECONDS = 0.15;
export const STAR_SPIN = 360;

// How big the corner pointer's arrow tip is, as a fraction of a tool's size.
export const POINTER_TIP_SIZE = 0.22;

// How big the area around a held corner pointer tool's slot corner is that
// also puts it back, as a fraction of a tool's size.
export const PUT_BACK_SIZE = 0.4;

// How dark a held tool's empty slot is.
export const SILHOUETTE_OPACITY = 0.35;
