import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import DeskCleanup from '../deskCleanupView';
import { CONTINUE_LABEL, STILL_DIRTY_MESSAGE, TODO_TEXT } from '../deskCleanupContent';

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
});
