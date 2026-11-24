
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeActivity, getProgress } from '../../../services/progress';
import { ROUTES } from '../../../routes';
import {
    getSocialPost, LAYOUT, SCENE, SOCIAL_LEVELS,
    type SocialPost,
} from '../socialMediaContent.tsx';
import { useSocialMediaModel } from '../socialMediaModel.tsx';

// The real progress service, except completeActivity can be made to fail in a
// single test with mockRejectedValueOnce.
vi.mock('../../../services/progress', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../services/progress')>();
    return { ...actual, completeActivity: vi.fn(actual.completeActivity) };
});

describe('useSocialMediaModel', () => {
    it('keeps only the latest answer and sends complete metadata to its consumer', () => {
        const changed = vi.fn();
        const { result } = renderHook(
            () => useSocialMediaModel('catnip', 0, changed),
            { wrapper: MemoryRouter },
        );

        act(() => result.current.toggleThoughts());
        act(() => result.current.selectThought('catnip-support-1'));
        expect(result.current.selection?.thoughtId).toBe('catnip-support-1');
        expect(changed).toHaveBeenLastCalledWith({
            levelId: 'catnip', postId: 'catnip-influencer',
            thoughtId: 'catnip-support-1', stance: 'supporting',
        });

        act(() => result.current.selectThought('catnip-question-1'));
        expect(result.current.selection?.thoughtId).toBe('catnip-question-1');
        expect(changed).toHaveBeenCalledTimes(2);
        expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ stance: 'questioning' }));
    });

    it('deselects the current answer only when that same answer is selected again', () => {
        const changed = vi.fn();
        const { result } = renderHook(
            () => useSocialMediaModel('catnip', 0, changed),
            { wrapper: MemoryRouter },
        );

        act(() => result.current.selectThought('catnip-support-2'));
        act(() => result.current.selectThought('catnip-support-2'));
        expect(result.current.selection).toBeNull();
        expect(changed).toHaveBeenCalledTimes(2);
        expect(changed).toHaveBeenLastCalledWith(null);
    });

    it('keeps an answer selected through Clear Mind and Gather Thoughts', () => {
        const changed = vi.fn();
        const { result } = renderHook(
            () => useSocialMediaModel('catnip', 0, changed),
            { wrapper: MemoryRouter },
        );

        act(() => result.current.toggleThoughts());
        act(() => result.current.selectThought('catnip-support-1'));
        act(() => result.current.toggleThoughts());

        // Clear Mind hides the choices; it does NOT erase the user's answer.
        expect(result.current.thoughtsOpen).toBe(false);
        expect(result.current.selection?.thoughtId).toBe('catnip-support-1');

        act(() => result.current.toggleThoughts());
        expect(result.current.thoughtsOpen).toBe(true);
        expect(result.current.selection?.thoughtId).toBe('catnip-support-1');

        // Visibility changes should not emit new answers (or null) to the backend.
        expect(changed).toHaveBeenCalledTimes(1);
    });

    it('rejects a nonexistent thought without changing its selected answer', () => {
        const changed = vi.fn();
        const { result } = renderHook(
            () => useSocialMediaModel('catnip', 0, changed),
            { wrapper: MemoryRouter },
        );

        act(() => result.current.selectThought('catnip-support-1'));

        expect(() => act(() => result.current.selectThought('missing'))).toThrow(RangeError);
        expect(result.current.selection?.thoughtId).toBe('catnip-support-1');
        expect(changed).toHaveBeenCalledTimes(1);
    });

    it('resets visible choices and selection when scrolling to a new post', () => {
        // There is only one production post so far. Temporarily add a second fixture
        // to exercise the actual prop-change path without adding test-only app files.
        const posts = SOCIAL_LEVELS.catnip.posts as SocialPost[];
        const original = getSocialPost('catnip');
        const nextPost: SocialPost = {
            ...original,
            id: 'catnip-followup',
            thoughts: original.thoughts.map(t => ({
                ...t,
                id: `followup-${t.id}`,
            })) as unknown as SocialPost['thoughts'],
        };
        posts.push(nextPost);

        try {
            const { result, rerender, unmount } = renderHook(
                ({ index }) => useSocialMediaModel('catnip', index),
                {
                    initialProps: { index: 0 },
                    wrapper: MemoryRouter,
                },
            );

            act(() => result.current.toggleThoughts());
            act(() => result.current.selectThought('catnip-support-1'));

            rerender({ index: 1 });
            expect(result.current.post.id).toBe('catnip-followup');
            expect(result.current.thoughtsOpen).toBe(false);
            expect(result.current.selection).toBeNull();

            act(() => result.current.toggleThoughts());
            act(() => result.current.selectThought('followup-catnip-question-1'));
            expect(result.current.selection?.postId).toBe('catnip-followup');

            rerender({ index: 0 });
            expect(result.current.thoughtsOpen).toBe(false);
            expect(result.current.selection).toBeNull();
            unmount();
        } finally {
            posts.pop();
        }
    });

    it('recalculates the canvas transform on resize', () => {
        const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
        const heightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight');
        const removeListener = vi.spyOn(window, 'removeEventListener');

        const { result, unmount } = renderHook(
            () => useSocialMediaModel('catnip'),
            { wrapper: MemoryRouter },
        );

        try {
            act(() => {
                Object.defineProperty(window, 'innerWidth', {
                    configurable: true,
                    value: 1200,
                });
                Object.defineProperty(window, 'innerHeight', {
                    configurable: true,
                    value: 600,
                });
                window.dispatchEvent(new Event('resize'));
            });

            const scale = Math.min(1200 / SCENE.width, 600 / SCENE.height);
            expect(result.current.width).toBe(1200);
            expect(result.current.height).toBe(600);
            expect(result.current.scale).toBeCloseTo(scale);
            expect(result.current.originX).toBeCloseTo((1200 - SCENE.width * scale) / 2);
            expect(result.current.originY).toBeCloseTo(
                (600 - SCENE.height * scale) / 2 + LAYOUT.verticalOffset * scale,
            );
        } finally {
            unmount();
            if (widthDescriptor) Object.defineProperty(window, 'innerWidth', widthDescriptor);
            if (heightDescriptor) Object.defineProperty(window, 'innerHeight', heightDescriptor);
        }

        expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
        removeListener.mockRestore();
    });
});

