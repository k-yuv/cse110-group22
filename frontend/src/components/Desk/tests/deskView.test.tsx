import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode, Ref } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import Desk from '../deskView';
import HoverSpotlight from '../parts/HoverSpotlight';
import { ROUTES } from '../../../routes';
import { completeActivity, getProgress, type ActivityId } from '../../../services/progress';
import { ACTIVITY_LABELS, CREATE_ARTICLE_LABEL, DONE_TEXT, LOADING_TEXT, LOCKED_TEXT } from '../deskContent';

// The real progress service, except getProgress and completeActivity can be
// made to fail in a single test with mockRejectedValueOnce.
vi.mock('../../../services/progress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/progress')>();
  return {
    ...actual,
    getProgress: vi.fn(actual.getProgress),
    completeActivity: vi.fn(actual.completeActivity),
  };
});

// Every call HoverSpotlight makes to animate a shape (Konva's node.to).
const { tween } = vi.hoisted(() => ({ tween: vi.fn() }));

interface FakeProps {
  children?: ReactNode;
  name?: string;
  text?: string;
  ref?: Ref<unknown>;
  onClick?: () => void;
  onMouseEnter?: (event: unknown) => void;
  onMouseLeave?: (event: unknown) => void;
}

// jsdom has no <canvas>, and the whole desk is drawn with Konva, so swap each
// Konva shape for plain HTML (see internal-docs/Konva-Testing.md):
// - Group passes clicks and hovers through. A named Group is a role="group"
//   labelled with its name, so getByRole finds each desk item by its label.
// - Text shows its text.
// - Shapes given a ref get a fake node whose tweens are recorded in `tween`.
// - Hover events get a fake Konva event. The fake Stage has no container of
//   its own, so the cursor is set on the desk's <main> instead, where the
//   test can read it.
vi.mock('react-konva', async () => {
  const { useImperativeHandle } = await import('react');

  function useFakeNode(ref: Ref<unknown> | undefined) {
    useImperativeHandle(ref, () => ({ to: tween }));
  }

  function konvaEvent(event: { currentTarget: Element }) {
    const container = event.currentTarget.closest('main');
    return { target: { getStage: () => ({ container: () => container }) } };
  }

  return {
    Stage: ({ children }: FakeProps) => <div>{children}</div>,
    Layer: ({ children }: FakeProps) => <div>{children}</div>,
    Group: ({ children, name, ref, onClick, onMouseEnter, onMouseLeave }: FakeProps) => {
      useFakeNode(ref);
      return (
        <div
          role={name ? 'group' : undefined}
          aria-label={name}
          onClick={onClick}
          onMouseEnter={(event) => onMouseEnter?.(konvaEvent(event))}
          onMouseLeave={(event) => onMouseLeave?.(konvaEvent(event))}
        >
          {children}
        </div>
      );
    },
    Rect: ({ ref }: FakeProps) => {
      useFakeNode(ref);
      return null;
    },
    Circle: () => null,
    Text: ({ text }: FakeProps) => <span>{text}</span>,
  };
});

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

// Progress is saved through the real (mock) service first, so the desk loads
// it the same way it would after a reload.
async function renderDesk(completed: ActivityId[] = []) {
  for (const id of completed) await completeActivity(id);

  render(
    <MemoryRouter initialEntries={[ROUTES.desk]}>
      <Desk />
      <CurrentPath />
    </MemoryRouter>,
  );

  return await screen.findByRole('main');
}

function currentPath() {
  // <output> has the "status" role.
  return screen.getByRole('status').textContent;
}

// Each drawn item is a Group named after its label.
function item(label: string) {
  return screen.getByRole('group', { name: label });
}

// Its label, drawn inside it. Hover this rather than the item itself: like a
// real mouse, hovering only reaches the element and what it's inside of.
function itemLabel(label: string) {
  return within(item(label)).getByText(label);
}

