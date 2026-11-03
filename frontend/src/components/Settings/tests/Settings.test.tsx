
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Popup from '../Settings';

describe('Settings', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        title: 'Settings',
    };

    it('does not render when closed', () => {
        render(
            <Popup {...defaultProps} isOpen={false}>
                <p>Volume settings</p>
            </Popup>
        );

        expect(screen.queryByRole('dialog'))
            .not.toBeInTheDocument();
    });

    it('renders its title and content when open', () => {
        render(
            <Popup {...defaultProps}>
                <p>Volume settings</p>
            </Popup>
        );

        expect(
            screen.getByRole('dialog', { name: 'Settings' })
        ).toBeInTheDocument();

        expect(screen.getByText('Volume settings'))
            .toBeInTheDocument();
    });

    it('renders a fullscreen dimming overlay', () => {
        render(
            <Popup {...defaultProps}>
                <p>Settings</p>
            </Popup>
        );

        const overlay = screen.getByTestId('popup-overlay');

        expect(overlay).toHaveStyle({
            position: 'fixed',
            inset: '0',
            zIndex: '1000',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
        });
    });

    it('blocks pointer events behind the popup', () => {
        render(
            <Popup {...defaultProps}>
                <p>Settings</p>
            </Popup>
        );

        const overlay = screen.getByTestId('popup-overlay');

        expect(
            window.getComputedStyle(overlay).pointerEvents
        ).not.toBe('none');

        expect(screen.getByRole('dialog'))
            .toHaveAttribute('aria-modal', 'true');
    });

    it('calls onClose when X is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <Popup {...defaultProps} onClose={onClose}>
                <p>Settings</p>
            </Popup>
        );

        await user.click(
            screen.getByRole('button', { name: 'Close popup' })
        );

        expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when Escape is pressed', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <Popup {...defaultProps} onClose={onClose}>
                <p>Settings</p>
            </Popup>
        );

        await user.keyboard('{Escape}');

        expect(onClose).toHaveBeenCalledOnce();
    });

    it('doesn\'t call onClose when not-Escape is pressed', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <Popup {...defaultProps} onClose={onClose}>
                <p>Settings</p>
            </Popup>
        );

        await user.keyboard('{w}');

        expect(onClose).not.toHaveBeenCalled();
    });

    it('matches TitleScreen styling', () => {
        render(
            <Popup {...defaultProps}>
                <p>Settings</p>
            </Popup>
        );

        expect(screen.getByRole('dialog')).toHaveStyle({
            fontFamily: 'Coiny',
            backgroundColor: '#F7FCFD',
            color: '#4C2100',
            border: '8px solid #6FB3F3',
            borderRadius: '24px',
        });
    });
});
