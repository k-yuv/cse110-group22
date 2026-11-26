import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

vi.mock('../../SettingsButton/SettingsButton', () => ({ default: () => null }));
vi.mock('../../Back-Button/backButtonView', () => ({ default: () => null }));
vi.mock('../../Back-Confirmation/backConfirmationView', () => ({ default: () => null }));
vi.mock('../../Journal/journalView', () => ({
    default: ({ placement }: { placement?: string }) => <div data-testid="journal" data-placement={placement} />,
}));
vi.mock('../../../theme', () => ({ FONT: 'Arial', COLORS: {} }));

// Konva mock only for animation.
vi.mock('konva', () => ({
    default: {
        Tween: class {
            play() {}
            destroy() {}
        },
        Animation: class {
            start() {}
            stop() {}
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
        fill?: string;
        shadowColor?: string;
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
            useImperativeHandle(ref, () => ({
                opacity() {},
                offsetX() {},
                getLayer: () => ({}),
            }));
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
        Circle: () => null,
        Path: ({ fill, shadowColor, shadowBlur, shadowOpacity }: P) => (
            <span
                data-testid="cloud-path"
                data-fill={fill}
                data-shadow-color={shadowColor}
                data-shadow-blur={shadowBlur}
                data-shadow-opacity={shadowOpacity}
            />
        ),
        Text: ({ text }: P) => <span>{text}</span>,
    };
});

import SocialMedia from '../socialMediaView.tsx';
import { COLORS, DONE_LABEL, HINT_TEXT, NEXT_LABEL, SOCIAL_LEVELS } from '../socialMediaContent.tsx';

const POSTS = SOCIAL_LEVELS.catnip.posts;
const correctId = (index: number) => POSTS[index].thoughts.find((t) => t.correct)!.id;
const wrongIds = (index: number) => POSTS[index].thoughts.filter((t) => !t.correct).map((t) => t.id);

// Provide routing context without changing browser history.
function renderSocialMedia(ui: ReactElement) {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function cloud(name: string) {
    return screen.getByRole('group', { name });
}

const thought = (id: string) => cloud(`thought-${id}`);

function look(group: HTMLElement) {
    const path = within(group).getByTestId('cloud-path');
    return {
        fill: path.getAttribute('data-fill'),
        color: path.getAttribute('data-shadow-color'),
        blur: Number(path.getAttribute('data-shadow-blur')),
    };
}

function progress() {
    return screen.getByText(/^\d+\/\d+$/).textContent;
}

describe('SocialMedia view', () => {
    it('opens the hint from the hint button', async () => {
        const user = userEvent.setup();
        renderSocialMedia(<SocialMedia />);

        await user.click(await screen.findByRole('button', { name: 'Open hint' }));

        expect(screen.getByRole('dialog', { name: 'Hint' })).toHaveTextContent(HINT_TEXT);
    });

    it('shows the corner journal used by the other activities', () => {
        renderSocialMedia(<SocialMedia />);
        expect(screen.getByTestId('journal')).toHaveAttribute('data-placement', 'corner');
    });

    it('shows all four thoughts and a three-slot progress bar right away', () => {
        renderSocialMedia(<SocialMedia />);

        expect(screen.getAllByRole('group', { name: /^thought-/ })).toHaveLength(4);
        expect(progress()).toBe('0/3');
        expect(within(cloud('next-button')).getByText(NEXT_LABEL)).toBeInTheDocument();
    });

    it('glows blue on hover', async () => {
        const user = userEvent.setup();
        renderSocialMedia(<SocialMedia />);

        await user.hover(thought(correctId(0)));
        expect(look(thought(correctId(0)))).toMatchObject({ color: COLORS.hoverGlow });
        expect(look(thought(correctId(0))).blur).toBeGreaterThan(0);
    });

    it('shakes every thought red and explains why on a wrong pick', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            renderSocialMedia(<SocialMedia />);
            const wrong = POSTS[0].thoughts.find((t) => !t.correct)!;

            await user.click(thought(wrong.id));
            await user.unhover(thought(wrong.id));

            for (const item of POSTS[0].thoughts) {
                expect(look(thought(item.id)).color).toBe(COLORS.wrongGlow);
            }
            expect(within(cloud('feedback')).getByText(wrong.feedback)).toBeInTheDocument();
            expect(progress()).toBe('0/3');

            // The red glow clears after the shake.
            act(() => { vi.advanceTimersByTime(1000); });
            expect(look(thought(wrong.id)).blur).toBe(0);
        } finally {
            vi.useRealTimers();
        }
    });

    it('turns the right thought green and unlocks Next', async () => {
        const user = userEvent.setup();
        const changed = vi.fn();
        renderSocialMedia(<SocialMedia onSelectionChange={changed} />);

        await user.click(thought(correctId(0)));
        await user.unhover(thought(correctId(0)));

        expect(look(thought(correctId(0)))).toMatchObject({
            fill: COLORS.correctFill, color: COLORS.correctGlow,
        });
        expect(look(thought(wrongIds(0)[0])).blur).toBe(0);
        expect(progress()).toBe('1/3');
        expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ correct: true }));
    });

    it('wires canvas tap events for picking a thought and pressing Next', () => {
        renderSocialMedia(<SocialMedia />);

        fireEvent.touchEnd(thought(correctId(0)));
        fireEvent.touchEnd(cloud('next-button'));

        expect(thought(correctId(1))).toBeInTheDocument();
    });

    it('does nothing when Next is pressed before the right answer', async () => {
        const user = userEvent.setup();
        renderSocialMedia(<SocialMedia />);

        await user.click(cloud('next-button'));
        expect(thought(correctId(0))).toBeInTheDocument();
    });

    it('walks through all three posts and changes Next to Done', async () => {
        const user = userEvent.setup();
        renderSocialMedia(<SocialMedia />);

        for (let index = 0; index < POSTS.length; index += 1) {
            await user.click(thought(correctId(index)));
            if (index < POSTS.length - 1) await user.click(cloud('next-button'));
        }

        expect(progress()).toBe('3/3');
        expect(within(cloud('next-button')).getByText(DONE_LABEL)).toBeInTheDocument();
    });
});
