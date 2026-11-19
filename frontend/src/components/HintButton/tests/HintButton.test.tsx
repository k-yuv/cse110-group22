import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HintButton from '../HintButton';

const HINT = 'Check who wrote the article.';

describe('HintButton', () => {
  it('renders the hint button', () => {
    render(<HintButton hint={HINT} />);

    expect(screen.getByRole('button', { name: 'Open hint' })).toBeInTheDocument();
  });

  it('does not show the hint initially', () => {
    render(<HintButton hint={HINT} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(HINT)).not.toBeInTheDocument();
  });

  it('opens the hint with the hint passed in when clicked', async () => {
    const user = userEvent.setup();
    render(<HintButton hint={HINT} />);

    await user.click(screen.getByRole('button', { name: 'Open hint' }));

    const dialog = screen.getByRole('dialog', { name: 'Hint' });
    expect(within(dialog).getByText(HINT)).toBeInTheDocument();
  });

  it('closes the hint when Close is clicked', async () => {
    const user = userEvent.setup();
    render(<HintButton hint={HINT} />);

    await user.click(screen.getByRole('button', { name: 'Open hint' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the hint when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<HintButton hint={HINT} />);

    await user.click(screen.getByRole('button', { name: 'Open hint' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens again after being closed', async () => {
    const user = userEvent.setup();
    render(<HintButton hint={HINT} />);

    await user.click(screen.getByRole('button', { name: 'Open hint' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Open hint' }));

    expect(screen.getByRole('dialog', { name: 'Hint' })).toBeInTheDocument();
  });

  it('sits below the settings button by default', () => {
    render(<HintButton hint={HINT} />);

    expect(screen.getByRole('button', { name: 'Open hint' })).toHaveStyle({
      top: '90px',
      left: '20px',
      width: '60px',
      height: '60px',
    });
  });

  it('supports a custom position and size', () => {
    render(<HintButton hint={HINT} x={100} y={200} size={80} />);

    expect(screen.getByRole('button', { name: 'Open hint' })).toHaveStyle({
      top: '200px',
      left: '100px',
      width: '80px',
      height: '80px',
    });
  });
});
