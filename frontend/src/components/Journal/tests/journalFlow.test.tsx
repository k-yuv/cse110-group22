import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { ROUTES } from '../../../routes';
import { getArticleActivity } from '../../../services/articles';
import { getEvidence } from '../../../services/journal';
import { CONTINUE_LABEL, SUBMIT_LABEL } from '../../NewsArticle/newsArticleContent';
import { JournalController } from '../JournalController';
import { LOAD_ERROR_TEXT, OPEN_LABEL, RETRY_LABEL } from '../journalContent';

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
  const { segments, answerKey } = await getArticleActivity();

  await screen.findByRole('button', { name: SUBMIT_LABEL });
  await user.click(screen.getAllByTestId('image')[HIGHLIGHTER_IMAGE]);
  for (const { segmentId } of answerKey) {
    const sentence = segments.find((segment) => segment.id === segmentId)!;
    await user.click(screen.getByText(sentence.text));
  }
  await user.click(screen.getByRole('button', { name: SUBMIT_LABEL }));
  await user.click(await screen.findByRole('button', { name: CONTINUE_LABEL }));
  await findOpenButton();

  return { app, answerKey };
}

describe('Journal flow', () => {
  beforeEach(() => {
    localStorage.clear();
    JournalController.resetInstance();
  });

  it('shows evidence from Online Articles in the journal on the desk, and after a reload', async () => {
    const user = userEvent.setup();
    const { app, answerKey } = await passOnlineArticles(user);
    const titles = answerKey.map((entry) => entry.evidence.toolName);

    await user.click(screen.getByRole('button', { name: OPEN_LABEL }));
    const pages = within(screen.getByRole('list', { name: 'Evidence on these pages' }));
    for (const title of titles) expect(pages.getByText(new RegExp(title))).toBeInTheDocument();

    reload(app, ROUTES.desk);

    await user.click(await findOpenButton());
    const reloaded = within(screen.getByRole('list', { name: 'Evidence on these pages' }));
    for (const title of titles) expect(reloaded.getByText(new RegExp(title))).toBeInTheDocument();
  });

  it('does not collect the same evidence twice when the activity is replayed', async () => {
    const user = userEvent.setup();
    const { app, answerKey } = await passOnlineArticles(user);
    app.unmount();

    await passOnlineArticles(user);

    const ids = JournalController.getInstance().read().map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { evidence } of answerKey) expect(ids).toContain(evidence.id);
  });

  it('does not seed the mock evidence twice across a reload', async () => {
    const app = renderGame(ROUTES.desk);
    await findOpenButton();
    const count = JournalController.getInstance().read().length;
    expect(count).toBeGreaterThan(0);

    reload(app, ROUTES.desk);
    await findOpenButton();

    expect(JournalController.getInstance().read()).toHaveLength(count);
  });

  it('shows an error and seeds nothing if loading fails, and can try again', async () => {
    vi.mocked(getEvidence).mockRejectedValueOnce(new Error('down'));
    const user = userEvent.setup();
    renderGame(ROUTES.desk);

    expect(await screen.findByRole('alert')).toHaveTextContent(LOAD_ERROR_TEXT);
    expect(screen.queryByRole('button', { name: OPEN_LABEL })).not.toBeInTheDocument();
    expect(JournalController.getInstance().read()).toEqual([]);

    await user.click(screen.getByRole('button', { name: RETRY_LABEL }));

    expect(await findOpenButton()).toBeInTheDocument();
    expect(JournalController.getInstance().read().length).toBeGreaterThan(0);
  });
});
