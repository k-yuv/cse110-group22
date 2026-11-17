import type { CSSProperties } from 'react';
import { COLORS, FONT } from '../../../theme';
import { useHoverModel } from '../../Hover/hoverModel';

// How fast the color changes on hover.
const HOVER_DURATION = '150ms';

interface ConfirmButtonProps {
  label: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
  autoFocus?: boolean;
}

// Go Back or Stay. Darkens a little while the mouse is over it (no size
// change). Keyboard focus shows the browser's normal outline instead, so
// Stay (focused when the popup opens) doesn't look hovered.
export default function ConfirmButton({ label, color, hoverColor, onClick, autoFocus }: ConfirmButtonProps) {
  const { hovered, handlers } = useHoverModel();

  return (
    <button
      type="button"
      autoFocus={autoFocus}
      onClick={onClick}
      {...handlers}
      style={{
        ...buttonStyle,
        background: hovered ? hoverColor : color,
      }}
    >
      {label}
    </button>
  );
}

// Rounded like the title screen buttons; red and green keep the mockup's
// meaning (leave / stay).
const buttonStyle: CSSProperties = {
  flex: 1,
  height: '52px',
  border: `4px solid ${COLORS.popupText}`,
  borderRadius: '24px',
  color: COLORS.popupText,
  fontFamily: FONT,
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: `background ${HOVER_DURATION}`,
};
