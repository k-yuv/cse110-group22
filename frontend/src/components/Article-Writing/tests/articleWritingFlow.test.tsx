import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import { completeActivity } from '../../../services/progress';
import { BACK_BUTTON_LABEL } from '../../Back-Button/backButtonView';
import { GO_BACK_LABEL } from '../../Back-Confirmation/backConfirmationContent';
import { pickArticleSubjects, submitArticle } from '../../../services/article';

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
  Circle: () => null,
  Ellipse: () => null,
  Wedge: () => null,
}));

// Clicks the evidence with this title, turning the journal's pages to find it:
// only the open spread is shown, and there's more evidence than fits on one.
async function pickEvidence(user: ReturnType<typeof userEvent.setup>, title: string) {
  const previous = () => screen.getByRole('button', { name: '‹ Previous' });
  const next = () => screen.getByRole('button', { name: 'Next ›' });

  while (!(previous() as HTMLButtonElement).disabled) await user.click(previous());
  for (;;) {
    const button = screen.queryByRole('button', { name: title });
    if (button) return user.click(button);
    if ((next() as HTMLButtonElement).disabled) throw new Error(`No evidence titled ${title}`);
    await user.click(next());
  }
}

// The evidence titles for each question, in question order.
async function writeArticle(answers: string[][]) {
  const user = userEvent.setup();
  window.history.pushState({}, '', ROUTES.createArticle);
  render(<App />);
  await screen.findByRole('list', { name: 'Collected evidence' });

  for (const [index, titles] of answers.entries()) {
    if (index > 0) await user.click(screen.getByRole('button', { name: 'Submit answer' }));
    for (const title of titles) await pickEvidence(user, title);
  }
  await user.click(screen.getByRole('button', { name: 'Submit article' }));
}

// A pick for every question in the bank in services/article.ts. Each test only
// uses the ones for the questions its article asks. The backend test
// (backend/src/features/article/tests/article.test.ts) scores these same picks
// against the real ratings.
const STRONG: [string, string, string][] = [
  ['subject-what-happens', 'ev-ucc-study', 'UC Cat City study'],
  ['subject-what-happens', 'ev-avogato-post', "Avogato Fisher's review"],
  ['subject-quitting', 'ev-avogato-post', "Avogato Fisher's review"],
  ['subject-quitting', 'ev-withdrawal-posts', 'Withdrawal posts'],
  ['subject-how-many', 'ev-ucc-study', 'UC Cat City study'],
  ['subject-ingredient', 'ev-nicotine', 'Nicotine'],
  ['subject-deluxe', 'ev-wb-internal-docs', 'Leaked internal memo'],
  ['subject-deluxe', 'ev-catthew-week2', 'Catthew Myers, a week later'],
  ['subject-company-knows', 'ev-wb-internal-docs', 'Leaked internal memo'],
  ['subject-company-knows', 'ev-wb-testimony', 'Whistleblower testimony'],
  ['subject-motive', 'ev-ceo-values', "CEO's view on catnip"],
  ['subject-why-trusted', 'ev-cnn-owner', 'CNN ownership'],
  ['subject-why-trusted', 'ev-rentfreecat-post', 'RentFreeCat wellness post'],
  ['subject-left-out', 'ev-cnn-omission', 'What CNN left out'],
  ['subject-left-out', 'ev-deluxe-cut-question', 'Dodged question'],
  ['subject-online-praise', 'ev-fan-reposts', 'Fan reposts'],
  ['subject-online-praise', 'ev-before-after', '"Before & after" photo'],
  ['subject-rebuttal', 'ev-ucc-study', 'UC Cat City study'],
];

const WEAK: [string, string, string][] = [
  ['subject-what-happens', 'ev-catthew-week1', 'Catthew Myers, first try'],
  ['subject-what-happens', 'ev-letter-addiction', "Letter's addiction claim"],
  ['subject-quitting', 'ev-letter-addiction', "Letter's addiction claim"],
  ['subject-quitting', 'ev-deluxe-rumor', 'Viral rumor'],
  ['subject-how-many', 'ev-avogato-post', "Avogato Fisher's review"],
  ['subject-ingredient', 'ev-ceo-pr-claims', "CEO's safety claims"],
  ['subject-deluxe', 'ev-wb-warning', "Whistleblower's warning"],
  ['subject-deluxe', 'ev-deluxe-hype', 'Hype posts'],
  ['subject-company-knows', 'ev-letter-addiction', "Letter's addiction claim"],
  ['subject-company-knows', 'ev-ceo-request', "CEO's request"],
  ['subject-motive', 'ev-letter', 'Anonymous letter'],
  ['subject-why-trusted', 'ev-cnn-article', 'CNN catnip article'],
  ['subject-why-trusted', 'ev-ceo-pr-claims', "CEO's safety claims"],
  ['subject-left-out', 'ev-cnn-article', 'CNN catnip article'],
  ['subject-left-out', 'ev-deluxe-article', 'Catnip Deluxe launch article'],
  ['subject-online-praise', 'ev-catthew-week1', 'Catthew Myers, first try'],
  ['subject-online-praise', 'ev-cnn-testimonials', '"Local worker" quotes'],
  ['subject-rebuttal', 'ev-ceo-pr-claims', "CEO's safety claims"],
];

// Math.random is fixed at 0 below, so the article asks the first question of
// every section.
const ASKED = pickArticleSubjects(() => 0).map((subject) => subject.id);

// The titles to click for each question asked, and the answers that should be sent.
function titlesPerQuestion(picks: [string, string, string][]) {
  return ASKED.map((subject) => picks.filter(([s]) => s === subject).map(([, , title]) => title));
}

function answersSent(picks: [string, string, string][]) {
  return Object.fromEntries(
    ASKED.map((subject) => [subject, picks.filter(([s]) => s === subject).map(([, id]) => id)])
  );
}

describe('Article writing flow', () => {
  // Create Article only opens once the story activities are done.
  // The questions are picked at random; fix them so the test knows which come up.
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });
  afterEach(() => {
    vi.mocked(Math.random).mockRestore();
  });

  beforeEach(async () => {
    localStorage.clear();
    for (const id of ['articles', 'social', 'interviews'] as const) await completeActivity(id);
  });

  it('sends strong evidence and goes to the good ending', async () => {
    vi.mocked(submitArticle).mockResolvedValue({ ending: 'good' });

    await writeArticle(titlesPerQuestion(STRONG));

    expect(await screen.findByRole('heading', { name: 'CEO: Arrested' })).toBeInTheDocument();
    expect(submitArticle).toHaveBeenCalledWith(answersSent(STRONG));
  });

  it('sends weak evidence and goes to the bad ending', async () => {
    vi.mocked(submitArticle).mockResolvedValue({ ending: 'bad' });

    await writeArticle(titlesPerQuestion(WEAK));

    expect(await screen.findByRole('heading', { name: 'You Lost Your Job' })).toBeInTheDocument();
    expect(submitArticle).toHaveBeenCalledWith(answersSent(WEAK));
  });

  it('the back button asks first, then Go Back returns to the desk', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', ROUTES.createArticle);
    render(<App />);

    await user.click(await screen.findByRole('button', { name: BACK_BUTTON_LABEL }));
    expect(window.location.pathname).toBe(ROUTES.createArticle);

    await user.click(screen.getByRole('button', { name: GO_BACK_LABEL }));

    expect(window.location.pathname).toBe(ROUTES.desk);
  });
});