describe('Desk view', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a loading message until progress loads', async () => {
    const loaded = renderDesk();

    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
    await loaded;
    expect(screen.queryByText(LOADING_TEXT)).not.toBeInTheDocument();
  });

  it('shows an error if progress fails to load, and still draws the desk', async () => {
    vi.mocked(getProgress).mockRejectedValueOnce(new Error('down'));

    await renderDesk();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(item(ACTIVITY_LABELS.articles)).toBeInTheDocument();
  });

  it('draws every item once progress loads', async () => {
    await renderDesk();

    for (const label of Object.values(ACTIVITY_LABELS)) {
      expect(item(label)).toBeInTheDocument();
    }
    expect(item(CREATE_ARTICLE_LABEL)).toBeInTheDocument();
  });

  // Checks that each drawn item is wired to its own activity, not just that
  // the model knows the routes. Only checks the URL, not what's shown there.
  it.each([
    { id: 'articles', path: ROUTES.onlineArticle },
    { id: 'social', path: ROUTES.socialMedia },
    { id: 'interviews', path: ROUTES.interview },
    { id: 'aiMinigame', path: ROUTES.aiImage },
    { id: 'deskMinigame', path: ROUTES.cleanDesk },
  ] as { id: ActivityId; path: string }[])('clicking $id goes to $path', async ({ id, path }) => {
    const user = userEvent.setup();
    await renderDesk(['articles', 'social']);

    await user.click(item(ACTIVITY_LABELS[id]));

    expect(currentPath()).toBe(path);
  });

  it('clicking Create Article goes to its page once Interviews is done', async () => {
    const user = userEvent.setup();
    await renderDesk(['articles', 'social', 'interviews']);

    await user.click(item(CREATE_ARTICLE_LABEL));

    expect(currentPath()).toBe(ROUTES.createArticle);
  });

  it('puts a locked note on locked items, and clicking them does nothing', async () => {
    const user = userEvent.setup();
    await renderDesk();

    for (const label of [ACTIVITY_LABELS.social, ACTIVITY_LABELS.interviews, CREATE_ARTICLE_LABEL]) {
      expect(within(item(label)).getByText(LOCKED_TEXT)).toBeInTheDocument();
      await user.click(item(label));
      expect(currentPath()).toBe(ROUTES.desk);
    }
    expect(within(item(ACTIVITY_LABELS.articles)).queryByText(LOCKED_TEXT)).not.toBeInTheDocument();
  });

  it('puts a Done! note on exactly the completed items', async () => {
    const completed: ActivityId[] = ['articles', 'social', 'interviews', 'aiMinigame', 'deskMinigame'];
    await renderDesk(completed);

    for (const id of completed) {
      expect(within(item(ACTIVITY_LABELS[id])).getByText(DONE_TEXT)).toBeInTheDocument();
      expect(within(item(ACTIVITY_LABELS[id])).queryByText(LOCKED_TEXT)).not.toBeInTheDocument();
    }
    expect(within(item(CREATE_ARTICLE_LABEL)).queryByText(LOCKED_TEXT)).not.toBeInTheDocument();
  });

  it('shows no Done! notes on an empty desk', async () => {
    await renderDesk();

    expect(screen.queryByText(DONE_TEXT)).not.toBeInTheDocument();
  });

  describe('hover', () => {
    it('grows and lights up an open item, then shrinks back when the mouse leaves', async () => {
      const user = userEvent.setup();
      const stage = await renderDesk();

      await user.hover(itemLabel(ACTIVITY_LABELS.articles));

      expect(stage.style.cursor).toBe('pointer');
      expect(tween).toHaveBeenCalledWith(expect.objectContaining({ scaleX: expect.toSatisfy((s: number) => s > 1) }));
      expect(tween).toHaveBeenCalledWith(expect.objectContaining({ opacity: 1 }));

      tween.mockClear();
      await user.unhover(itemLabel(ACTIVITY_LABELS.articles));

      expect(stage.style.cursor).toBe('default');
      expect(tween).toHaveBeenCalledWith(expect.objectContaining({ scaleX: 1, scaleY: 1 }));
      expect(tween).toHaveBeenCalledWith(expect.objectContaining({ opacity: 0 }));
    });

    it("doesn't crash when it isn't on a stage", async () => {
      const user = userEvent.setup();
      render(
        <HoverSpotlight width={10} height={10}>
          <span>Off stage</span>
        </HoverSpotlight>,
      );

      await user.hover(screen.getByText('Off stage'));

      expect(tween).toHaveBeenCalledWith(expect.objectContaining({ opacity: 1 }));
    });

    it('shows a "not allowed" cursor on a locked item without animating it', async () => {
      const user = userEvent.setup();
      const stage = await renderDesk();

      await user.hover(itemLabel(ACTIVITY_LABELS.social));

      expect(stage.style.cursor).toBe('not-allowed');
      expect(tween).not.toHaveBeenCalled();
    });
  });

  // TEMPORARY: remove with the dev buttons in deskView and deskModel.
  describe('dev buttons', () => {
    it('complete the main activities in story order, then disable', async () => {
      const user = userEvent.setup();
      await renderDesk();
      const completeNext = screen.getByRole('button', { name: 'Dev: complete next level' });

      for (const id of ['articles', 'social', 'interviews'] as const) {
        await user.click(completeNext);
        expect(await within(item(ACTIVITY_LABELS[id])).findByText(DONE_TEXT)).toBeInTheDocument();
      }

      expect(completeNext).toBeDisabled();
      expect(within(item(CREATE_ARTICLE_LABEL)).queryByText(LOCKED_TEXT)).not.toBeInTheDocument();
    });

    it('reset progress back to an empty desk', async () => {
      const user = userEvent.setup();
      await renderDesk(['articles', 'social', 'interviews']);

      await user.click(screen.getByRole('button', { name: 'Dev: reset progress' }));

      expect(await within(item(ACTIVITY_LABELS.social)).findByText(LOCKED_TEXT)).toBeInTheDocument();
      expect(screen.queryByText(DONE_TEXT)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dev: complete next level' })).toBeEnabled();
    });

    it('show an error if progress fails to save', async () => {
      const user = userEvent.setup();
      await renderDesk();
      vi.mocked(completeActivity).mockRejectedValueOnce(new Error('down'));

      await user.click(screen.getByRole('button', { name: 'Dev: complete next level' }));

      expect(await screen.findByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText(DONE_TEXT)).not.toBeInTheDocument();
    });
  });
});
