import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import { getArticleActivity } from '../../../services/articles';
import { addEvidence, getEvidence } from '../../../services/journal';
import { ADD_EVIDENCE_LABEL, CONTINUE_LABEL, SUBMIT_LABEL } from '../../NewsArticle/newsArticleContent';
import { ALL_STORY_EVIDENCE } from '../storyEvidence';
import { JournalController } from '../JournalController';
import { LOAD_ERROR_TEXT, OPEN_LABEL, PREVIOUS_LABEL, RETRY_LABEL } from '../journalContent';

// Integration: runs the real App, screens and (mock) services together, from
// collecting evidence in Online Articles to reading it on the desk after a
// reload.

vi.mock('../../../services/journal', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/journal')>();
  return { ...actual, getEvidence: vi.fn(actual.getEvidence) };
});

interface FakeProps {
  children?: ReactNode;
  text?: string;
  onClick?: (event: unknown) => void;
  onMouseEnter?: (event: unknown) => void;
  onMouseLeave?: (event: unknown) => void;
}

// jsdom has no <canvas>, so the Konva shapes become plain HTML (see
// internal-docs/Konva-Testing.md). The highlighter is only an image, so images
// get a test id to click. Handlers get a fake Konva event with no stage.
vi.mock('react-konva', () => {
  const konvaEvent = { target: { getStage: () => null } };

  return {
    Stage: ({ children }: FakeProps) => <div>{children}</div>,
    Layer: ({ children }: FakeProps) => <div>{children}</div>,
    Group: ({ children, onClick, onMouseEnter, onMouseLeave }: FakeProps) => (
      <div
        onClick={() => onClick?.(konvaEvent)}
        onMouseEnter={() => onMouseEnter?.(konvaEvent)}
        onMouseLeave={() => onMouseLeave?.(konvaEvent)}
      >
        {children}
      </div>
    ),
    Rect: () => null,
    Circle: () => null,
    Line: () => null,
    Image: () => <span data-testid="image" />,
    Text: ({ text }: FakeProps) => <span>{text}</span>,
  };
});

// The order the article screen draws its images in.
const HIGHLIGHTER_IMAGE = 1;

function renderGame(route: string) {
  window.history.pushState({}, '', route);
  return render(<App />);
}

// The desk shows its loading message first, and the journal once it's loaded.
function findOpenButton() {
  return screen.findByRole('button', { name: OPEN_LABEL });
}

// What a page reload does: memory is gone, and only what was saved comes back.
function reload(app: ReturnType<typeof render>, route: string) {
  app.unmount();
  JournalController.resetInstance();
  return renderGame(route);
}

async function passOnlineArticles(user: ReturnType<typeof userEvent.setup>) {
  const app = renderGame(ROUTES.onlineArticle);
  const { segments, answerKey, evidenceIds } = await getArticleActivity();

  await screen.findByRole('button', { name: SUBMIT_LABEL });
  await user.click(screen.getAllByTestId('image')[HIGHLIGHTER_IMAGE]);
  for (const { segmentId } of answerKey) {
    const sentence = segments.find((segment) => segment.id === segmentId)!;
    await user.click(screen.getByText(sentence.text));
  }
  await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));
  await user.click(await screen.findByRole('button', { name: ADD_EVIDENCE_LABEL }));
  await user.click(screen.getByRole('button', { name: CONTINUE_LABEL }));
  await findOpenButton();

  return { app, evidenceIds };
}

// Everything written in the open journal. It opens on the last pages, so this
// reads every spread back to the first.
async function readWholeJournal(user: ReturnType<typeof userEvent.setup>) {
  let text = '';
  for (;;) {
    text += screen.getByRole('list', { name: 'Evidence on these pages' }).textContent;
    const previous = screen.getByRole('button', { name: PREVIOUS_LABEL });
    if ((previous as HTMLButtonElement).disabled) return text;
    await user.click(previous);
  }
}

describe('Journal flow', () => {
  beforeEach(() => {
    localStorage.clear();
    JournalController.resetInstance();
  });

  it('shows evidence from Online Articles in the journal on the desk, and after a reload', async () => {
    const user = userEvent.setup();
    const { app, evidenceIds } = await passOnlineArticles(user);
    const titles = evidenceIds.map((id) => ALL_STORY_EVIDENCE.find((item) => item.id === id)!.toolName);

    await user.click(screen.getByRole('button', { name: OPEN_LABEL }));
    const journal = await readWholeJournal(user);
    for (const title of titles) expect(journal).toContain(title);

    reload(app, ROUTES.desk);

    await user.click(await findOpenButton());
    const reloaded = await readWholeJournal(user);
    for (const title of titles) expect(reloaded).toContain(title);
  });

  it('does not collect the same evidence twice when the activity is replayed', async () => {
    const user = userEvent.setup();
    const { app, evidenceIds } = await passOnlineArticles(user);
    app.unmount();

    await passOnlineArticles(user);

    const ids = JournalController.getInstance().read().map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of evidenceIds) expect(ids).toContain(id);
  });

  it('starts a new game with an empty journal, even after a reload', async () => {
    const app = renderGame(ROUTES.desk);
    await findOpenButton();
    expect(JournalController.getInstance().read()).toEqual([]);

    reload(app, ROUTES.desk);
    await findOpenButton();

    expect(JournalController.getInstance().read()).toEqual([]);
  });

  it('shows an error if loading fails, and loads the saved evidence on retry', async () => {
    const saved = ALL_STORY_EVIDENCE[0];
    await addEvidence(saved);
    vi.mocked(getEvidence).mockRejectedValueOnce(new Error('down'));
    const user = userEvent.setup();
    renderGame(ROUTES.desk);

    expect(await screen.findByRole('alert')).toHaveTextContent(LOAD_ERROR_TEXT);
    expect(screen.queryByRole('button', { name: OPEN_LABEL })).not.toBeInTheDocument();
    expect(JournalController.getInstance().read()).toEqual([]);

    await user.click(screen.getByRole('button', { name: RETRY_LABEL }));

    expect(await findOpenButton()).toBeInTheDocument();
    expect(JournalController.getInstance().read().map((item) => item.id)).toEqual([saved.id]);
  });
});
