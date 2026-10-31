import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import * as notesApi from '../../../services/notes';

// Integration: runs the real (mock) journal evidence and article service, seeded with
// their built-in data, from entering the screen to picking an ending. The
// ending screens don't exist yet (#32, #33), so App only logs which one.

vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
  Text: () => null,
  Line: () => null,
  Group: () => null,
}));

// App also renders Notes, which would otherwise call the backend.
vi.mock('../../../services/notes', () => ({
  getNotes: vi.fn(),
  createNote: vi.fn(),
}));

// One evidence title per question, in question order.
async function writeArticle(titles: string[]) {
  const user = userEvent.setup();
  render(<App />);

  for (const [index, title] of titles.entries()) {
    if (index > 0) await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    await user.click(await screen.findByRole('button', { name: title }));
  }
  await user.click(screen.getByRole('button', { name: 'Submit article' }));
}

describe('Article writing flow', () => {
  beforeEach(() => {
    vi.mocked(notesApi.getNotes).mockResolvedValue([]);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('picks the good ending with strong evidence', async () => {
    await writeArticle(['Fire marshal report', 'Security camera footage', 'Inspection records']);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Article submitted: good ending');
    });
  });

  it('picks the bad ending with weak evidence', async () => {
    await writeArticle(['Anonymous forum post', "Neighbor's rumor", 'Weather report']);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Article submitted: bad ending');
    });
  });
});
