import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import NotFound from '../notFoundView';
import { ROUTES } from '../../../routes';

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

function renderNotFound() {
  render(
    <MemoryRouter initialEntries={['/no-such-page']}>
      <NotFound />
      <CurrentPath />
    </MemoryRouter>,
  );
}

describe('NotFound', () => {
  it('says the page was not found', () => {
    renderNotFound();

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  // Only checks the URL, not what's shown there.
  it('links back to the desk', async () => {
    const user = userEvent.setup();
    renderNotFound();

    await user.click(screen.getByRole('link'));

    // <output> has the "status" role.
    expect(screen.getByRole('status').textContent).toBe(ROUTES.desk);
  });
});
