import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { useDeskCleanupModel } from '../deskCleanupModel';
import { MESSAGE_SECONDS, MESSES, STILL_DIRTY_MESSAGE } from '../deskCleanupContent';
import { SCRUB_WIDTHS, needsScrubbing, type Mess } from '../deskCleanupRules';
import { ROUTES } from '../../../routes';
import { completeActivity, getProgress } from '../../../services/progress';

// The real progress service, except a single test can make it fail with
// mockRejectedValueOnce.
vi.mock('../../../services/progress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/progress')>();
  return { ...actual, completeActivity: vi.fn(actual.completeActivity) };
});

function Router({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={[ROUTES.cleanDesk]}>{children}</MemoryRouter>;
}

// The desk is drawn on a canvas, which tests can't see (see
// internal-docs/Konva-Testing.md), so these tests run the model directly and
// read the router's path to see where Continue went. Messes come from
// MESSES rather than being typed out, so changing the desk doesn't break them.
function renderCleanupModel() {
  const { result } = renderHook(() => ({ cleanup: useDeskCleanupModel(), path: useLocation().pathname }), {
    wrapper: Router,
  });
  return result;
}

type CleanupResult = ReturnType<typeof renderCleanupModel>;

const STAIN_WIDTH = 100;
const FULL_SCRUB = STAIN_WIDTH * SCRUB_WIDTHS;
const clickMess = MESSES.find((mess) => !needsScrubbing(mess))!;
const stain = MESSES.find(needsScrubbing)!;
const wrongTool = clickMess.tool === 'trash' ? 'shredder' : 'trash';

function holdTool(result: CleanupResult, tool: Mess['tool']) {
  if (result.current.cleanup.heldTool !== tool) act(() => result.current.cleanup.onToolClick(tool));
}

// Cleans every mess the way a player would: picks up its tool, then clicks
// or scrubs it.
function cleanDesk(result: CleanupResult) {
  for (const mess of MESSES) {
    holdTool(result, mess.tool);
    if (needsScrubbing(mess)) act(() => result.current.cleanup.onScrub(mess, FULL_SCRUB, STAIN_WIDTH));
    else act(() => result.current.cleanup.onMessClick(mess));
  }
}

describe('useDeskCleanupModel', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with no tool held, every mess dirty, and no message', () => {
    const result = renderCleanupModel();

    expect(result.current.cleanup.heldTool).toBeNull();
    expect(Object.values(result.current.cleanup.dirtiness)).toHaveLength(MESSES.length);
    expect(Object.values(result.current.cleanup.dirtiness).every((value) => value === 1)).toBe(true);
    expect(result.current.cleanup.message).toBe('');
  });

  it('picks up a tool, swaps to another, and puts it back when its slot is clicked', () => {
    const result = renderCleanupModel();

    act(() => result.current.cleanup.onToolClick('sponge'));
    expect(result.current.cleanup.heldTool).toBe('sponge');

    act(() => result.current.cleanup.onToolClick('trash'));
    expect(result.current.cleanup.heldTool).toBe('trash');

    act(() => result.current.cleanup.onToolClick('trash'));
    expect(result.current.cleanup.heldTool).toBeNull();
  });

  it('cleans a mess with one click of the right tool', () => {
    const result = renderCleanupModel();
    holdTool(result, clickMess.tool);

    act(() => result.current.cleanup.onMessClick(clickMess));

    expect(result.current.cleanup.dirtiness[clickMess.id]).toBe(0);
  });

  it('does nothing when a mess is clicked with the wrong tool or no tool', () => {
    const result = renderCleanupModel();

    act(() => result.current.cleanup.onMessClick(clickMess));
    holdTool(result, wrongTool);
    act(() => result.current.cleanup.onMessClick(clickMess));

    expect(result.current.cleanup.dirtiness[clickMess.id]).toBe(1);
  });

  it('only cleans stains by scrubbing, not clicking', () => {
    const result = renderCleanupModel();
    holdTool(result, 'sponge');

    act(() => result.current.cleanup.onMessClick(stain));
    expect(result.current.cleanup.dirtiness[stain.id]).toBe(1);

    holdTool(result, clickMess.tool);
    act(() => result.current.cleanup.onScrub(clickMess, FULL_SCRUB, STAIN_WIDTH));
    expect(result.current.cleanup.dirtiness[clickMess.id]).toBe(1);
  });

  it('fades a stain bit by bit while scrubbing, until it is clean', () => {
    const result = renderCleanupModel();
    holdTool(result, 'sponge');

    act(() => result.current.cleanup.onScrub(stain, FULL_SCRUB / 2, STAIN_WIDTH));
    expect(result.current.cleanup.dirtiness[stain.id]).toBeCloseTo(0.5);

    act(() => result.current.cleanup.onScrub(stain, FULL_SCRUB / 2, STAIN_WIDTH));
    expect(result.current.cleanup.dirtiness[stain.id]).toBe(0);
  });

  it('does not scrub without the sponge', () => {
    const result = renderCleanupModel();
    holdTool(result, 'trash');

    act(() => result.current.cleanup.onScrub(stain, FULL_SCRUB, STAIN_WIDTH));

    expect(result.current.cleanup.dirtiness[stain.id]).toBe(1);
  });

  it('stays and says there is more to clean if Continue is pressed too early', async () => {
    const result = renderCleanupModel();

    await act(() => result.current.cleanup.onContinue());

    expect(result.current.cleanup.message).toBe(STILL_DIRTY_MESSAGE);
    expect(result.current.path).toBe(ROUTES.cleanDesk);
    expect(await getProgress()).toEqual([]);
  });

  it('clears the message on its own after a few seconds', async () => {
    vi.useFakeTimers();
    const result = renderCleanupModel();
    await act(() => result.current.cleanup.onContinue());
    expect(result.current.cleanup.message).toBe(STILL_DIRTY_MESSAGE);

    act(() => vi.advanceTimersByTime(MESSAGE_SECONDS * 1000));

    expect(result.current.cleanup.message).toBe('');
    vi.useRealTimers();
  });

  it('clears the message once the player cleans something', async () => {
    const result = renderCleanupModel();
    await act(() => result.current.cleanup.onContinue());

    holdTool(result, clickMess.tool);
    act(() => result.current.cleanup.onMessClick(clickMess));

    expect(result.current.cleanup.message).toBe('');
  });

  it('only counts the desk as clean once every mess is gone', () => {
    const result = renderCleanupModel();
    expect(result.current.cleanup.isClean).toBe(false);

    cleanDesk(result);

    expect(result.current.cleanup.isClean).toBe(true);
  });

  it('saves progress and goes back to the desk once the whole desk is clean', async () => {
    const result = renderCleanupModel();
    cleanDesk(result);

    await act(() => result.current.cleanup.onContinue());

    expect(result.current.cleanup.message).toBe('');
    expect(await getProgress()).toEqual(['deskMinigame']);
    expect(result.current.path).toBe(ROUTES.desk);
  });

  it('stays and shows an error if progress fails to save', async () => {
    vi.mocked(completeActivity).mockRejectedValueOnce(new Error('offline'));
    const result = renderCleanupModel();
    cleanDesk(result);

    await act(() => result.current.cleanup.onContinue());

    expect(result.current.cleanup.error).toBe('Could not save progress');
    expect(result.current.path).toBe(ROUTES.cleanDesk);
  });

  it('places every mess fully inside the window, with each stain under its mess', () => {
    const result = renderCleanupModel();
    const { placements } = result.current.cleanup;

    for (const mess of MESSES) {
      const spot = placements[mess.id];
      expect(spot.x, mess.id).toBeGreaterThan(0);
      expect(spot.x, mess.id).toBeLessThan(1);
      expect(spot.y, mess.id).toBeGreaterThan(0);
      expect(spot.y, mess.id).toBeLessThan(1);
      if (mess.under) expect(spot, mess.id).toMatchObject({ x: placements[mess.under].x, y: placements[mess.under].y });
      if (mess.maxTurn !== undefined) expect(Math.abs(spot.rotation), mess.id).toBeLessThanOrEqual(mess.maxTurn);
    }
  });

  it('keeps the messes in place while playing', () => {
    const result = renderCleanupModel();
    const before = result.current.cleanup.placements;

    holdTool(result, clickMess.tool);
    act(() => result.current.cleanup.onMessClick(clickMess));

    expect(result.current.cleanup.placements).toBe(before);
  });

  it('asks before going back, then goes to the desk on Go Back without saving', async () => {
    const result = renderCleanupModel();

    act(() => result.current.cleanup.onBack());
    expect(result.current.cleanup.backConfirmation.isOpen).toBe(true);
    expect(result.current.path).toBe(ROUTES.cleanDesk);

    act(() => result.current.cleanup.backConfirmation.onGoBack());

    expect(result.current.path).toBe(ROUTES.desk);
    expect(await getProgress()).toEqual([]);
  });

  it('stays on the minigame on Stay', () => {
    const result = renderCleanupModel();

    act(() => result.current.cleanup.onBack());
    act(() => result.current.cleanup.backConfirmation.onStay());

    expect(result.current.cleanup.backConfirmation.isOpen).toBe(false);
    expect(result.current.path).toBe(ROUTES.cleanDesk);
  });

  it('follows the window size when the window is resized', () => {
    const result = renderCleanupModel();

    act(() => {
      window.innerWidth = 800;
      window.innerHeight = 600;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.cleanup.width).toBe(800);
    expect(result.current.cleanup.height).toBe(600);
  });
});
