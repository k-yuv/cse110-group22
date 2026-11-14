import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface HintProps {
  isOpen: boolean;
  onClose: () => void;
  hint: ReactNode;
}

export default function Hint({ isOpen, onClose, hint }: HintProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="hint-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hint"
        style={{
          backgroundColor: '#D9D9D9',
          color: '#4C2100',
          fontFamily: 'sans-serif',
          padding: '24px 32px',
          width: 'min(400px, 90vw)',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 12px 0',
          }}
        >
          Hint
        </h2>

        <div
          style={{
            fontSize: '20px',
            margin: '0 0 16px 0',
          }}
        >
          {hint}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            backgroundColor: '#9F9F9F',
            color: '#4C2100',
            fontFamily: 'sans-serif',
            fontSize: '16px',
            border: 'none',
            padding: '6px 48px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
