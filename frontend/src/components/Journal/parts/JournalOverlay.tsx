import type { CSSProperties } from 'react';
import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import { visuallyHidden } from '../../../helpers';
import { COLORS, FONT } from '../../../theme';
import type { EvidenceModel } from '../EvidenceModel';
import {
  BOOK,
  CLOSE_LABEL,
  DIALOG_LABEL,
  EMPTY_TEXT,
  NEXT_LABEL,
  NOTE,
  NOTES_PER_PAGE,
  NOTES_TOP,
  OVERLAY,
  PAGE_X,
  PREVIOUS_LABEL,
} from '../journalContent';
import JournalBook from './JournalBook';

function EvidenceNote({ item, x, y }: { item: EvidenceModel; x: number; y: number }) {
  const textWidth = NOTE.width - NOTE.padding * 2;

  return (
    <Group x={x} y={y}>
      <Rect width={NOTE.width} height={NOTE.height} cornerRadius={4} fill={COLORS.journalNote} />
      <Text
        x={NOTE.padding}
        y={8}
        width={textWidth}
        text={item.toolName}
        fontFamily={FONT}
        fontStyle="bold"
        fontSize={15}
        fill={COLORS.journalText}
        ellipsis
        wrap="none"
      />
      <Text
        x={NOTE.padding}
        y={28}
        width={textWidth}
        height={NOTE.height - 34}
        text={item.toolDescription}
        fontFamily={FONT}
        fontSize={13}
        lineHeight={1.2}
        fill={COLORS.journalText}
        ellipsis
      />
    </Group>
  );
}

interface JournalOverlayProps {
  windowWidth: number;
  windowHeight: number;
  evidence: readonly EvidenceModel[];
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onClose: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

// The full two-page journal, on top of everything else on the screen.
export default function JournalOverlay({
  windowWidth,
  windowHeight,
  evidence,
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  onClose,
  onPreviousPage,
  onNextPage,
}: JournalOverlayProps) {
  const scale = Math.min(
    (windowWidth * OVERLAY.windowFraction) / BOOK.width,
    (windowHeight * OVERLAY.windowFraction) / OVERLAY.height,
  );

  function buttonStyle(x: number, width: number, disabled = false): CSSProperties {
    return {
      position: 'absolute',
      left: x * scale,
      top: OVERLAY.buttonsTop * scale,
      width: width * scale,
      height: OVERLAY.buttonHeight * scale,
      padding: 0,
      border: 'none',
      background: COLORS.journalButton,
      color: COLORS.journalText,
      fontFamily: FONT,
      fontSize: OVERLAY.buttonFontSize * scale,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: OVERLAY.backdrop,
        zIndex: OVERLAY.zIndex,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={DIALOG_LABEL}
        style={{ position: 'relative', width: BOOK.width * scale, height: OVERLAY.height * scale }}
      >
        {evidence.length === 0 && <p style={visuallyHidden}>{EMPTY_TEXT}</p>}
        <ul style={visuallyHidden} aria-label="Evidence on these pages">
          {evidence.map((item) => (
            <li key={item.id}>
              {item.toolName}: {item.toolDescription}
            </li>
          ))}
        </ul>

        <Stage width={BOOK.width * scale} height={BOOK.height * scale}>
          <Layer>
            <JournalBook width={BOOK.width * scale}>
              {evidence.length === 0 && (
                <Text
                  x={PAGE_X[0]}
                  y={NOTES_TOP}
                  width={NOTE.width}
                  text={EMPTY_TEXT}
                  fontFamily={FONT}
                  fontSize={18}
                  fill={COLORS.mutedText}
                />
              )}
              {evidence.map((item, index) => (
                <EvidenceNote
                  key={item.id}
                  item={item}
                  x={PAGE_X[Math.floor(index / NOTES_PER_PAGE)]}
                  y={NOTES_TOP + (index % NOTES_PER_PAGE) * (NOTE.height + NOTE.gap)}
                />
              ))}
            </JournalBook>
          </Layer>
        </Stage>

        <p
          style={{
            position: 'absolute',
            top: OVERLAY.pageLabelTop * scale,
            width: '100%',
            margin: 0,
            textAlign: 'center',
            fontFamily: FONT,
            fontSize: OVERLAY.pageLabelFontSize * scale,
            color: COLORS.journalText,
            pointerEvents: 'none',
          }}
        >
          Page {page} of {pageCount}
        </p>

        <nav aria-label="Journal pages">
          <button type="button" disabled={!hasPreviousPage} onClick={onPreviousPage} style={buttonStyle(0, OVERLAY.pageButtonWidth, !hasPreviousPage)}>
            {PREVIOUS_LABEL}
          </button>
          <button
            type="button"
            disabled={!hasNextPage}
            onClick={onNextPage}
            style={buttonStyle(BOOK.width - OVERLAY.pageButtonWidth, OVERLAY.pageButtonWidth, !hasNextPage)}
          >
            {NEXT_LABEL}
          </button>
        </nav>

        <button type="button" autoFocus onClick={onClose} style={buttonStyle(OVERLAY.closeX, OVERLAY.closeWidth)}>
          {CLOSE_LABEL}
        </button>
      </div>
    </div>
  );
}
