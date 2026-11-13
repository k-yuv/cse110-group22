import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import RouteGuard from '../routeGuardView';
import { ROUTES } from '../../../routes';
import { completeActivity, getProgress, type ActivityId } from '../../../services/progress';
import type { LockableScreen } from '../../Desk/deskRules';

// The real progress service, except getProgress can be made to fail or hang
// in a single test.
vi.mock('../../../services/progress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/progress')>();
  return { ...actual, getProgress: vi.fn(actual.getProgress) };
});

const LOCKED_PATH = '/locked';

async function renderGuarded(screenId: LockableScreen, completed: ActivityId[] = []) {
  for (const id of completed) await completeActivity(id);

  render(
    <MemoryRouter initialEntries={[ROUTES.desk, LOCKED_PATH]} initialIndex={1}>
      <Routes>
        <Route path={ROUTES.desk} element={<p>Desk</p>} />
        <Route
          path={LOCKED_PATH}
          element={
            <RouteGuard screen={screenId}>
              <p>Secret screen</p>
            </RouteGuard>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RouteGuard: progress-based screens', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each([
    { screenId: 'social', completed: [], open: false },
    { screenId: 'social', completed: ['articles'], open: true },
    { screenId: 'interviews', completed: ['articles'], open: false },
    { screenId: 'interviews', completed: ['articles', 'social'], open: true },
    { screenId: 'createArticle', completed: [], open: false },
    { screenId: 'createArticle', completed: ['articles', 'social'], open: false },
    { screenId: 'createArticle', completed: ['articles', 'social', 'interviews'], open: true },
    { screenId: 'articles', completed: [], open: true },
    { screenId: 'aiMinigame', completed: [], open: true },
  ] as { screenId: LockableScreen; completed: ActivityId[]; open: boolean }[])(
    '$screenId with [$completed] is open: $open',
    async ({ screenId, completed, open }) => {
      await renderGuarded(screenId, completed);

      if (open) {
        expect(await screen.findByText('Secret screen')).toBeInTheDocument();
      } else {
        expect(await screen.findByText('Desk')).toBeInTheDocument();
        expect(screen.queryByText('Secret screen')).not.toBeInTheDocument();
      }
    },
  );

  it('shows nothing while progress is loading', async () => {
    vi.mocked(getProgress).mockReturnValueOnce(new Promise(() => {}));
    await renderGuarded('createArticle', ['articles', 'social', 'interviews']);

    expect(screen.queryByText('Secret screen')).not.toBeInTheDocument();
    expect(screen.queryByText('Desk')).not.toBeInTheDocument();
  });

  // Leaving the page before progress loads must not redirect afterwards.
  it.each(['loads', 'fails'])('ignores progress that %s after leaving the page', async (outcome) => {
    let settle!: () => void;
    vi.mocked(getProgress).mockReturnValueOnce(
      new Promise((resolve, reject) => {
        settle = () => (outcome === 'loads' ? resolve([]) : reject(new Error('offline')));
      }),
    );
    await renderGuarded('createArticle');
    cleanup();
    settle();
    await Promise.resolve();

    expect(screen.queryByText('Desk')).not.toBeInTheDocument();
  });

  it('treats the screen as locked if progress fails to load', async () => {
    vi.mocked(getProgress).mockRejectedValueOnce(new Error('offline'));
    await renderGuarded('createArticle', ['articles', 'social', 'interviews']);

    expect(await screen.findByText('Desk')).toBeInTheDocument();
  });
});

// Sends the player to the ending the way ArticleWriting does.
function SubmitButton() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(ROUTES.goodEnding, { state: { articleSubmitted: true } })}>
      Submit
    </button>
  );
}

function renderEnding(startAt: string) {
  render(
    <MemoryRouter initialEntries={[startAt]}>
      <Routes>
        <Route path={ROUTES.desk} element={<p>Desk</p>} />
        <Route path={ROUTES.createArticle} element={<SubmitButton />} />
        <Route
          path={ROUTES.goodEnding}
          element={
            <RouteGuard screen="ending">
              <p>The ending</p>
            </RouteGuard>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RouteGuard: endings', () => {
  it('redirects a direct visit to the desk', async () => {
    renderEnding(ROUTES.goodEnding);

    expect(await screen.findByText('Desk')).toBeInTheDocument();
    expect(screen.queryByText('The ending')).not.toBeInTheDocument();
  });

  it('opens after submitting an article', async () => {
    renderEnding(ROUTES.createArticle);

    screen.getByRole('button', { name: 'Submit' }).click();

    expect(await screen.findByText('The ending')).toBeInTheDocument();
  });
});
