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

interface EndingViewProps {
  ending: ArticleEnding;
  // Konva shapes for the ending's art, drawn in SCENE_WIDTH x SCENE_HEIGHT.
  scene: ReactNode;
  // Fills the stage around the scaled scene so there are no bare edges.
  background: string;
}

// Shared layout for the Good and Bad Endings: the scene on a Konva canvas,
// with the headline and message in a panel and the Return button on its own in
// the bottom-right corner, both as HTML over the canvas.
export default function EndingView({ ending, scene, background }: EndingViewProps) {
  const { content, width, height, onReturnToTitle } = useEndingModel(ending);

  const narrow = width < NARROW_WIDTH;
  const sceneHeight = narrow ? height * 0.4 : height;
  // On wide screens the art fits above the Return button's strip; the scene's
  // floor runs on underneath, so the button sits on empty ground.
  const artHeight = narrow ? sceneHeight : sceneHeight - WIDE_BUTTON_SPACE;
  const scale = Math.min(width / SCENE_WIDTH, artHeight / SCENE_HEIGHT);
  // On wide screens push the scene right so the text panel sits over empty wall.
  const offsetX = narrow ? (width - SCENE_WIDTH * scale) / 2 : width - SCENE_WIDTH * scale;
  const offsetY = (artHeight - SCENE_HEIGHT * scale) / 2;

  return (
    <main style={{ position: 'fixed', inset: 0, overflow: 'hidden', background }}>
      <Stage width={width} height={sceneHeight}>
        <Layer>
          <Rect width={width} height={sceneHeight} fill={background} />
          <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
            {scene}
          </Group>
        </Layer>
      </Stage>

      <section
        aria-labelledby="ending-headline"
        style={{
          position: 'absolute',
          boxSizing: 'border-box',
          ...(narrow
            ? { left: 16, right: 16, top: sceneHeight + 8, bottom: NARROW_BUTTON_SPACE, overflowY: 'auto' }
            : { left: '4vw', top: '6vh', width: 'min(440px, 36vw)' }),
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
