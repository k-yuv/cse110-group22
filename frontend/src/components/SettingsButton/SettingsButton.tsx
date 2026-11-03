import { useState } from 'react';
import Settings from '../Settings/Settings';
import settingsIcon from '../../assets/settings.png';

interface SettingsButtonProps {
    x?: number;
    y?: number;
    size?: number;
}

export default function SettingsButton({ x = 20, y = 20, size = 60 }: SettingsButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label="Open settings"
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
                    src={settingsIcon}
                    alt=""
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
            </button>

            <Settings
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Settings" children={undefined}            >
            </Settings>
        </>
    );
}
