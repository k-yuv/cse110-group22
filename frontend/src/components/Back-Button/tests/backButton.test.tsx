import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackButton, { BACK_BUTTON_LABEL } from '../backButtonView';
import { COLORS } from '../../../theme';

describe('BackButton', () => {
  it('is a labelled button that calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<BackButton onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: BACK_BUTTON_LABEL }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('sits in the top left by default', () => {
    render(<BackButton onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: BACK_BUTTON_LABEL })).toHaveStyle({
      position: 'absolute',
      left: '16px',
      top: '16px',
    });
  });

  it('can be resized and nudged by the screen', () => {
    render(<BackButton onClick={vi.fn()} size={50} style={{ left: 40, top: 20 }} />);

    expect(screen.getByRole('button', { name: BACK_BUTTON_LABEL })).toHaveStyle({
      left: '40px',
      top: '20px',
      width: '50px',
      height: '50px',
    });
  });

  describe('hover effect', () => {
    function backButton() {
      return screen.getByRole('button', { name: BACK_BUTTON_LABEL });
    }

    it('starts at normal size and color', () => {
      render(<BackButton onClick={vi.fn()} />);

      expect(backButton()).toHaveStyle({ transform: 'scale(1)', backgroundColor: COLORS.backButton });
    });

    it('grows and lightens while the mouse is over it, then goes back', async () => {
      const user = userEvent.setup();
      render(<BackButton onClick={vi.fn()} />);

      await user.hover(backButton());
      expect(backButton()).toHaveStyle({ transform: 'scale(1.05)', backgroundColor: COLORS.backButtonHover });

      await user.unhover(backButton());
      expect(backButton()).toHaveStyle({ transform: 'scale(1)', backgroundColor: COLORS.backButton });
    });

    it('shows the same effect with keyboard focus', async () => {
      const user = userEvent.setup();
      render(<BackButton onClick={vi.fn()} />);

      await user.tab();
      expect(backButton()).toHaveFocus();
      expect(backButton()).toHaveStyle({ transform: 'scale(1.05)' });

      await user.tab();
      expect(backButton()).toHaveStyle({ transform: 'scale(1)' });
    });

    it('animates the change', () => {
      render(<BackButton onClick={vi.fn()} />);

      expect(backButton().style.transition).toContain('transform 150ms');
    });
  });
});
