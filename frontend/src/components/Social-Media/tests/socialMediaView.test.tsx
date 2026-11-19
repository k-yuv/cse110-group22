
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

vi.mock('../../SettingsButton/SettingsButton', () => ({ default: () => null }));
vi.mock('../../URLImage/URLImage', () => ({ URLImage: () => null }));
vi.mock('../../Back-Button/backButtonView', () => ({ default: () => null }));
vi.mock('../../Back-Confirmation/backConfirmationView', () => ({ default: () => null }));
vi.mock('../../../assets/Journal-Corner-View.png', () => ({ default: '/journal.png' }));
vi.mock('../../../theme', () => ({ FONT: 'Arial', COLORS: { hoverGlow: '#ffbc00' } }));

// Konva mock only for animation.
vi.mock('konva', () => ({
    default: {
        Tween: class {
            play() {}
            destroy() {}
        },
        Easings: { EaseInOut: (value: number) => value },
    },
}));

vi.mock('react-konva', async () => {
    const { useImperativeHandle } = await import('react');

    type P = {
        children?: React.ReactNode;
        name?: string;
        text?: string;
        ref?: React.Ref<unknown>;
        shadowBlur?: number;
        shadowOpacity?: number;
        onClick?: () => void;
        onTap?: () => void;
        onMouseEnter?: (event: unknown) => void;
        onMouseLeave?: (event: unknown) => void;
    };

    const pointerEvent = (el: Element) => ({
        target: { getStage: () => ({ container: () => el.closest('main') }) },
    });

    return {
        Stage: ({ children }: P) => <div>{children}</div>,
        Layer: ({ children }: P) => <div>{children}</div>,
        Group: ({ children, name, onClick, onTap, onMouseEnter, onMouseLeave, ref }: P) => {
            useImperativeHandle(ref, () => ({}));
            return (
                <div
                    role={name ? 'group' : undefined}
                    aria-label={name}
                    onClick={onClick}
                    onTouchEnd={onTap}
                    onMouseEnter={event => onMouseEnter?.(pointerEvent(event.currentTarget))}
                    onMouseLeave={event => onMouseLeave?.(pointerEvent(event.currentTarget))}
                >
                    {children}
                </div>
            );
        },
        Rect: () => null,
        Line: () => null,
        // Retained for the Konva test mock.
        Path: ({ shadowBlur, shadowOpacity }: P) => (
            <span
                data-testid="cloud-path"
                data-shadow-blur={shadowBlur}
                data-shadow-opacity={shadowOpacity}
            />
        ),
        Text: ({ text }: P) => <span>{text}</span>,
    };
});

import SocialMedia from '../socialMediaView.tsx';

// Provide routing context without changing browser history.
function renderSocialMedia(ui: ReactElement) {
    return render(
        <MemoryRouter>
            {ui}
        </MemoryRouter>,
    );
}

function thought(id: string) {
    return screen.getByRole('group', { name: `thought-${id}` });
}

function shadow(id: string) {
    const path = within(thought(id)).getByTestId('cloud-path');
    return {
        blur: Number(path.getAttribute('data-shadow-blur')),
        opacity: Number(path.getAttribute('data-shadow-opacity')),
    };
}

describe('SocialMedia view', () => {
    it('keeps the selected cloud glowing after hover ends and notifies the consumer', async () => {
        const user = userEvent.setup();
        const onSelectionChange = vi.fn();
        renderSocialMedia(<SocialMedia onSelectionChange={onSelectionChange} />);

        await user.click(screen.getByText('Gather Thoughts'));
        await user.click(thought('catnip-question-1'));
        await user.unhover(thought('catnip-question-1'));

        expect(onSelectionChange).toHaveBeenLastCalledWith({
            levelId: 'catnip', postId: 'catnip-influencer',
            thoughtId: 'catnip-question-1', stance: 'questioning',
        });
        expect(shadow('catnip-question-1').blur).toBeGreaterThan(0);
        expect(shadow('catnip-question-1').opacity).toBeGreaterThan(0);
        expect(shadow('catnip-support-1').blur).toBe(0);
    });

    it('switches the glow to the latest choice instead of leaving multiple selected', async () => {
        const user = userEvent.setup();
        const changed = vi.fn();
        renderSocialMedia(<SocialMedia onSelectionChange={changed} />);

        await user.click(screen.getByText('Gather Thoughts'));
        await user.click(thought('catnip-support-1'));
        await user.click(thought('catnip-question-2'));
        await user.unhover(thought('catnip-question-2'));

        expect(changed).toHaveBeenCalledTimes(2);
        expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({
            thoughtId: 'catnip-question-2',
        }));
        expect(shadow('catnip-support-1').blur).toBe(0);
        expect(shadow('catnip-question-2').blur).toBeGreaterThan(0);
    });

    it('restores the chosen cloud after Clear Mind, without erasing or re-emitting it', async () => {
        const user = userEvent.setup();
        const changed = vi.fn();
        renderSocialMedia(<SocialMedia onSelectionChange={changed} />);

        await user.click(screen.getByText('Gather Thoughts'));
        await user.click(thought('catnip-support-2'));
        await user.click(screen.getByText('Clear Mind'));
        expect(screen.queryAllByRole('group', { name: /^thought-/ })).toHaveLength(0);

        await user.click(screen.getByText('Gather Thoughts'));
        expect(shadow('catnip-support-2').blur).toBeGreaterThan(0);
        expect(changed).toHaveBeenCalledTimes(1);
    });

    it('wires canvas tap events for opening and selecting a thought', () => {
        const changed = vi.fn();
        renderSocialMedia(<SocialMedia onSelectionChange={changed} />);

        fireEvent.touchEnd(screen.getByText('Gather Thoughts'));
        expect(screen.getAllByRole('group', { name: /^thought-/ })).toHaveLength(4);

        fireEvent.touchEnd(thought('catnip-question-2'));
        expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({
            thoughtId: 'catnip-question-2',
        }));
    });

    it('turns the glow off and emits null when the current choice is clicked twice', async () => {
        const user = userEvent.setup();
        const changed = vi.fn();
        renderSocialMedia(<SocialMedia onSelectionChange={changed} />);

        await user.click(screen.getByText('Gather Thoughts'));
        await user.click(thought('catnip-support-1'));
        await user.click(thought('catnip-support-1'));
        await user.unhover(thought('catnip-support-1'));

        expect(shadow('catnip-support-1').blur).toBe(0);
        expect(changed).toHaveBeenCalledTimes(2);
        expect(changed).toHaveBeenLastCalledWith(null);
    });
});
