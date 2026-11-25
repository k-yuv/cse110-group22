import { useRef } from 'react';
import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useNewsArticleModel } from './newsArticleModel';
import { getResultMessage } from './newsArticleRules';
import {
  ACTIVITY_NAME,
  ADD_EVIDENCE_LABEL,
  ADD_EVIDENCE_TODO_TEXT,
  ARTICLE_COLUMN,
  COLORS,
  CONTINUE_LABEL,
  FONT,
  HIGHLIGHTER_LAYOUT,
  HIGHLIGHTER_TIP,
  HINT_TEXT,
  LAST_ROW_SCALE,
  MESSAGE_SECONDS,
  NEWSPAPER_LAYOUT,
  OUTLINE_OPACITY,
  SUBMIT_LABEL,
  TODO_TEXT,
  TRANSCRIPT_LAYOUT,
  TRANSCRIPT_TITLE,
  UNDER_PHOTO,
} from './newsArticleContent';
import { COLORS as THEME_COLORS, FONT as THEME_FONT } from '../../theme';
import { URLImage } from '../URLImage/URLImage';
import HoverSpotlight from '../Desk/parts/HoverSpotlight';
import Journal from '../Journal/journalView';
import BackButton from '../Back-Button/backButtonView';
import SettingsButton from '../SettingsButton/SettingsButton';
import HintButton from '../HintButton/HintButton';
import BackConfirmation from '../Back-Confirmation/backConfirmationView';
import newspaperImage from '../../assets/Newspaper-Template-2.png';
import highlighterImage from '../../assets/Highlighter.png';
import highlighterOutline from '../../assets/Highlighter-Outline.png';

// The same look as the letter's "Put away" button, only bigger.
const BUTTON_STYLE = {
  padding: '14px 48px',
  border: 'none',
  borderRadius: 10,
  background: THEME_COLORS.journalButton,
  color: THEME_COLORS.journalText,
  fontFamily: THEME_FONT,
  fontSize: 22,
  cursor: 'pointer',
};

