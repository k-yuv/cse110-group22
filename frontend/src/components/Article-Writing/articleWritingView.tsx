import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import { visuallyHidden } from '../../helpers';
import type { ArticleEnding } from '../../services/article';
import type { EvidenceModel } from '../Journal/EvidenceModel';
import JournalBook from '../Journal/parts/JournalBook';
import EvidenceDetail from '../Journal/parts/EvidenceDetail';
import { COLORS, FONT } from '../../theme';
import { useArticleWritingModel } from './articleWritingModel';
import ProgressBar from '../Progress-Bar/ProgressBar';
import BackButton from '../Back-Button/backButtonView';
import BackConfirmation from '../Back-Confirmation/backConfirmationView';

// Named in the back confirmation's message.
export const ACTIVITY_NAME = 'your article';

// Layout follows the "Creating Article" Figma frame (1280 × 832), scaled to
// fit the window.
const WIDTH = 1280;
const HEIGHT = 832;
const DESK_Y = 522;

// The open journal, drawn by JournalBook at this size and position.
const BOOK_FRAME = { x: 20, y: 266, width: 602 };

// Journal: evidence cards fill the left page, then the right page.
const PAGE_X = [73, 352];
const CARDS_TOP = 385;
const CARD_WIDTH = 235;
const CARD_HEIGHT = 52;
const COMPACT_CARD_HEIGHT = 40;
const CARD_GAP = 8;
const CARDS_PER_PAGE = 4;
const CARDS_PER_SPREAD = CARDS_PER_PAGE * PAGE_X.length;
// A hovered card's full text stays above the page buttons.
const PAGES_BOTTOM = 636;

// Laptop screen, where the article is assembled.
const SCREEN = { x: 688, y: 195, width: 480, height: 300 };
const PROMPT_FONT_SIZE = 20;
const PROMPT_LINE_HEIGHT = 1.2;

// The bar's label sits above it, so the bar itself starts at y = 51.
const progressStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  left: 161,
  top: 16,
};

const submitStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  left: 838,
  top: 640,
  width: 180,
  height: 56,
  fontFamily: FONT,
  fontSize: 20,
};

// Page turning along the bottom of the open journal.
const pageNavStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  left: 73,
  top: 644,
  width: 514,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: FONT,
  fontSize: 14,
};

// Question number and stepping back to an earlier question, above the laptop.
const questionNavStyle: CSSProperties = {
  ...pageNavStyle,
  left: SCREEN.x,
  top: 110,
  width: SCREEN.width,
};

const errorStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  left: 440,
  top: 60,
  margin: 0,
  fontFamily: FONT,
  color: COLORS.error,
};

function setCursor(event: KonvaEventObject<MouseEvent>, cursor: string) {
  const container = event.target.getStage()?.container();
  if (container) container.style.cursor = cursor;
}

interface EvidenceCardProps {
  item: EvidenceModel;
  x: number;
  y: number;
  width: number;
  selected: boolean;
  compact?: boolean;
  onToggle: (id: string) => void;
  onHoverChange: (hovering: boolean) => void;
}

// Where a card is drawn. key tells the journal's and the laptop's copies of
// the same evidence apart.
interface CardLayout {
  key: string;
  item: EvidenceModel;
  x: number;
  y: number;
  width: number;
  // How far down its full text may reach when hovered.
  maxBottom: number;
}

// compact cards show only the title, to fit five on the laptop screen.
// Long text is cut short here; hovering shows all of it (see EvidenceDetail).
function EvidenceCard({ item, x, y, width, selected, compact = false, onToggle, onHoverChange }: EvidenceCardProps) {
  return (
    <Group
      x={x}
      y={y}
      onClick={() => onToggle(item.id)}
      onTap={() => onToggle(item.id)}
      onMouseEnter={(event) => {
        setCursor(event, 'pointer');
        onHoverChange(true);
      }}
      onMouseLeave={(event) => {
        setCursor(event, 'default');
        onHoverChange(false);
      }}
    >
      <Rect
        width={width}
        height={compact ? COMPACT_CARD_HEIGHT : CARD_HEIGHT}
        cornerRadius={6}
        fill={selected ? COLORS.cardSelected : COLORS.card}
        stroke={COLORS.journalCover}
        strokeWidth={selected ? 2 : 1}
      />
      <Text
        x={10}
        y={compact ? 13 : 8}
        width={width - 20}
        text={(selected ? '✓ ' : '') + item.toolName}
        fontFamily={FONT}
        fontStyle="bold"
        fontSize={14}
        fill={COLORS.text}
        ellipsis
        wrap="none"
      />
      {!compact && <Text
        x={10}
        y={28}
        width={width - 20}
        text={item.toolDescription}
        fontFamily={FONT}
        fontSize={11}
        fill={COLORS.mutedText}
        ellipsis
        wrap="none"
      />}
    </Group>
  );
}

