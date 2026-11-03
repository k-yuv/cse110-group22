import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useArticleWritingModel } from '../articleWritingModel';
import { EvidenceModel } from '../../Journal/EvidenceModel';
import { JournalController } from '../../Journal/JournalController';
import * as articleApi from '../../../services/article';

vi.mock('../../../services/article', () => ({
  getArticleSubjects: vi.fn(),
  submitArticle: vi.fn(),
}));

const SUBJECTS = [
  { id: 'subject-1', prompt: 'What happened?', requiredCount: 2 },
  { id: 'subject-2', prompt: 'Who knew?', requiredCount: 1 },
];

function setJournal(count: number) {
  const journal = JournalController.getInstance();
  journal.clear();
  for (let i = 1; i <= count; i++) {
    journal.add(new EvidenceModel(`e${i}`, `Evidence ${i}`, '', ''));
  }
}

async function renderModel(evidencePerPage = 4) {
  const onFinish = vi.fn();
  const hook = renderHook(() => useArticleWritingModel({ levelId: 'level-1', evidencePerPage, onFinish }));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return { ...hook, onFinish };
}

describe('useArticleWritingModel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setJournal(3);
    vi.mocked(articleApi.getArticleSubjects).mockResolvedValue(SUBJECTS);
  });

  it('loads the questions for the given level', async () => {
    const { result } = await renderModel();

    expect(articleApi.getArticleSubjects).toHaveBeenCalledWith('level-1');
    expect(result.current.prompt).toBe('What happened?');
    expect(result.current.questionCount).toBe(2);
    expect(result.current.requiredCount).toBe(2);
    expect(result.current.selectedEvidence).toEqual([]);
  });

  it('ignores evidence clicks and submits when no questions loaded', async () => {
    vi.mocked(articleApi.getArticleSubjects).mockRejectedValue(new Error('down'));
    const { result } = await renderModel();

    act(() => result.current.onToggleEvidence('e1'));
    await act(() => result.current.onSubmit());

    expect(result.current.error).toBe('Could not load questions');
    expect(result.current.isSelected('e1')).toBe(false);
    expect(result.current.prompt).toBe('');
    expect(articleApi.submitArticle).not.toHaveBeenCalled();
  });

  it('does not advance or submit an answer that is missing evidence', async () => {
    const { result } = await renderModel();

    act(() => result.current.onToggleEvidence('e1'));
    await act(() => result.current.onSubmit());

    expect(result.current.questionNumber).toBe(1);
    expect(articleApi.submitArticle).not.toHaveBeenCalled();
  });

  it('lists the selected evidence in the order it was picked', async () => {
    const { result } = await renderModel();

    act(() => result.current.onToggleEvidence('e3'));
    act(() => result.current.onToggleEvidence('e1'));

    expect(result.current.selectedEvidence.map((item) => item.id)).toEqual(['e3', 'e1']);
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.answeredCount).toBe(1);
  });

  it('skips selected ids that are no longer in the journal', async () => {
    const { result } = await renderModel();

    act(() => result.current.onToggleEvidence('missing'));

    expect(result.current.selectedCount).toBe(1);
    expect(result.current.selectedEvidence).toEqual([]);
  });

  it('keeps page and question navigation within bounds', async () => {
    setJournal(5);
    const { result } = await renderModel(2);

    expect(result.current.pageCount).toBe(3);
    act(() => result.current.onPreviousPage());
    expect(result.current.page).toBe(1);

    act(() => result.current.onNextPage());
    act(() => result.current.onNextPage());
    act(() => result.current.onNextPage());
    expect(result.current.page).toBe(3);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.pageEvidence.map((item) => item.id)).toEqual(['e5']);

    act(() => result.current.onPreviousQuestion());
    expect(result.current.questionNumber).toBe(1);
  });

  it('has one page even when the journal is empty', async () => {
    setJournal(0);
    const { result } = await renderModel();

    expect(result.current.pageCount).toBe(1);
    expect(result.current.pageEvidence).toEqual([]);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('disables submitting while the article is being sent', async () => {
    let resolveSubmit: (value: { ending: 'good' }) => void = () => {};
    vi.mocked(articleApi.submitArticle).mockReturnValue(
      new Promise((resolve) => { resolveSubmit = resolve; }),
    );
    const { result, onFinish } = await renderModel();

    act(() => result.current.onToggleEvidence('e1'));
    act(() => result.current.onToggleEvidence('e2'));
    await act(() => result.current.onSubmit());
    act(() => result.current.onToggleEvidence('e3'));

    let pending: Promise<void> = Promise.resolve();
    act(() => { pending = result.current.onSubmit(); });
    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      resolveSubmit({ ending: 'good' });
      await pending;
    });
    expect(onFinish).toHaveBeenCalledWith('good');
    expect(result.current.canSubmit).toBe(true);
  });

  it('tracks the window size and stops listening on unmount', async () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = await renderModel();

    act(() => {
      window.innerWidth = 640;
      window.innerHeight = 480;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.windowWidth).toBe(640);
    expect(result.current.windowHeight).toBe(480);

    unmount();
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