// The News Article activity: the player compares the newspaper on the
// right to the research study on the left and highlights the false
// sentences. Display only: what's highlighted and the result come from
// useNewsArticleModel.
export default function NewsArticle() {
  const {
    activity,
    error,
    loading,
    width,
    height,
    holdingHighlighter,
    highlightedIds,
    result,
    evidenceAdded,
    message,
    canGoBack,
    onToggleHighlighter,
    onSentenceClick,
    onSubmit,
    onAddEvidence,
    onContinue,
    onBack,
    backConfirmation,
  } = useNewsArticleModel();

  // The highlighter that follows the mouse while it's held. It's moved
  // directly through Konva on every mouse move, so moving the mouse doesn't
  // re-render the screen (like HoverSpotlight's animations).
  const heldHighlighterRef = useRef<Konva.Group>(null);

  function handleMouseMove(event: KonvaEventObject<MouseEvent>) {
    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    heldHighlighterRef.current?.position(pointer);
    // Konva runs this after HoverSpotlight sets its cursor, so the held
    // highlighter stays the only cursor on screen.
    if (holdingHighlighter) stage.container().style.cursor = 'none';
  }

  // Putting the highlighter back brings the normal cursor back.
  function handleToggleHighlighter(event: KonvaEventObject<Event>) {
    const container = event.target.getStage()?.container();
    if (holdingHighlighter && container) container.style.cursor = 'pointer';
    onToggleHighlighter();
  }

  if (loading) return <p>Loading...</p>;

  // Find the misinformation, then add the evidence, then nothing left to do.
  const todo = !result?.passed ? TODO_TEXT : evidenceAdded ? '' : ADD_EVIDENCE_TODO_TEXT;

  // Window fractions to pixels.
  const card = {
    x: TRANSCRIPT_LAYOUT.x * width,
    y: TRANSCRIPT_LAYOUT.y * height,
    width: TRANSCRIPT_LAYOUT.width * width,
    height: TRANSCRIPT_LAYOUT.height * height,
  };
  const cardPadding = card.width * 0.06;

  const paperWidth = Math.min(
    NEWSPAPER_LAYOUT.maxWidth * width,
    NEWSPAPER_LAYOUT.maxHeight * height * NEWSPAPER_LAYOUT.aspect,
  );
  const paperHeight = paperWidth / NEWSPAPER_LAYOUT.aspect;
  const paperX = NEWSPAPER_LAYOUT.centerX * width - paperWidth / 2;
  const paperY = NEWSPAPER_LAYOUT.y * height;

  // The last sentence goes in the space under the photo, and the rest split
  // the column into rows. The column's last row is LAST_ROW_SCALE times as
  // tall as the others, so its longer sentence fits.
  const segments = activity?.segments ?? [];
  const columnRows = Math.max(1, segments.length - 1);
  const columnWidth = ARTICLE_COLUMN.width * paperWidth;
  const rowHeight = (ARTICLE_COLUMN.height * paperHeight) / (columnRows - 1 + LAST_ROW_SCALE);
  function sentenceBox(index: number) {
    if (index === segments.length - 1 && segments.length > 1) {
      return {
        x: paperX + UNDER_PHOTO.x * paperWidth,
        y: paperY + UNDER_PHOTO.y * paperHeight,
        width: UNDER_PHOTO.width * paperWidth,
        height: UNDER_PHOTO.height * paperHeight,
      };
    }
    return {
      x: paperX + ARTICLE_COLUMN.x * paperWidth,
      y: paperY + ARTICLE_COLUMN.y * paperHeight + index * rowHeight,
      width: columnWidth,
      height: index === columnRows - 1 ? rowHeight * LAST_ROW_SCALE : rowHeight,
    };
  }

  const highlighterSize = HIGHLIGHTER_LAYOUT.size * height;
  const restX = HIGHLIGHTER_LAYOUT.centerX * width - highlighterSize / 2;
  const restY = HIGHLIGHTER_LAYOUT.y * height;

  return (
    <main style={{ position: 'fixed', inset: 0, background: COLORS.background }}>
      {error && <p role="alert">{error}</p>}

      {/* On top of the canvas, but clicks pass through it. */}
      {todo && (
        <h1
          style={{
            position: 'absolute',
            top: '2%',
            width: '100%',
            margin: 0,
            textAlign: 'center',
            fontFamily: FONT,
            color: COLORS.card,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {todo}
        </h1>
      )}

      {activity && (
        <Stage width={width} height={height} onMouseMove={handleMouseMove}>
          <Layer>
            {/* Transcript card */}
            <Rect {...card} cornerRadius={cardPadding} fill={COLORS.card} />
            <Text
              x={card.x + cardPadding}
              y={card.y + cardPadding}
              width={card.width - cardPadding * 2}
              text={TRANSCRIPT_TITLE}
              fontSize={card.width * 0.07}
              fontStyle="bold"
              fontFamily={FONT}
              fill={COLORS.text}
            />
            <Text
              x={card.x + cardPadding}
              y={card.y + cardPadding + card.width * 0.2}
              width={card.width - cardPadding * 2}
              text={activity.transcript.text}
              fontSize={card.width * 0.044}
              lineHeight={1.4}
              fontFamily={FONT}
              fill={COLORS.text}
            />

            {/* Newspaper, with one clickable row per sentence */}
            <URLImage src={newspaperImage} x={paperX} y={paperY} width={paperWidth} height={paperHeight} />
            {segments.map((segment, index) => {
              const box = sentenceBox(index);
              return (
                <Group
                  key={segment.id}
                  x={box.x}
                  y={box.y}
                  onClick={() => onSentenceClick(segment.id)}
                  onTap={() => onSentenceClick(segment.id)}
                >
                  <HoverSpotlight
                    width={box.width}
                    height={box.height}
                    disabled={!holdingHighlighter || result?.passed}
                  >
                    <Rect
                      width={box.width}
                      height={box.height}
                      fill={COLORS.highlight}
                      opacity={highlightedIds.includes(segment.id) ? 1 : 0}
                    />
                    <Text
                      width={box.width}
                      height={box.height}
                      text={segment.text}
                      fontSize={paperWidth * 0.028}
                      verticalAlign="middle"
                      fontFamily={FONT}
                      fill={COLORS.text}
                    />
                  </HoverSpotlight>
                </Group>
              );
            })}

            {/* Where the highlighter rests: the highlighter itself, or its
                dark outline while it's held. Clicking either picks it up or
                puts it back. Put away once the level is passed. */}
            {!result?.passed && (
              <Group x={restX} y={restY} onClick={handleToggleHighlighter} onTap={handleToggleHighlighter}>
                <HoverSpotlight width={highlighterSize} height={highlighterSize}>
                  <Group opacity={holdingHighlighter ? OUTLINE_OPACITY : 1}>
                    <URLImage
                      src={holdingHighlighter ? highlighterOutline : highlighterImage}
                      x={0}
                      y={0}
                      width={highlighterSize}
                      height={highlighterSize}
                    />
                  </Group>
                </HoverSpotlight>
              </Group>
            )}

            {/* The held highlighter, drawn last so it's on top. It ignores
                clicks, so they reach the sentence under the tip. */}
            <Group ref={heldHighlighterRef} visible={holdingHighlighter} listening={false}>
              <URLImage
                src={highlighterImage}
                x={-HIGHLIGHTER_TIP.x * highlighterSize}
                y={-HIGHLIGHTER_TIP.y * highlighterSize}
                width={highlighterSize}
                height={highlighterSize}
              />
            </Group>
          </Layer>
        </Stage>
      )}

      <Journal placement="corner" />

      {/* Submitting, the result and the buttons are plain HTML, so tests can
          see them. The "add the evidence first" message takes the result's
          place, stays for most of its time, then fades out before the model
          removes it. */}
      <style>{'@keyframes news-article-fade { 0%, 70% { opacity: 1; } 100% { opacity: 0; } }'}</style>
      {activity && (
        <div
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          {message ? (
            <p
              role="status"
              style={{
                margin: 0,
                color: COLORS.card,
                animation: `news-article-fade ${MESSAGE_SECONDS}s forwards`,
              }}
            >
              {message}
            </p>
          ) : (
            result && (
              <p role="status" style={{ margin: 0, color: COLORS.card }}>
                {getResultMessage(result)}
              </p>
            )
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!result?.passed && (
              <button type="button" onClick={onSubmit} style={BUTTON_STYLE}>
                {SUBMIT_LABEL}
              </button>
            )}
            {result?.passed && !evidenceAdded && (
              <button type="button" onClick={onAddEvidence} style={BUTTON_STYLE}>
                {ADD_EVIDENCE_LABEL}
              </button>
            )}
            {result?.passed && (
              <button type="button" onClick={onContinue} style={BUTTON_STYLE}>
                {CONTINUE_LABEL}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Down the top left: settings (like the desk), the hint, then Back. */}
      <SettingsButton />
      <HintButton hint={HINT_TEXT} />
      {canGoBack && <BackButton onClick={onBack} style={{ left: 22, top: 162 }} />}
      <BackConfirmation activityName={ACTIVITY_NAME} {...backConfirmation} />
    </main>
  );
}
