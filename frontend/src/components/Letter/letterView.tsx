import { useLetterModel } from './letterModel';
import {
  HINT_BUTTON,
  HINT_LABEL,
  LETTER_CLOSING,
  LETTER_GREETING,
  LETTER_INTRO,
  LETTER_LABEL,
  LETTER_MAX_WIDTH,
  LETTER_POINTS,
  LETTER_SIGNATURE,
  LETTER_SIGN_OFF,
  PUT_AWAY_LABEL,
} from './letterContent';
import { COLORS, FONT } from '../../theme';
import hintIcon from '../../assets/Button-Help.png';

// The whistleblower's letter, shown over the desk, and the hint button that
// brings it back. Display only: whether it's open comes from useLetterModel.
export default function Letter() {
  const { isOpen, onOpen, onPutAway } = useLetterModel();

  return (
    <>
      <button
        type="button"
        aria-label={HINT_LABEL}
        onClick={onOpen}
        style={{
          position: 'absolute',
          top: HINT_BUTTON.y,
          left: HINT_BUTTON.x,
          width: HINT_BUTTON.size,
          height: HINT_BUTTON.size,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        <img src={hintIcon} alt="" style={{ width: '100%', height: '100%' }} />
      </button>

      {/* Covers the whole screen above the desk, the journal and settings, so
          nothing behind it can be clicked until the letter is put away. */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: COLORS.overlay,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={LETTER_LABEL}
            style={{
              width: `min(${LETTER_MAX_WIDTH}px, 90vw)`,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              padding: '32px 40px',
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.text,
              fontFamily: FONT,
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <p style={{ marginTop: 0 }}>{LETTER_GREETING}</p>
            <p>{LETTER_INTRO}</p>
            <ul>
              {LETTER_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p>{LETTER_CLOSING}</p>
            <p>
              {LETTER_SIGN_OFF}
              <br />
              {LETTER_SIGNATURE}
            </p>

            <button
              type="button"
              onClick={onPutAway}
              style={{
                alignSelf: 'center',
                marginTop: 8,
                padding: '8px 48px',
                border: 'none',
                borderRadius: 8,
                background: COLORS.journalButton,
                color: COLORS.journalText,
                fontFamily: FONT,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              {PUT_AWAY_LABEL}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
