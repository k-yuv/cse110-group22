import type { CSSProperties } from 'react';
import { COLORS } from '../../theme';
import { useHoverModel } from '../Hover/hoverModel';

export const BACK_BUTTON_LABEL = 'Back to desk';

// How much the button grows while highlighted, and how fast. Same as
// TitleButton, so the game's buttons feel alike.
const HIGHLIGHT_SCALE = 1.05;
const HIGHLIGHT_DURATION = '150ms';

interface BackButtonProps {
  onClick: () => void;
  size?: number;
  // Overrides for where the button sits. By default it's in the top left
  // corner of the nearest positioned element (usually the screen's <main>).
  style?: CSSProperties;
}

// The round back arrow shared by every activity screen. What it does is up to
// the screen, usually opening the back confirmation. Grows slightly and
// lightens a little while hovered or focused.
export default function BackButton({ onClick, size = 56, style }: BackButtonProps) {
  // Keyboard focus shows the same effect, so keyboard players can see it.
  const { hovered, focused, handlers } = useHoverModel();
  const highlighted = hovered || focused;
  const arrowSize = size * 0.4;

  return (
    <button
      type="button"
      aria-label={BACK_BUTTON_LABEL}
      onClick={onClick}
      {...handlers}
      style={{
        position: 'absolute',
        left: 16,
        top: 16,
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: highlighted ? COLORS.backButtonHover : COLORS.backButton,
        transform: highlighted ? `scale(${HIGHLIGHT_SCALE})` : 'scale(1)',
        transition: `transform ${HIGHLIGHT_DURATION} ease-out, background ${HIGHLIGHT_DURATION}`,
        cursor: 'pointer',
        zIndex: 1,
        ...style,
      }}
    >
      <svg
        width={arrowSize}
        height={arrowSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLORS.backButtonArrow}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="20" y1="12" x2="4" y2="12" />
        <polyline points="10,6 4,12 10,18" />
      </svg>
    </button>
  );
}
