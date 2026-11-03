import type { ReactNode } from 'react';
import { useEffect} from 'react';

interface PopupProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Settings({ isOpen, onClose, title, children }: PopupProps) {
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
            data-testid="popup-overlay"
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
                aria-label={title}
                style={{
                    position: 'relative',
                    backgroundColor: '#F7FCFD',
                    color: '#4C2100',
                    fontFamily: 'Coiny',
                    border: '8px solid #6FB3F3',
                    borderRadius: '24px',
                    padding: '32px',
                    width: 'min(400px, 90vw)',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                }}
            >
                <button
                    type="button"
                    aria-label="Close popup"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        border: 'none',
                        background: 'transparent',
                        color: '#4C2100',
                        fontFamily: 'Coiny',
                        fontSize: '22px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                    }}
                >
                    ✕
                </button>

                <h2
                    style={{
                        fontFamily: 'Coiny',
                        fontSize: '32px',
                        fontWeight: 'normal',
                        margin: '0 0 16px 0',
                    }}
                >
                    {title}
                </h2>

                {children}
            </div>
        </div>
    );
}
