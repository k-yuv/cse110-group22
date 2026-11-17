import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ROUTES } from '../../../routes';
import { BACK_BUTTON_LABEL } from '../../Back-Button/backButtonView';
import { GO_BACK_LABEL, STAY_LABEL } from '../../Back-Confirmation/backConfirmationContent';
import NewsArticle from '../newsArticleView';
import { ACTIVITY_NAME, SUBMIT_LABEL, TODO_TEXT } from '../newsArticleContent';
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
    <MemoryRouter initialEntries={[ROUTES.onlineArticle]}>
      <Routes>
        <Route path={ROUTES.onlineArticle} element={<NewsArticle />} />
        <Route path={ROUTES.desk} element={<p>Desk</p>} />
      </Routes>
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

  describe('back button', () => {
    it('asks before leaving, naming the activity', async () => {
      const user = userEvent.setup();
      renderNewsArticle();

      await user.click(await screen.findByRole('button', { name: BACK_BUTTON_LABEL }));

      expect(screen.getByRole('alertdialog')).toHaveTextContent(ACTIVITY_NAME);
      expect(screen.queryByText('Desk')).not.toBeInTheDocument();
    });

    it('Go Back goes to the desk', async () => {
      const user = userEvent.setup();
      renderNewsArticle();

      await user.click(await screen.findByRole('button', { name: BACK_BUTTON_LABEL }));
      await user.click(screen.getByRole('button', { name: GO_BACK_LABEL }));

      expect(screen.getByText('Desk')).toBeInTheDocument();
    });

    it('Stay keeps the player on the article', async () => {
      const user = userEvent.setup();
      renderNewsArticle();

      await user.click(await screen.findByRole('button', { name: BACK_BUTTON_LABEL }));
      await user.click(screen.getByRole('button', { name: STAY_LABEL }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: TODO_TEXT })).toBeInTheDocument();
    });

    it('Escape closes it like Stay', async () => {
      const user = userEvent.setup();
      renderNewsArticle();

      await user.click(await screen.findByRole('button', { name: BACK_BUTTON_LABEL }));
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Desk')).not.toBeInTheDocument();
    });
  });
});
