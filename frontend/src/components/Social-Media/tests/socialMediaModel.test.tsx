import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeActivity, getProgress } from '../../../services/progress';
import { ROUTES } from '../../../routes';
import { LAYOUT, SCENE, SOCIAL_LEVELS } from '../socialMediaContent.tsx';
import { useSocialMediaModel } from '../socialMediaModel.tsx';
import { JournalController } from '../../Journal/JournalController';
import { ALL_STORY_EVIDENCE } from '../../Journal/storyEvidence';
import * as journalAdapter from '../../NewsArticle/journalAdapter';

// The real progress service, except completeActivity can be made to fail in a
// single test with mockRejectedValueOnce.
vi.mock('../../../services/progress', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../services/progress')>();
    return { ...actual, completeActivity: vi.fn(actual.completeActivity) };
});

const POSTS = SOCIAL_LEVELS.catnip.posts;
const correctId = (index: number) => POSTS[index].thoughts.find((t) => t.correct)!.id;
const wrongId = (index: number) => POSTS[index].thoughts.find((t) => !t.correct)!.id;

function renderModel(changed?: Parameters<typeof useSocialMediaModel>[1]) {
    return renderHook(
        () => ({ model: useSocialMediaModel('catnip', changed), path: useLocation().pathname }),
        { wrapper: ({ children }) => <MemoryRouter initialEntries={[ROUTES.socialMedia]}>{children}</MemoryRouter> },
    ).result;
}

// Answers every post correctly and stops on the last one, ready for Done.
function solveAll(result: ReturnType<typeof renderModel>) {
    POSTS.forEach((_, index) => {
        act(() => result.current.model.selectThought(correctId(index)));
        if (index < POSTS.length - 1) act(() => result.current.model.onAdvance());
    });
}

describe('useSocialMediaModel answering', () => {
    beforeEach(() => localStorage.clear());

    it('gives feedback and shakes on a wrong pick without unlocking Next', () => {
        const changed = vi.fn();
        const result = renderModel(changed);

        act(() => result.current.model.selectThought(wrongId(0)));

        const thought = POSTS[0].thoughts.find((t) => t.id === wrongId(0))!;
        expect(result.current.model.feedback).toMatchObject({ text: thought.feedback, correct: false });
        expect(result.current.model.wrongCount).toBe(1);
        expect(result.current.model.canAdvance).toBe(false);
        expect(result.current.model.completedPosts).toBe(0);
        expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ thoughtId: wrongId(0), correct: false }));
    });

    it('replays feedback each time, even for the same wrong thought', () => {
        const result = renderModel();

        act(() => result.current.model.selectThought(wrongId(0)));
        const firstKey = result.current.model.feedback!.key;
        act(() => result.current.model.selectThought(wrongId(0)));

        expect(result.current.model.feedback!.key).not.toBe(firstKey);
        expect(result.current.model.wrongCount).toBe(2);
    });

    it('unlocks Next and fills a progress slot on the right pick, then locks the post', () => {
        const result = renderModel();

        act(() => result.current.model.selectThought(correctId(0)));
        expect(result.current.model.canAdvance).toBe(true);
        expect(result.current.model.completedPosts).toBe(1);
        expect(result.current.model.feedback?.correct).toBe(true);

        act(() => result.current.model.selectThought(wrongId(0)));
        expect(result.current.model.selection?.thoughtId).toBe(correctId(0));
        expect(result.current.model.wrongCount).toBe(0);
    });

    it('ignores Next until the post is solved', () => {
        const result = renderModel();

        act(() => result.current.model.onAdvance());
        expect(result.current.model.postIndex).toBe(0);
    });

    it('moves to the next post with a fresh selection and no feedback', () => {
        const result = renderModel();

        act(() => result.current.model.selectThought(correctId(0)));
        act(() => result.current.model.onAdvance());

        expect(result.current.model.post.id).toBe(POSTS[1].id);
        expect(result.current.model.selection).toBeNull();
        expect(result.current.model.feedback).toBeNull();
        expect(result.current.model.completedPosts).toBe(1);
        expect(result.current.model.isDone).toBe(false);
    });

    it('starts the next post with no wrong picks so its clouds do not flash red', () => {
        const result = renderModel();

        act(() => result.current.model.selectThought(wrongId(0)));
        act(() => result.current.model.selectThought(correctId(0)));
        act(() => result.current.model.onAdvance());

        expect(result.current.model.wrongCount).toBe(0);
    });

    it('rejects a nonexistent thought', () => {
        const result = renderModel();
        expect(() => act(() => result.current.model.selectThought('missing'))).toThrow(RangeError);
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
                Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
                Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
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

    it('becomes Done once the last post is solved, then saves all evidence and returns to the desk', async () => {
        const result = renderModel();

        solveAll(result);
        expect(result.current.model.isDone).toBe(true);
        expect(result.current.model.completedPosts).toBe(POSTS.length);

        await act(async () => result.current.model.onAdvance());

        await waitFor(() => expect(result.current.path).toBe(ROUTES.desk));
        expect(await getProgress()).toEqual(['social']);
        const journalIds = JournalController.getInstance().read().map((item) => item.id);
        POSTS.flatMap((p) => p.evidenceIds).forEach((id) => expect(journalIds).toContain(id));
    });

    it('shows an error and stays put if saving progress fails', async () => {
        vi.mocked(completeActivity).mockRejectedValueOnce(new Error('down'));
        const result = renderModel();

        solveAll(result);
        await act(async () => result.current.model.onAdvance());

        await waitFor(() => expect(result.current.model.error).not.toBe(''));
        expect(result.current.model.finishing).toBe(false);
        expect(result.current.path).toBe(ROUTES.socialMedia);
    });

    it('stays put without marking progress if the evidence cannot be saved', async () => {
        const add = vi.spyOn(journalAdapter, 'addEvidence').mockResolvedValueOnce(false);
        const result = renderModel();

        solveAll(result);
        await act(async () => result.current.model.onAdvance());

        await waitFor(() => expect(result.current.model.error).not.toBe(''));
        expect(await getProgress()).toEqual([]);
        expect(result.current.path).toBe(ROUTES.socialMedia);
        add.mockRestore();
    });
});

describe('social media evidence', () => {
    it('gives evidence for every level, all of which exists in the story evidence', () => {
        const ids = new Set(ALL_STORY_EVIDENCE.map((item) => item.id));
        for (const level of Object.values(SOCIAL_LEVELS)) {
            const given = level.posts.flatMap((post) => post.evidenceIds);
            expect(given.length).toBeGreaterThan(0);
            given.forEach((id) => expect(ids.has(id)).toBe(true));
        }
    });
});
