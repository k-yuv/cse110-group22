import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import { completeActivity } from '../../../services/progress';
import { FINISH_LABEL } from '../../Placeholder-Activity/placeholderActivityContent';

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

  it.each([ROUTES.socialMedia, ROUTES.interview, ROUTES.createArticle, ROUTES.goodEnding, ROUTES.badEnding])(
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

  // Finishing each placeholder unlocks the next screen's URL, in story order.
  it('unlocks Social Media, then Interviews, as each one before is finished', async () => {
    const user = userEvent.setup();
    await completeActivity('articles');

    visit(ROUTES.interview);
    await waitFor(() => expect(window.location.pathname).toBe(ROUTES.desk));

    visit(ROUTES.socialMedia);
    await user.click(await screen.findByRole('button', { name: FINISH_LABEL }));
    await waitFor(() => expect(window.location.pathname).toBe(ROUTES.desk));

    visit(ROUTES.interview);
    expect(await screen.findByRole('button', { name: FINISH_LABEL })).toBeInTheDocument();
    expect(window.location.pathname).toBe(ROUTES.interview);
  });
});
