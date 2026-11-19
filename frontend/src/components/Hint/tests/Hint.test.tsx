import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hint from '../Hint';

describe('Hint', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    hint: 'Check who wrote the article.',
  };

  it('does not render when closed', () => {
    render(<Hint {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Check who wrote the article.')).not.toBeInTheDocument();
  });

  it('renders the title and hint when open', () => {
    render(<Hint {...defaultProps} />);

    const dialog = screen.getByRole('dialog', { name: 'Hint' });

    expect(within(dialog).getByRole('heading', { name: 'Hint' })).toBeInTheDocument();
    expect(within(dialog).getByText('Check who wrote the article.')).toBeInTheDocument();
  });

  it('renders a hint passed as JSX', () => {
    render(
      <Hint
        {...defaultProps}
        hint={
          <p>
            Look at the <strong>date</strong>.
          </p>
        }
      />
    );

    expect(screen.getByText('date').tagName).toBe('STRONG');
  });

  it('renders a fullscreen dimming overlay', () => {
    render(<Hint {...defaultProps} />);

    expect(screen.getByTestId('hint-overlay')).toHaveStyle({
      position: 'fixed',
      inset: '0',
      zIndex: '1000',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when Close is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Hint {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Hint {...defaultProps} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when another key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Hint {...defaultProps} onClose={onClose} />);

    await user.keyboard('{w}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when Escape is pressed while closed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Hint {...defaultProps} isOpen={false} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('matches the mockup styling', () => {
    render(<Hint {...defaultProps} />);

    expect(screen.getByRole('dialog')).toHaveStyle({
      backgroundColor: '#D9D9D9',
      color: '#4C2100',
    });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveStyle({
      backgroundColor: '#9F9F9F',
    });
  });
});
