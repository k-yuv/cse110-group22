import type { CSSProperties } from 'react';
import { visuallyHidden } from '../../helpers';
import { COLORS, FONT } from '../../theme';

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
};

const labelStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: 22,
  fontWeight: 'bold',
  lineHeight: '30px',
  color: COLORS.progressBorder,
};

const barStyle: CSSProperties = {
  padding: 9,
  display: 'flex',
  gap: 8,
  background: COLORS.progressBar,
  border: `3px solid ${COLORS.progressBorder}`,
  borderRadius: 5,
};

const segmentStyle: CSSProperties = {
  position: 'relative',
  width: 45,
  height: 55,
  borderRadius: 5,
  background: COLORS.progressTodo,
};

// Pops into the slot when it is completed, with a slight overshoot, and
// shrinks back out if it is undone.
const fillStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 5,
  background: COLORS.progressDone,
  transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
  // Positions the bar within the parent screen.
  style?: CSSProperties;
}

// Segmented progress bar from the "Progress Bar" Figma component: one slot
// per step, filled left to right as steps are completed.
export default function ProgressBar({ completed, total, label = 'Progress', style }: ProgressBarProps) {
  return (
    <div style={{ ...containerStyle, ...style }} aria-live="polite">
      <span style={labelStyle}>{label}</span>
      <div style={barStyle}>
        <span style={visuallyHidden}>{completed}/{total}</span>
        {Array.from({ length: total }, (_, index) => (
          <span key={index} style={segmentStyle}>
            <span style={{ ...fillStyle, transform: index < completed ? 'scale(1)' : 'scale(0)' }} />
          </span>
        ))}
      </div>
    </div>
  );
}
