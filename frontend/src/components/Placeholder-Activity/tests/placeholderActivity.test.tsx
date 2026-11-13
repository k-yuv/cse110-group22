import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import PlaceholderActivity from '../placeholderActivityView';
import { ROUTES } from '../../../routes';
import { FINISH_LABEL, SAVE_ERROR } from '../placeholderActivityContent';
import { completeActivity, getProgress } from '../../../services/progress';

vi.mock('../../../services/progress', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/progress')>();
  return { ...actual, completeActivity: vi.fn(actual.completeActivity) };
});

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

function renderPlaceholder() {
  render(
    <MemoryRouter initialEntries={[ROUTES.socialMedia]}>
      <PlaceholderActivity activity="social" title="Social Media" />
      <CurrentPath />
    </MemoryRouter>,
  );
}

describe('PlaceholderActivity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('marks its activity done and goes back to the desk', async () => {
    const user = userEvent.setup();
    renderPlaceholder();

    await user.click(screen.getByRole('button', { name: FINISH_LABEL }));

    // <output> has the "status" role.
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe(ROUTES.desk));
    expect(await getProgress()).toEqual(['social']);
  });

  it('stays put and shows an error if saving fails', async () => {
    vi.mocked(completeActivity).mockRejectedValueOnce(new Error('offline'));
    const user = userEvent.setup();
    renderPlaceholder();

    await user.click(screen.getByRole('button', { name: FINISH_LABEL }));

    expect(await screen.findByRole('alert')).toHaveTextContent(SAVE_ERROR);
    expect(screen.getByRole('status').textContent).toBe(ROUTES.socialMedia);
  });
});
