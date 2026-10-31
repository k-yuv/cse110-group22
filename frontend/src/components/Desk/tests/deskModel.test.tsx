import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { useDeskModel } from '../deskModel';
import { ROUTES } from '../../../routes';
import { completeActivity, getProgress, STORAGE_KEY, type ActivityId } from '../../../services/progress';

// The real progress service, except getProgress can be made to fail in a
// single test with mockRejectedValueOnce.
vi.mock('../../../services/progress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/progress')>();
  return { ...actual, getProgress: vi.fn(actual.getProgress) };
});

const FOLDERS: ActivityId[] = ['articles', 'social', 'interviews'];

function Router({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={[ROUTES.desk]}>{children}</MemoryRouter>;
}

// The desk is drawn on a canvas, which tests can't see (see
// internal-docs/Konva-Testing.md). Every decision the desk makes lives in
// useDeskModel, though, so these tests run the model without drawing
// anything, and read the router's current path to see where a click went.
// Progress is saved through the real (mock) service first, so this also
// checks that the desk loads saved progress after a reload.
async function renderDeskModel(completed: ActivityId[] = []) {
  for (const id of completed) await completeActivity(id);

  const { result } = renderHook(() => ({ desk: useDeskModel(), path: useLocation().pathname }), {
    wrapper: Router,
  });
  await waitFor(() => expect(result.current.desk.loading).toBe(false));

  return result;
}

describe('useDeskModel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // The three progress states in Figma, plus the empty desk.
  it.each([
    { state: 'Beginning', completed: [] },
    { state: 'Articles Done', completed: ['articles'] },
    { state: 'Social Media Done', completed: ['articles', 'social'] },
    { state: 'Interviews Done', completed: ['articles', 'social', 'interviews'] },
  ] as { state: string; completed: ActivityId[] }[])(
    'marks exactly the completed folders done ($state)',
    async ({ completed }) => {
      const result = await renderDeskModel(completed);

      for (const id of FOLDERS) {
        expect(result.current.desk.activities[id].done).toBe(completed.includes(id));
      }
    },
  );

  it('locks everything after Online Articles on an empty desk', async () => {
    const result = await renderDeskModel();
    const { activities, createArticleLocked } = result.current.desk;

    expect(activities.articles.locked).toBe(false);
    expect(activities.social.locked).toBe(true);
    expect(activities.interviews.locked).toBe(true);
    expect(createArticleLocked).toBe(true);

    act(() => result.current.desk.onOpenActivity('social'));
    act(() => result.current.desk.onCreateArticle());

    expect(result.current.path).toBe(ROUTES.desk);
  });

  // Only checks the URL, not what's shown there, so these keep passing as the
  // screens get built.
  it.each([
    { id: 'articles', path: ROUTES.onlineArticle },
    { id: 'social', path: ROUTES.socialMedia },
    { id: 'interviews', path: ROUTES.interview },
    { id: 'aiMinigame', path: ROUTES.aiImage },
    { id: 'deskMinigame', path: ROUTES.cleanDesk },
  ] as { id: ActivityId; path: string }[])('goes to $path when $id is opened', async ({ id, path }) => {
    const result = await renderDeskModel(['articles', 'social']);

    act(() => result.current.desk.onOpenActivity(id));

    expect(result.current.path).toBe(path);
  });

  it('goes to Create Article once Interviews is done', async () => {
    const result = await renderDeskModel(['articles', 'social', 'interviews']);

    expect(result.current.desk.createArticleLocked).toBe(false);

    act(() => result.current.desk.onCreateArticle());

    expect(result.current.path).toBe(ROUTES.createArticle);
  });

  it('reports an error if progress fails to load', async () => {
    vi.mocked(getProgress).mockRejectedValueOnce(new Error('down'));

    const result = await renderDeskModel();

    expect(result.current.desk.error).not.toBe('');
  });

  it('starts fresh if saved progress is unreadable', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');

    const result = await renderDeskModel();

    for (const id of FOLDERS) {
      expect(result.current.desk.activities[id].done).toBe(false);
    }
  });
});
