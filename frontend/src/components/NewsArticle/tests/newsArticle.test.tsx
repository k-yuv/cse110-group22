import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import NewsArticle from '../newsArticleView';
import { SUBMIT_LABEL, TODO_TEXT } from '../newsArticleContent';
import { getResultMessage, gradeHighlights } from '../newsArticleRules';
import { getArticleActivity } from '../../../services/articles';

// Tests can't draw the canvas (see internal-docs/Konva-Testing.md), so the
// Konva parts render nothing here. Highlighting is tested through the model
// in newsArticleModel.test.tsx; these tests cover the HTML around the canvas.
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Group: () => null,
  Rect: () => null,
  Text: () => null,
  Image: () => null,
}));

vi.mock('../../../services/articles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/articles')>();
  return { ...actual, getArticleActivity: vi.fn(actual.getArticleActivity) };
});

function renderNewsArticle() {
  render(
    <MemoryRouter>
      <NewsArticle />
    </MemoryRouter>,
  );
}

describe('NewsArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the to-do heading', async () => {
    renderNewsArticle();

    expect(await screen.findByRole('heading', { name: TODO_TEXT })).toBeInTheDocument();
  });

  it('shows the fail message when nothing is highlighted and the player submits', async () => {
    const user = userEvent.setup();
    const { answerKey } = await getArticleActivity();
    renderNewsArticle();

    await user.click(await screen.findByRole('button', { name: SUBMIT_LABEL }));

    expect(screen.getByRole('status')).toHaveTextContent(getResultMessage(gradeHighlights([], answerKey)));
  });

  it('shows an error and no Submit button if the article fails to load', async () => {
    vi.mocked(getArticleActivity).mockRejectedValueOnce(new Error('offline'));
    renderNewsArticle();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: SUBMIT_LABEL })).not.toBeInTheDocument();
  });
});
