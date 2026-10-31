import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { ROUTES } from '../../../routes';

// Integration: runs the real (mock) journal evidence and article service, seeded with
// their built-in data, from entering the screen to landing on an ending page.

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
  it('picks the good ending with strong evidence', async () => {
    await writeArticle([
      ['Fire marshal report'],
      ['Security camera footage'],
      ['Inspection records'],
      ['Fire marshal report', 'Foreman interview'],
    ]);

    expect(await screen.findByText('Good Ending page not built yet.')).toBeInTheDocument();
  });

  it('picks the bad ending with weak evidence', async () => {
    await writeArticle([
      ['Anonymous forum post'],
      ["Neighbor's rumor"],
      ['Weather report'],
      ['Anonymous forum post', "Neighbor's rumor"],
    ]);

    expect(await screen.findByText('Bad Ending page not built yet.')).toBeInTheDocument();
  });
});
