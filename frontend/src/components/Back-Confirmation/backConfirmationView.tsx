import type { CSSProperties } from 'react';
import { COLORS, FONT } from '../../theme';
import { CONFIRM_TITLE, GO_BACK_LABEL, STAY_LABEL, confirmMessage } from './backConfirmationContent';
import ConfirmButton from './parts/confirmButtonView';

interface BackConfirmationProps {
  isOpen: boolean;
  // Named in the message, e.g. "You will lose all your progress on AI Images".
  activityName: string;
  onGoBack: () => void;
  onStay: () => void;
}

// Asks before the player leaves an activity and loses their progress.
// Display only: the screen's model decides when it's open, what Go Back
// does, and handles Escape (see useBackConfirmationModel).
//
// The overlay is position: fixed, so render it outside any transformed
// element (like Article Writing's scaled section), or it won't cover the
// window.
export default function BackConfirmation({ isOpen, activityName, onGoBack, onStay }: BackConfirmationProps) {
  if (!isOpen) return null;

  return (
    // Covers the whole window, so the screen underneath can't be clicked.
    <div data-testid="back-confirmation-overlay" style={overlayStyle}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="back-confirmation-title"
        aria-describedby="back-confirmation-message"
        style={boxStyle}
      >
        <h2 id="back-confirmation-title" style={titleStyle}>
          {CONFIRM_TITLE}
        </h2>
        <p id="back-confirmation-message" style={messageStyle}>
          {confirmMessage(activityName)}
        </p>
        <div style={buttonRowStyle}>
          <ConfirmButton
            label={GO_BACK_LABEL}
            color={COLORS.goBackButton}
            hoverColor={COLORS.goBackButtonHover}
            onClick={onGoBack}
          />
          {/* Focused first, so pressing Enter keeps the player's progress. */}
          <ConfirmButton
            label={STAY_LABEL}
            color={COLORS.stayButton}
            hoverColor={COLORS.stayButtonHover}
            onClick={onStay}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: COLORS.overlay,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

// Same box and title as the Settings popup.
const boxStyle: CSSProperties = {
  backgroundColor: COLORS.popupBox,
  color: COLORS.popupText,
  fontFamily: 'Coiny',
  border: `8px solid ${COLORS.popupBorder}`,
  borderRadius: '24px',
  padding: '32px',
  width: 'min(480px, 90vw)',
  boxSizing: 'border-box',
  textAlign: 'center',
};

const titleStyle: CSSProperties = {
  fontFamily: 'Coiny',
  fontSize: '32px',
  fontWeight: 'normal',
  margin: '0 0 16px 0',
};

// The message and buttons use the desk's font; only the title is Coiny.
const messageStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: '20px',
  lineHeight: 1.3,
  margin: '0 0 24px 0',
};

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
};
