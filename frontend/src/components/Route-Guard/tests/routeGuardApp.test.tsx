import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import { completeActivity } from '../../../services/progress';

// Integration: the real App and (mock) progress service, starting from a URL
// typed straight into the address bar.

vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
  Text: () => null,
  Line: () => null,
  Group: () => null,
  Image: () => null,
}));

// Like typing the URL into the address bar: drops any app already on the page.
function visit(path: string) {
  cleanup();
  window.history.pushState({}, '', path);
  render(<App />);
}

describe('Typing a locked URL', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each([ROUTES.createArticle, ROUTES.goodEnding, ROUTES.badEnding])(
    'sends a new player from %s to the desk',
    async (path) => {
      visit(path);

      await waitFor(() => expect(window.location.pathname).toBe(ROUTES.desk));
    },
  );

  it('opens Create Article once the story activities are done', async () => {
    for (const id of ['articles', 'social', 'interviews'] as const) await completeActivity(id);
    visit(ROUTES.createArticle);

    expect(await screen.findByRole('button', { name: 'Submit answer' })).toBeInTheDocument();
    expect(window.location.pathname).toBe(ROUTES.createArticle);
  });
});
