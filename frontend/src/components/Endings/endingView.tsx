import type { ReactNode } from 'react';
import { Group, Layer, Rect, Stage } from 'react-konva';
import type { ArticleEnding } from '../../services/article';
import { COLORS, DISPLAY_FONT } from '../../theme';
import { useEndingModel } from './endingModel';
import { RETURN_TO_TITLE_TEXT, SCENE_HEIGHT, SCENE_WIDTH } from './endingContent';

// Below this width the text panel moves under the scene instead of beside it.
const NARROW_WIDTH = 760;

// Space kept clear for the Return button: under the panel on narrow screens,
// and under the art on wide ones.
const NARROW_BUTTON_SPACE = 96;
const WIDE_BUTTON_SPACE = 110;

// On wide screens a background image is drawn this many times the screen's
// height (the excess is cut off) and slid sideways so the point of interest
// (the cat, in GoodEnding.png) lands this far across the screen, beside the
// text panel.
const WIDE_IMAGE_SCALE = 1.2;
const WIDE_IMAGE_FOCUS_X = 0.52; // fraction of the image's width
// Fraction of the screen's width, with the panel on the left / on the right.
const WIDE_IMAGE_FOCUS_SCREEN_X = { left: 0.62, right: 0.38 };
// Where the image's top edge sits, as a fraction of the screen's height.
// Negative raises it off the top; -0.19 keeps the whole tie (which ends ~95%
// down the image) on screen.
const WIDE_IMAGE_TOP = -0.19;
// GoodEnding.png is 1920 x 1024.
const IMAGE_ASPECT = 1920 / 1024;

interface EndingViewProps {
  ending: ArticleEnding;
  // Konva shapes for the ending's art, drawn in SCENE_WIDTH x SCENE_HEIGHT.
  // Ignored when backgroundImage is given.
  scene?: ReactNode;
  // A finished illustration to use as the art instead of a Konva scene. It
  // may run off the screen, and `background` fills any area it leaves bare.
  backgroundImage?: string;
  // Fills the stage around the scaled scene so there are no bare edges.
  background: string;
  // Which side of a wide screen the text panel sits on; the art moves to the
  // other side. The Return button always sits in the bottom-right corner.
  panelSide?: 'left' | 'right';
}

// Shared layout for the Good and Bad Endings: the scene on a Konva canvas,
// with the headline and message in a panel and the Return button on its own in
// the bottom-right corner, both as HTML over the canvas.
export default function EndingView({
  ending,
  scene,
  background,
  backgroundImage,
  panelSide = 'left',
}: EndingViewProps) {
  const { content, width, height, onReturnToTitle } = useEndingModel(ending);

  const narrow = width < NARROW_WIDTH;
  const sceneHeight = narrow ? height * 0.4 : height;
  // On wide screens the art fits above the Return button's strip; the scene's
  // floor runs on underneath, so the button sits on empty ground.
  const artHeight = narrow ? sceneHeight : sceneHeight - WIDE_BUTTON_SPACE;
  const scale = Math.min(width / SCENE_WIDTH, artHeight / SCENE_HEIGHT);
  // On wide screens push the scene away from the text panel so the panel sits
  // over empty wall.
  const offsetX = narrow
    ? (width - SCENE_WIDTH * scale) / 2
    : panelSide === 'left'
      ? width - SCENE_WIDTH * scale
      : 0;
  const offsetY = (artHeight - SCENE_HEIGHT * scale) / 2;

  const imageHeight = sceneHeight * WIDE_IMAGE_SCALE;
  const imageTop = sceneHeight * WIDE_IMAGE_TOP;
  const imageLeft = width * WIDE_IMAGE_FOCUS_SCREEN_X[panelSide] - imageHeight * IMAGE_ASPECT * WIDE_IMAGE_FOCUS_X;

  return (
    <main style={{ position: 'fixed', inset: 0, overflow: 'hidden', background }}>
      {backgroundImage ? (
        <div
          aria-hidden="true"
          style={{
            width,
            height: sceneHeight,
            // On wide screens the image is enlarged and pushed away from the
            // text panel, running off the edges, so the panel sits over the
            // plain backdrop colour. On narrow screens it simply covers the area.
            background: narrow
              ? `${background} url(${backgroundImage}) center / cover no-repeat`
              : `${background} url(${backgroundImage}) ${imageLeft}px ${imageTop}px / auto ${imageHeight}px no-repeat`,
          }}
        />
      ) : (
        <Stage width={width} height={sceneHeight}>
          <Layer>
            <Rect width={width} height={sceneHeight} fill={background} />
            <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
              {scene}
            </Group>
          </Layer>
        </Stage>
      )}

      <section
        aria-labelledby="ending-headline"
        style={{
          position: 'absolute',
          boxSizing: 'border-box',
          ...(narrow
            ? { left: 16, right: 16, top: sceneHeight + 8, bottom: NARROW_BUTTON_SPACE, overflowY: 'auto' }
            : { [panelSide]: '4vw', top: '6vh', width: 'min(440px, 36vw)' }),
          padding: narrow ? '20px' : '24px 28px',
          background: COLORS.endingPanel,
          border: `4px solid ${COLORS.endingHeadline}`,
          borderRadius: 24,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          color: COLORS.endingHeadline,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <h1
          id="ending-headline"
          style={{
            margin: 0,
            fontFamily: DISPLAY_FONT,
            fontWeight: 400,
            fontSize: narrow ? 36 : 'clamp(32px, 3.8vw, 56px)',
            lineHeight: 1.1,
          }}
        >
          {content.headline}
          {content.headlineAside && (
            <>
              {' '}
              <span style={{ fontSize: '0.45em', whiteSpace: 'nowrap' }}>{content.headlineAside}</span>
            </>
          )}
        </h1>
        <p style={{ margin: '8px 0 16px', fontWeight: 700, fontSize: 18 }}>{content.subheadline}</p>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: COLORS.text }}>
          {content.message}
        </p>
      </section>

      <button
        type="button"
        onClick={onReturnToTitle}
        style={{
          position: 'absolute',
          ...(narrow ? { right: 16, bottom: 16 } : { right: '4vw', bottom: 24 }),
          padding: '12px 28px',
          fontFamily: DISPLAY_FONT,
          fontSize: 22,
          color: COLORS.endingHeadline,
          background: COLORS.titleButtonFill,
          border: `6px solid ${COLORS.titleButtonStroke}`,
          borderRadius: 999,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
          cursor: 'pointer',
        }}
      >
        {RETURN_TO_TITLE_TEXT}
      </button>
    </main>
  );
}
