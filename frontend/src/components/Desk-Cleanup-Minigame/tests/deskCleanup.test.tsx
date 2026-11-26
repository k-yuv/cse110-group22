import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import DeskCleanup from '../deskCleanupView';
import { ACTIVITY_NAME, CONTINUE_LABEL, HINT_TEXT, STILL_DIRTY_MESSAGE, TODO_TEXT } from '../deskCleanupContent';
import { BACK_BUTTON_LABEL } from '../../Back-Button/backButtonView';

// Tests can't draw the canvas (see internal-docs/Konva-Testing.md), so the
// Konva parts render nothing here. Cleaning is tested through the model in
// deskCleanupModel.test.tsx; these tests cover the HTML around the canvas.
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Group: () => null,
  Rect: () => null,
  Image: () => null,
}));

function renderDeskCleanup() {
  render(
    <MemoryRouter>
      <DeskCleanup />
    </MemoryRouter>,
  );
}

describe('DeskCleanup', () => {
  it('shows the to-do heading and the Continue button', () => {
    renderDeskCleanup();

    expect(screen.getByRole('heading', { name: TODO_TEXT })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: CONTINUE_LABEL })).toBeInTheDocument();
  });

  it('says there is still stuff to clean when Continue is pressed on a messy desk', async () => {
    const user = userEvent.setup();
    renderDeskCleanup();

    await user.click(screen.getByRole('button', { name: CONTINUE_LABEL }));

    expect(await screen.findByRole('status')).toHaveTextContent(STILL_DIRTY_MESSAGE);
  });

  it('has the settings button', () => {
    renderDeskCleanup();

    expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument();
  });

  it('opens the hint from the hint button', async () => {
    const user = userEvent.setup();
    renderDeskCleanup();

    await user.click(screen.getByRole('button', { name: 'Open hint' }));

    expect(screen.getByRole('dialog', { name: 'Hint' })).toHaveTextContent(HINT_TEXT);
  });

  it('asks before leaving with the back button, naming the minigame', async () => {
    const user = userEvent.setup();
    renderDeskCleanup();

    await user.click(screen.getByRole('button', { name: BACK_BUTTON_LABEL }));

    expect(screen.getByRole('alertdialog')).toHaveTextContent(ACTIVITY_NAME);
  });
});
