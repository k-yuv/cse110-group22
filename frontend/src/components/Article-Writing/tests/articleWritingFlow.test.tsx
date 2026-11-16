import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import { submitArticle } from '../../../services/article';

// Integration: runs the real (mock) journal evidence and questions, from
// entering the screen to landing on an ending page. Scoring happens on the
// backend (backend/src/features/article/tests/article.test.ts checks these same
// picks against the real ratings), so here submitArticle is faked: the test
// checks the right evidence ids are sent, and that each ending goes to its page.

vi.mock('../../../services/article', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/article')>();
  return { ...actual, submitArticle: vi.fn() };
});

vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
  Text: () => null,
  Line: () => null,
  Group: () => null,
}));

// The evidence titles for each question, in question order.
async function writeArticle(answers: string[][]) {
  const user = userEvent.setup();
  window.history.pushState({}, '', ROUTES.createArticle);
  render(<App />);

  for (const [index, titles] of answers.entries()) {
    if (index > 0) await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    for (const title of titles) {
      await user.click(await screen.findByRole('button', { name: title }));
    }
  }
  await user.click(screen.getByRole('button', { name: 'Submit article' }));
}

describe('Article writing flow', () => {
  it('sends strong evidence and goes to the good ending', async () => {
    vi.mocked(submitArticle).mockResolvedValue({ ending: 'good' });

    await writeArticle([
      ['Fire marshal report'],
      ['Security camera footage'],
      ['Inspection records'],
      ['Fire marshal report', 'Foreman interview'],
    ]);

    expect(await screen.findByText('Good Ending page not built yet.')).toBeInTheDocument();
    expect(submitArticle).toHaveBeenCalledWith({
      'subject-catnip': ['ev-marshal'],
      'subject-arson': ['ev-cctv'],
      'subject-warnings': ['ev-inspection'],
      'subject-cause': ['ev-marshal', 'ev-foreman'],
    });
  });

  it('sends weak evidence and goes to the bad ending', async () => {
    vi.mocked(submitArticle).mockResolvedValue({ ending: 'bad' });

    await writeArticle([
      ['Anonymous forum post'],
      ["Neighbor's rumor"],
      ['Weather report'],
      ['Anonymous forum post', "Neighbor's rumor"],
    ]);

    expect(await screen.findByText('Bad Ending page not built yet.')).toBeInTheDocument();
    expect(submitArticle).toHaveBeenCalledWith({
      'subject-catnip': ['ev-forum'],
      'subject-arson': ['ev-neighbor'],
      'subject-warnings': ['ev-weather'],
      'subject-cause': ['ev-forum', 'ev-neighbor'],
    });
  });
});
