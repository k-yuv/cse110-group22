import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { useNewsArticleModel } from '../newsArticleModel';
import { ADD_EVIDENCE_FIRST_MESSAGE, MESSAGE_SECONDS } from '../newsArticleContent';
import { addEvidence } from '../journalAdapter';
import { ROUTES } from '../../../routes';
import { getArticleActivity } from '../../../services/articles';
import { completeActivity, getProgress } from '../../../services/progress';

// The real mock article and progress services, except a single test can make
// one of them fail with mockRejectedValueOnce.
vi.mock('../../../services/articles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/articles')>();
  return { ...actual, getArticleActivity: vi.fn(actual.getArticleActivity) };
});
vi.mock('../../../services/progress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/progress')>();
  return { ...actual, completeActivity: vi.fn(actual.completeActivity) };
});

// These tests check what the model hands to the Journal. journalFlow.test.tsx
// checks that it really arrives.
vi.mock('../journalAdapter', () => ({ addEvidence: vi.fn() }));

function Router({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={[ROUTES.onlineArticle]}>{children}</MemoryRouter>;
}

// The article is drawn on a canvas, which tests can't see (see
// internal-docs/Konva-Testing.md), so these tests run the model directly and
// read the router's path to see where Continue went. Sentence ids come from
// the loaded article rather than being typed out, so changing the story
// doesn't break the tests.
async function renderArticleModel() {
  const { result } = renderHook(() => ({ article: useNewsArticleModel(), path: useLocation().pathname }), {
    wrapper: Router,
  });
  await waitFor(() => expect(result.current.article.loading).toBe(false));

  const { segments, answerKey, evidenceIds } = result.current.article.activity!;
  const answerIds = answerKey.map((entry) => entry.segmentId);
  const wrongId = segments.find((segment) => !answerIds.includes(segment.id))!.id;

  return { result, answerIds, wrongId, evidenceIds };
}

type ArticleResult = Awaited<ReturnType<typeof renderArticleModel>>['result'];

function clickSentences(result: ArticleResult, ids: string[]) {
  for (const id of ids) act(() => result.current.article.onSentenceClick(id));
}

// Highlights exactly the misinformation and submits it.
async function passArticle(result: ArticleResult) {
  const { answerKey } = result.current.article.activity!;
  act(() => result.current.article.onToggleHighlighter());
  clickSentences(result, answerKey.map((entry) => entry.segmentId));
  await act(async () => result.current.article.onSubmit());
}

describe('useNewsArticleModel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('loads the article with nothing highlighted and the highlighter put down', async () => {
    const { result } = await renderArticleModel();

    expect(result.current.article.error).toBe('');
    expect(result.current.article.highlightedIds).toEqual([]);
    expect(result.current.article.holdingHighlighter).toBe(false);
    expect(result.current.article.result).toBeNull();
  });

  it('shows an error, and submitting does nothing, if the article fails to load', async () => {
    vi.mocked(getArticleActivity).mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useNewsArticleModel(), { wrapper: Router });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.onSubmit());

    expect(result.current.error).not.toBe('');
    expect(result.current.result).toBeNull();
  });

  it('picks up the highlighter, and puts it down when clicked again', async () => {
    const { result } = await renderArticleModel();

    act(() => result.current.article.onToggleHighlighter());
    expect(result.current.article.holdingHighlighter).toBe(true);

    act(() => result.current.article.onToggleHighlighter());
    expect(result.current.article.holdingHighlighter).toBe(false);
  });

  it('ignores clicks on sentences without the highlighter', async () => {
    const { result, wrongId } = await renderArticleModel();

    clickSentences(result, [wrongId]);

    expect(result.current.article.highlightedIds).toEqual([]);
  });

  it('highlights a sentence, and removes the highlight on a second click', async () => {
    const { result, wrongId } = await renderArticleModel();
    act(() => result.current.article.onToggleHighlighter());

    clickSentences(result, [wrongId]);
    expect(result.current.article.highlightedIds).toEqual([wrongId]);

    clickSentences(result, [wrongId]);
    expect(result.current.article.highlightedIds).toEqual([]);
  });

  it('fails a wrong submission, keeps the highlights, and saves nothing', async () => {
    const { result, answerIds, wrongId } = await renderArticleModel();
    act(() => result.current.article.onToggleHighlighter());
    clickSentences(result, [answerIds[0], wrongId]);

    await act(async () => result.current.article.onSubmit());

    expect(result.current.article.result?.passed).toBe(false);
    expect(result.current.article.highlightedIds).toEqual([answerIds[0], wrongId]);
    expect(addEvidence).not.toHaveBeenCalled();
    expect(await getProgress()).toEqual([]);
  });

  it('clears a failed result once the player changes a highlight', async () => {
    const { result, wrongId } = await renderArticleModel();
    act(() => result.current.article.onToggleHighlighter());
    clickSentences(result, [wrongId]);
    await act(async () => result.current.article.onSubmit());

    clickSentences(result, [wrongId]);

    expect(result.current.article.result).toBeNull();
  });

  it('passes when exactly the misinformation is highlighted, without saving anything yet', async () => {
    const { result } = await renderArticleModel();

    await passArticle(result);

    expect(result.current.article.result?.passed).toBe(true);
    expect(result.current.article.evidenceAdded).toBe(false);
    expect(addEvidence).not.toHaveBeenCalled();
    expect(await getProgress()).toEqual([]);
  });

  it('puts the highlighter down and locks the sentences after passing', async () => {
    const { result, answerIds, wrongId } = await renderArticleModel();
    await passArticle(result);

    expect(result.current.article.holdingHighlighter).toBe(false);

    clickSentences(result, [wrongId]);

    expect(result.current.article.highlightedIds).toEqual(answerIds);
    expect(result.current.article.result?.passed).toBe(true);
  });

  it('does not let the player leave after passing until the evidence is added', async () => {
    const { result } = await renderArticleModel();
    expect(result.current.article.canGoBack).toBe(true);

    await passArticle(result);
    expect(result.current.article.canGoBack).toBe(false);

    act(() => result.current.article.onContinue());

    expect(result.current.article.message).toBe(ADD_EVIDENCE_FIRST_MESSAGE);
    expect(result.current.path).toBe(ROUTES.onlineArticle);
  });

  it('clears the message on its own after a few seconds', async () => {
    const { result } = await renderArticleModel();
    await passArticle(result);
    vi.useFakeTimers();
    act(() => result.current.article.onContinue());

    act(() => vi.advanceTimersByTime(MESSAGE_SECONDS * 1000));

    expect(result.current.article.message).toBe('');
    vi.useRealTimers();
  });

  // The integration path: highlight the misinformation, submit, add the
  // evidence, and the evidence and progress are both saved.
  it('adds the evidence and saves progress, then lets the player continue to the desk', async () => {
    const { result, evidenceIds } = await renderArticleModel();
    await passArticle(result);
    act(() => result.current.article.onContinue());

    await act(() => result.current.article.onAddEvidence());

    for (const id of evidenceIds) expect(addEvidence).toHaveBeenCalledWith(id);
    expect(addEvidence).toHaveBeenCalledTimes(evidenceIds.length);
    expect(await getProgress()).toEqual(['articles']);
    expect(result.current.article.evidenceAdded).toBe(true);
    expect(result.current.article.message).toBe('');
    expect(result.current.article.canGoBack).toBe(true);

    act(() => result.current.article.onContinue());

    expect(result.current.path).toBe(ROUTES.desk);
  });

  it('does nothing if evidence is added before passing', async () => {
    const { result } = await renderArticleModel();

    await act(() => result.current.article.onAddEvidence());

    expect(addEvidence).not.toHaveBeenCalled();
    expect(result.current.article.evidenceAdded).toBe(false);
  });

  it('lets the player try again if the evidence could not be saved', async () => {
    const { result, evidenceIds } = await renderArticleModel();
    await passArticle(result);
    vi.mocked(addEvidence).mockResolvedValueOnce(false);

    await act(() => result.current.article.onAddEvidence());

    expect(result.current.article.error).toBe('Could not save evidence');
    expect(result.current.article.evidenceAdded).toBe(false);
    expect(await getProgress()).toEqual([]);

    await act(() => result.current.article.onAddEvidence());

    expect(result.current.article.error).toBe('');
    expect(result.current.article.evidenceAdded).toBe(true);
    expect(addEvidence).toHaveBeenCalledTimes(evidenceIds.length * 2);
    expect(await getProgress()).toEqual(['articles']);
  });

  it('shows an error and lets the player try again if progress fails to save', async () => {
    vi.mocked(completeActivity).mockRejectedValueOnce(new Error('full'));
    const { result } = await renderArticleModel();
    await passArticle(result);

    await act(() => result.current.article.onAddEvidence());

    expect(result.current.article.error).toBe('Could not save progress');
    expect(result.current.article.evidenceAdded).toBe(false);
  });

  it('follows the window size when the window is resized', async () => {
    const { result } = await renderArticleModel();

    act(() => {
      window.innerWidth = 800;
      window.innerHeight = 600;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.article.width).toBe(800);
    expect(result.current.article.height).toBe(600);
  });

});