describe('useSocialMediaModel finishing', () => {
    beforeEach(() => localStorage.clear());

    function renderModel() {
        return renderHook(
            () => ({ model: useSocialMediaModel('catnip'), path: useLocation().pathname }),
            { wrapper: ({ children }) => <MemoryRouter initialEntries={[ROUTES.socialMedia]}>{children}</MemoryRouter> },
        ).result;
    }

    it('cannot finish until a thought is picked', async () => {
        const result = renderModel();

        expect(result.current.model.canFinish).toBe(false);
        await act(() => result.current.model.onFinish());

        expect(await getProgress()).toEqual([]);
        expect(result.current.path).toBe(ROUTES.socialMedia);
    });

    it('marks Social Media done and returns to the desk after a pick', async () => {
        const result = renderModel();

        act(() => result.current.model.selectThought('catnip-support-1'));
        expect(result.current.model.canFinish).toBe(true);
        await act(() => result.current.model.onFinish());

        expect(await getProgress()).toEqual(['social']);
        expect(result.current.path).toBe(ROUTES.desk);
    });

    it('shows an error and stays put if saving fails', async () => {
        vi.mocked(completeActivity).mockRejectedValueOnce(new Error('down'));
        const result = renderModel();

        act(() => result.current.model.selectThought('catnip-question-1'));
        await act(() => result.current.model.onFinish());

        await waitFor(() => expect(result.current.model.error).not.toBe(''));
        expect(result.current.model.finishing).toBe(false);
        expect(result.current.path).toBe(ROUTES.socialMedia);
    });
});
