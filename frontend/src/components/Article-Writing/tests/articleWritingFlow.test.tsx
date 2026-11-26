import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import { completeActivity } from '../../../services/progress';
import { BACK_BUTTON_LABEL } from '../../Back-Button/backButtonView';
import { GO_BACK_LABEL } from '../../Back-Confirmation/backConfirmationContent';
import { pickArticleSubjects, submitArticle } from '../../../services/article';
import { addEvidence } from '../../../services/journal';
import { ALL_STORY_EVIDENCE } from '../../Journal/storyEvidence';

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
// only the open spread is shown, and the evidence may not fit on one.
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
// against the real ratings. STRONG is the best the player can do: strong
// evidence where the question has enough, unrated evidence to fill the rest.
const STRONG: [string, string, string][] = [
  ['subject-what-happens', 'ev-ucc-study', 'UC Cat City Study'],
  ['subject-how-many', 'ev-ucc-study', 'UC Cat City Study'],
  ['subject-ingredient', 'ev-nicotine', 'Addictive Chemical'],
  ['subject-company-knows', 'ev-ceo-values', "CEO's view on catnip"],
  ['subject-motive', 'ev-ceo-values', "CEO's view on catnip"],
  ['subject-why-trusted', 'ev-cnn-owner', 'CNN Ownership'],
  ['subject-why-trusted', 'ev-rentfreecat-post', 'RentFreeCat wellness post'],
  ['subject-left-out', 'ev-cnn-omission', 'CNN Claim Vs. Study'],
  ['subject-left-out', 'ev-ucc-study', 'UC Cat City Study'],
  ['subject-online-praise', 'ev-rentfreecat-post', 'RentFreeCat wellness post'],
  ['subject-rebuttal', 'ev-ucc-study', 'UC Cat City Study'],
];

// Weak evidence where the question has it, unrated evidence to fill the rest.
const WEAK: [string, string, string][] = [
  ['subject-what-happens', 'ev-cnn-article', 'CNN Article Claim'],
  ['subject-how-many', 'ev-cnn-owner', 'CNN Ownership'],
  ['subject-ingredient', 'ev-ceo-pr-claims', "CEO's safety claims"],
  ['subject-company-knows', 'ev-ceo-request', "CEO's request"],
  ['subject-motive', 'ev-ceo-request', "CEO's request"],
  ['subject-why-trusted', 'ev-cnn-article', 'CNN Article Claim'],
  ['subject-why-trusted', 'ev-ceo-pr-claims', "CEO's safety claims"],
  ['subject-left-out', 'ev-cnn-article', 'CNN Article Claim'],
  ['subject-left-out', 'ev-cnn-owner', 'CNN Ownership'],
  ['subject-online-praise', 'ev-cnn-article', 'CNN Article Claim'],
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
    // Finishing those activities is what puts their evidence in the journal.
    for (const item of ALL_STORY_EVIDENCE) await addEvidence(item);
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
