import type { CSSProperties } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import type { ArticleEnding } from '../../services/article';
import type { Evidence } from '../../services/evidence';
import { useArticleWritingModel } from './articleWritingModel';

// Layout follows the "Creating Article" Figma frame (1280 × 832).
const WIDTH = 1280;
const HEIGHT = 832;
const DESK_Y = 522;
const FONT = 'Inter, sans-serif';

const COLORS = {
  wall: '#FFF6DF',
  desk: '#8A6656',
  journalCover: '#553A16',
  paper: '#F5FCFC',
  divider: '#C8C8C8',
  laptop: '#222222',
  card: '#FFFFFF',
  cardSelected: '#F3D9A4',
  cardBorder: '#553A16',
  text: '#111111',
  mutedText: '#555555',
};

// Journal: evidence cards fill the left page, then the right page.
const PAGE_X = [73, 352];
const CARDS_TOP = 385;
const CARD_WIDTH = 235;
const CARD_HEIGHT = 52;
const COMPACT_CARD_HEIGHT = 40;
const CARD_GAP = 8;
const CARDS_PER_PAGE = 4;
const CARDS_PER_SPREAD = CARDS_PER_PAGE * PAGE_X.length;

// Laptop screen, where the article is assembled.
const SCREEN = { x: 688, y: 195, width: 480, height: 300 };

// Hidden from sight but available to screen readers and tests, since
// nothing inside the canvas is.
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

const progressStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  left: 202,
  top: 36,
  width: 198,
  height: 98,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#D9D9D9',
  fontFamily: FONT,
  fontSize: 22,
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

const errorStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 1,
  left: 440,
  top: 60,
  margin: 0,
  fontFamily: FONT,
  color: '#B00020',
};

function setCursor(event: KonvaEventObject<MouseEvent>, cursor: string) {
  const container = event.target.getStage()?.container();
  if (container) container.style.cursor = cursor;
}

interface EvidenceCardProps {
  item: Evidence;
  x: number;
  y: number;
  width: number;
  selected: boolean;
  compact?: boolean;
  onToggle: (id: string) => void;
}

// compact cards show only the title, to fit five on the laptop screen.
function EvidenceCard({ item, x, y, width, selected, compact = false, onToggle }: EvidenceCardProps) {
  return (
    <Group
      x={x}
      y={y}
      onClick={() => onToggle(item.id)}
      onTap={() => onToggle(item.id)}
      onMouseEnter={(event) => setCursor(event, 'pointer')}
      onMouseLeave={(event) => setCursor(event, 'default')}
    >
      <Rect
        width={width}
        height={compact ? COMPACT_CARD_HEIGHT : CARD_HEIGHT}
        cornerRadius={6}
        fill={selected ? COLORS.cardSelected : COLORS.card}
        stroke={COLORS.cardBorder}
        strokeWidth={selected ? 2 : 1}
      />
      <Text
        x={10}
        y={compact ? 13 : 8}
        width={width - 20}
        text={(selected ? '✓ ' : '') + item.title}
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
        text={item.description}
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
}

// Display only: gets everything it needs from useArticleWritingModel.
export default function ArticleWriting({ levelId = 'level-1', onFinish }: ArticleWritingProps) {
  const {
    pageEvidence,
    page,
    pageCount,
    hasPreviousPage,
    hasNextPage,
    onPreviousPage,
    onNextPage,
    selectedEvidence,
    prompt,
    selectedCount,
    requiredCount,
    error,
    loading,
    canSubmit,
    isSelected,
    canSelectMore,
    onToggleEvidence,
    onSubmit,
  } = useArticleWritingModel({
    levelId,
    evidencePerPage: CARDS_PER_SPREAD,
    onFinish,
  });

  if (loading) return <p>Loading evidence...</p>;

  return (
    <section style={{ position: 'relative', width: WIDTH, height: HEIGHT }}>
      <h1 style={visuallyHidden}>Write your article</h1>

      <p style={progressStyle} aria-live="polite">
        <span>Progress</span>
        <span>{selectedCount}/{requiredCount}</span>
      </p>

      {error && <p role="alert" style={errorStyle}>{error}</p>}

      <ul style={visuallyHidden} aria-label="Collected evidence">
        {pageEvidence.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={isSelected(item.id)}
              disabled={!isSelected(item.id) && !canSelectMore}
              onClick={() => onToggleEvidence(item.id)}
            >
              {item.title}
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

      <Stage width={WIDTH} height={HEIGHT}>
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
            x={SCREEN.x + 24}
            y={SCREEN.y + 20}
            width={SCREEN.width - 48}
            text={prompt}
            fontFamily={FONT}
            fontStyle="bold"
            fontSize={20}
            fill={COLORS.text}
          />
          {selectedEvidence.length === 0 && (
            <Text
              x={SCREEN.x + 24}
              y={SCREEN.y + 80}
              width={SCREEN.width - 48}
              text="Pick evidence from your journal to build the article."
              fontFamily={FONT}
              fontSize={14}
              fill={COLORS.mutedText}
            />
          )}
          {selectedEvidence.map((item, index) => (
            <EvidenceCard
              key={item.id}
              item={item}
              x={SCREEN.x + 24}
              y={SCREEN.y + 70 + index * (COMPACT_CARD_HEIGHT + 4)}
              width={SCREEN.width - 48}
              selected
              compact
              onToggle={onToggleEvidence}
            />
          ))}

          {/* Open journal, drawn last so it sits on top of the laptop */}
          <Rect x={20} y={266} width={602} height={442} cornerRadius={25} fill={COLORS.journalCover} />
          <Rect x={43} y={288} width={557} height={398} cornerRadius={12} fill={COLORS.paper} />
          <Line points={[322, 345, 322, 633]} stroke={COLORS.divider} strokeWidth={2} />
          <Text x={73} y={345} text="Evidence:" fontFamily={FONT} fontStyle="bold" fontSize={22} fill={COLORS.text} />
          {pageEvidence.map((item, index) => {
            const side = Math.floor(index / CARDS_PER_PAGE);
            const row = index % CARDS_PER_PAGE;
            return (
              <EvidenceCard
                key={item.id}
                item={item}
                x={PAGE_X[side]}
                y={CARDS_TOP + row * (CARD_HEIGHT + CARD_GAP)}
                width={CARD_WIDTH}
                selected={isSelected(item.id)}
                onToggle={onToggleEvidence}
              />
            );
          })}
        </Layer>
      </Stage>

      <button type="button" style={submitStyle} disabled={!canSubmit} onClick={onSubmit}>
        Submit article
      </button>
    </section>
  );
}
