import type { ReactNode } from 'react';
import { useState } from 'react';
import Hint from '../Hint/Hint';
import hintIcon from '../../assets/Button-Help.png';

interface HintButtonProps {
  hint: ReactNode;
  x?: number;
  y?: number;
  size?: number;
}

export default function HintButton({
  hint,
  x = 20,
  y = 90,
  size = 60,
}: HintButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open hint"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width: size,
          height: size,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        <img
          src={hintIcon}
          alt=""
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </button>

      <Hint isOpen={isOpen} onClose={() => setIsOpen(false)} hint={hint} />
    </>
  );
}