interface ArticleWritingProps {
  levelId?: string;
  onFinish: (ending: ArticleEnding) => void;
  // Leaves the screen, e.g. to the desk. Asks first.
  onBack: () => void;
}

// Display only: gets everything it needs from useArticleWritingModel.
export default function ArticleWriting({ levelId = 'level-1', onFinish, onBack }: ArticleWritingProps) {
  // Canvas layout only, so it lives here rather than in the model.
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const promptRef = useRef<Konva.Text>(null);
  const [promptHeight, setPromptHeight] = useState(PROMPT_FONT_SIZE * PROMPT_LINE_HEIGHT);

  const {
    windowWidth,
    windowHeight,
    pageEvidence,
    page,
    pageCount,
    hasPreviousPage,
    hasNextPage,
    onPreviousPage,
    onNextPage,
    questionNumber,
    questionCount,
    hasPreviousQuestion,
    isLastQuestion,
    onPreviousQuestion,
    selectedEvidence,
    prompt,
    selectedCount,
    requiredCount,
    answeredCount,
    error,
    loading,
    canSubmit,
    isSelected,
    onToggleEvidence,
    onSubmit,
    onBack: handleBack,
    backConfirmation,
  } = useArticleWritingModel({
    levelId,
    evidencePerPage: CARDS_PER_SPREAD,
    onFinish,
    onBack,
  });

  // Long questions wrap onto more lines, pushing what's below them down.
  useLayoutEffect(() => {
    if (promptRef.current) setPromptHeight(promptRef.current.height());
  }, [prompt, loading]);

  if (loading) return <p>Loading questions...</p>;

  const promptBottom = SCREEN.y + 20 + promptHeight;

  const screenCards: CardLayout[] = selectedEvidence.map((item, index) => ({
    key: `screen-${item.id}`,
    item,
    x: SCREEN.x + 24,
    y: promptBottom + 30 + index * (COMPACT_CARD_HEIGHT + 4),
    width: SCREEN.width - 48,
    maxBottom: SCREEN.y + SCREEN.height - 8,
  }));

  const journalCards: CardLayout[] = pageEvidence.map((item, index) => ({
    key: `journal-${item.id}`,
    item,
    x: PAGE_X[Math.floor(index / CARDS_PER_PAGE)],
    y: CARDS_TOP + (index % CARDS_PER_PAGE) * (CARD_HEIGHT + CARD_GAP),
    width: CARD_WIDTH,
    maxBottom: PAGES_BOTTOM,
  }));

  // Looked up from what's drawn now, so a card that's gone (deselected, or on
  // another page) stops showing without needing a mouse leave.
  const hovered = [...screenCards, ...journalCards].find((card) => card.key === hoveredKey);

  function hoverHandler(key: string) {
    return (hovering: boolean) =>
      setHoveredKey((current) => (hovering ? key : current === key ? null : current));
  }

  // Fit the whole frame in the window, centered. The wall and desk colors
  // continue past its edges so the screen is filled at any window shape.
  const scale = Math.min(windowWidth / WIDTH, windowHeight / HEIGHT);
  const left = (windowWidth - WIDTH * scale) / 2;
  const top = (windowHeight - HEIGHT * scale) / 2;
  const deskTop = top + DESK_Y * scale;

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: `linear-gradient(${COLORS.wall} ${deskTop}px, ${COLORS.desk} ${deskTop}px)`,
      }}
    >
      <section
        style={{
          position: 'absolute',
          left,
          top,
          width: WIDTH,
          height: HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <h1 style={visuallyHidden}>Write your article</h1>

        {/* Top left of the frame, beside the progress bar. */}
        <BackButton onClick={handleBack} size={64} style={{ left: 48, top: 28 }} />

        <ProgressBar completed={answeredCount} total={questionCount} style={progressStyle} />

        {error && <p role="alert" style={errorStyle}>{error}</p>}

        <ul style={visuallyHidden} aria-label="Collected evidence">
          {pageEvidence.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={isSelected(item.id)}
                onClick={() => onToggleEvidence(item.id)}
              >
                {item.toolName}
              </button>
            </li>
          ))}
        </ul>

        <nav style={pageNavStyle} aria-label="Journal pages">
          <button type="button" disabled={!hasPreviousPage} onClick={onPreviousPage}>
            ‹ Previous
          </button>
          <span>Page {page} of {pageCount}</span>
          <button type="button" disabled={!hasNextPage} onClick={onNextPage}>
            Next ›
          </button>
        </nav>

        <nav style={questionNavStyle} aria-label="Article questions">
          <button type="button" disabled={!hasPreviousQuestion} onClick={onPreviousQuestion}>
            ‹ Previous question
          </button>
          <span>Question {questionNumber} of {questionCount}</span>
        </nav>

        {/* Drawn at the scaled size, then scaled back down by the section's
            transform, so the canvas stays sharp. */}
        <Stage
          width={WIDTH * scale}
          height={HEIGHT * scale}
          scaleX={scale}
          scaleY={scale}
          style={{ transform: `scale(${1 / scale})`, transformOrigin: 'top left' }}
        >
          <Layer>
            <Rect width={WIDTH} height={DESK_Y} fill={COLORS.wall} />
            <Rect y={DESK_Y} width={WIDTH} height={HEIGHT - DESK_Y} fill={COLORS.desk} />

            {/* Laptop showing the article being written */}
            <Line
              points={[644, 515, 1206, 515, 1280, 690, 1280, 762, 531, 762, 531, 735]}
              closed
              fill={COLORS.laptop}
            />
            <Rect x={643} y={150} width={570} height={390} cornerRadius={50} fill={COLORS.laptop} />
            <Rect {...SCREEN} cornerRadius={20} fill={COLORS.paper} />
            <Text
              ref={promptRef}
              x={SCREEN.x + 24}
              y={SCREEN.y + 20}
              width={SCREEN.width - 48}
              text={prompt}
              fontFamily={FONT}
              fontStyle="bold"
              fontSize={PROMPT_FONT_SIZE}
              lineHeight={PROMPT_LINE_HEIGHT}
              fill={COLORS.text}
              wrap="word"
            />
            <Text
              x={SCREEN.x + 24}
              y={promptBottom + 6}
              text={`Evidence ${selectedCount}/${requiredCount}`}
              fontFamily={FONT}
              fontSize={12}
              fill={COLORS.mutedText}
            />
            {selectedEvidence.length === 0 && (
              <Text
                x={SCREEN.x + 24}
                y={promptBottom + 40}
                width={SCREEN.width - 48}
                text={`Submit ${requiredCount} pieces of evidence.`}
                fontFamily={FONT}
                fontSize={14}
                fill={COLORS.mutedText}
              />
            )}
            {screenCards.map((card) => (
              <EvidenceCard
                key={card.key}
                item={card.item}
                x={card.x}
                y={card.y}
                width={card.width}
                selected
                compact
                onToggle={onToggleEvidence}
                onHoverChange={hoverHandler(card.key)}
              />
            ))}

            {/* Open journal, drawn last so it sits on top of the laptop. The
                cards are drawn over it in frame coordinates, not as its children. */}
            <Group x={BOOK_FRAME.x} y={BOOK_FRAME.y}>
              <JournalBook width={BOOK_FRAME.width} />
            </Group>
            <Text x={73} y={345} text="Evidence:" fontFamily={FONT} fontStyle="bold" fontSize={22} fill={COLORS.text} />
            {journalCards.map((card) => (
              <EvidenceCard
                key={card.key}
                item={card.item}
                x={card.x}
                y={card.y}
                width={card.width}
                selected={isSelected(card.item.id)}
                onToggle={onToggleEvidence}
                onHoverChange={hoverHandler(card.key)}
              />
            ))}

            {hovered && (
              <EvidenceDetail
                item={hovered.item}
                x={hovered.x}
                y={hovered.y}
                width={hovered.width}
                maxBottom={hovered.maxBottom}
                fill={isSelected(hovered.item.id) ? COLORS.cardSelected : COLORS.card}
                stroke={COLORS.journalCover}
                nameColor={COLORS.text}
                descriptionColor={COLORS.mutedText}
                nameFontSize={14}
                descriptionFontSize={12}
              />
            )}
          </Layer>
        </Stage>

        <button type="button" style={submitStyle} disabled={!canSubmit} onClick={onSubmit}>
          {isLastQuestion ? 'Submit article' : 'Submit answer'}
        </button>
      </section>

      {/* Outside the scaled section, so its fixed overlay covers the window. */}
      <BackConfirmation activityName={ACTIVITY_NAME} {...backConfirmation} />
    </main>
  );
}
