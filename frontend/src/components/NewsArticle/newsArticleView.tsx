import { useRef } from 'react';
import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useNewsArticleModel } from './newsArticleModel';
import { getResultMessage } from './newsArticleRules';
import {
  ACTIVITY_NAME,
  ARTICLE_COLUMN,
  COLORS,
  CONTINUE_LABEL,
  FONT,
  HIGHLIGHTER_LAYOUT,
  HIGHLIGHTER_TIP,
  NEWSPAPER_LAYOUT,
  OUTLINE_OPACITY,
  SUBMIT_LABEL,
  TODO_TEXT,
  TRANSCRIPT_LAYOUT,
  TRANSCRIPT_TITLE,
} from './newsArticleContent';
import { URLImage } from '../URLImage/URLImage';
import HoverSpotlight from '../Desk/parts/HoverSpotlight';
import BackButton from '../Back-Button/backButtonView';
import BackConfirmation from '../Back-Confirmation/backConfirmationView';
import newspaperImage from '../../assets/Newspaper-Template-2.png';
import highlighterImage from '../../assets/Highlighter.png';
import highlighterOutline from '../../assets/Highlighter-Outline.png';

// The Online Articles activity: the player compares the newspaper on the
// right to the trusted transcript on the left and highlights the false
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
    onToggleHighlighter,
    onSentenceClick,
    onSubmit,
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

  // The column is split into one equal row per sentence.
  const columnX = paperX + ARTICLE_COLUMN.x * paperWidth;
  const columnY = paperY + ARTICLE_COLUMN.y * paperHeight;
  const columnWidth = ARTICLE_COLUMN.width * paperWidth;
  const rowHeight = (ARTICLE_COLUMN.height * paperHeight) / (activity?.segments.length ?? 1);

  const highlighterSize = HIGHLIGHTER_LAYOUT.size * height;
  const restX = HIGHLIGHTER_LAYOUT.centerX * width - highlighterSize / 2;
  const restY = HIGHLIGHTER_LAYOUT.y * height;

  return (
    <main style={{ position: 'fixed', inset: 0, background: COLORS.background }}>
      {error && <p role="alert">{error}</p>}

      {/* On top of the canvas, but clicks pass through it. */}
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
        {TODO_TEXT}
      </h1>

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
              y={card.y + cardPadding + card.width * 0.14}
              width={card.width - cardPadding * 2}
              text={`${activity.transcript.speaker}: "${activity.transcript.text}"`}
              fontSize={card.width * 0.055}
              lineHeight={1.4}
              fontFamily={FONT}
              fill={COLORS.text}
            />

            {/* Newspaper, with one clickable row per sentence */}
            <URLImage src={newspaperImage} x={paperX} y={paperY} width={paperWidth} height={paperHeight} />
            {activity.segments.map((segment, index) => (
              <Group
                key={segment.id}
                x={columnX}
                y={columnY + index * rowHeight}
                onClick={() => onSentenceClick(segment.id)}
                onTap={() => onSentenceClick(segment.id)}
              >
                <HoverSpotlight width={columnWidth} height={rowHeight} disabled={!holdingHighlighter || result?.passed}>
                  <Rect
                    width={columnWidth}
                    height={rowHeight}
                    fill={COLORS.highlight}
                    opacity={highlightedIds.includes(segment.id) ? 1 : 0}
                  />
                  <Text
                    width={columnWidth}
                    height={rowHeight}
                    text={segment.text}
                    fontSize={paperWidth * 0.028}
                    verticalAlign="middle"
                    fontFamily={FONT}
                    fill={COLORS.text}
                  />
                </HoverSpotlight>
              </Group>
            ))}

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

      {/* Submitting and the result are plain HTML, so tests can see them. */}
      {activity && (
        <div style={{ position: 'absolute', right: 16, bottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          {result && (
            <p role="status" style={{ margin: 0, color: COLORS.card }}>
              {getResultMessage(result)}
            </p>
          )}
          {result?.passed ? (
            <button type="button" onClick={onContinue}>
              {CONTINUE_LABEL}
            </button>
          ) : (
            <button type="button" onClick={onSubmit}>
              {SUBMIT_LABEL}
            </button>
          )}
        </div>
      )}

      <BackButton onClick={onBack} />
      <BackConfirmation activityName={ACTIVITY_NAME} {...backConfirmation} />
    </main>
  );
}
