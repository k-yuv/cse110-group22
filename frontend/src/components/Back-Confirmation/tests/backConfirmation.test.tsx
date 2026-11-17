import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackConfirmation from '../backConfirmationView';
import { COLORS, FONT } from '../../../theme';
import { CONFIRM_TITLE, GO_BACK_LABEL, STAY_LABEL, confirmMessage } from '../backConfirmationContent';

function renderConfirmation(props: Partial<Parameters<typeof BackConfirmation>[0]> = {}) {
  const onGoBack = vi.fn();
  const onStay = vi.fn();
  const user = userEvent.setup();
  render(
    <BackConfirmation isOpen activityName="AI Images" onGoBack={onGoBack} onStay={onStay} {...props} />,
  );
  return { user, onGoBack, onStay };
}

describe('BackConfirmation view', () => {
  it('renders nothing when closed', () => {
    renderConfirmation({ isOpen: false });

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows "Are You Sure?" and names the activity in the message', () => {
    renderConfirmation({ activityName: 'Online Articles' });

    const dialog = screen.getByRole('alertdialog', { name: CONFIRM_TITLE });
    expect(dialog).toHaveAccessibleDescription(confirmMessage('Online Articles'));
    expect(dialog).toHaveTextContent('You will lose all your progress on Online Articles if you go back.');
  });

  it('nothing in the message is hard-coded to one activity', () => {
    renderConfirmation({ activityName: 'your article' });

    expect(screen.getByRole('alertdialog')).toHaveTextContent('progress on your article');
    expect(screen.getByRole('alertdialog')).not.toHaveTextContent('AI Images');
  });

  it('Go Back calls onGoBack only', async () => {
    const { user, onGoBack, onStay } = renderConfirmation();

    await user.click(screen.getByRole('button', { name: GO_BACK_LABEL }));

    expect(onGoBack).toHaveBeenCalledOnce();
    expect(onStay).not.toHaveBeenCalled();
  });

  it('Stay calls onStay only', async () => {
    const { user, onGoBack, onStay } = renderConfirmation();

    await user.click(screen.getByRole('button', { name: STAY_LABEL }));

    expect(onStay).toHaveBeenCalledOnce();
    expect(onGoBack).not.toHaveBeenCalled();
  });

  it('focuses Stay, so pressing Enter keeps the progress', async () => {
    const { user, onGoBack, onStay } = renderConfirmation();

    expect(screen.getByRole('button', { name: STAY_LABEL })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onStay).toHaveBeenCalledOnce();
    expect(onGoBack).not.toHaveBeenCalled();
  });

  describe('blocking the screen underneath', () => {
    it('covers the whole window above the screen', () => {
      renderConfirmation();

      expect(screen.getByTestId('back-confirmation-overlay')).toHaveStyle({
        position: 'fixed',
        inset: '0',
        zIndex: '1000',
      });
    });

    it('takes clicks itself rather than letting them through', () => {
      renderConfirmation();

      const overlay = screen.getByTestId('back-confirmation-overlay');
      expect(window.getComputedStyle(overlay).pointerEvents).not.toBe('none');
      expect(screen.getByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('clicking the dimmed background does nothing', async () => {
      const { user, onGoBack, onStay } = renderConfirmation();

      await user.click(screen.getByTestId('back-confirmation-overlay'));

      expect(onGoBack).not.toHaveBeenCalled();
      expect(onStay).not.toHaveBeenCalled();
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  it('uses Coiny for the title and the desk font for the message and buttons', () => {
    renderConfirmation();

    expect(screen.getByRole('heading', { name: CONFIRM_TITLE })).toHaveStyle({ fontFamily: 'Coiny' });
    expect(screen.getByText(confirmMessage('AI Images'))).toHaveStyle({ fontFamily: FONT });
    expect(screen.getByRole('button', { name: GO_BACK_LABEL })).toHaveStyle({ fontFamily: FONT });
    expect(screen.getByRole('button', { name: STAY_LABEL })).toHaveStyle({ fontFamily: FONT });
  });

  it('matches the Settings popup styling', () => {
    renderConfirmation();

    expect(screen.getByRole('alertdialog')).toHaveStyle({
      fontFamily: 'Coiny',
      backgroundColor: '#F7FCFD',
      color: '#4C2100',
      border: '8px solid #6FB3F3',
      borderRadius: '24px',
    });
    expect(screen.getByTestId('back-confirmation-overlay')).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    });
  });

  describe('Go Back and Stay hover effects', () => {
    it.each([
      [GO_BACK_LABEL, COLORS.goBackButton, COLORS.goBackButtonHover],
      [STAY_LABEL, COLORS.stayButton, COLORS.stayButtonHover],
    ])('%s darkens on hover without changing size, then goes back', async (label, color, hoverColor) => {
      const { user } = renderConfirmation();
      const button = screen.getByRole('button', { name: label });

      expect(button).toHaveStyle({ backgroundColor: color });

      await user.hover(button);
      expect(button).toHaveStyle({ backgroundColor: hoverColor });
      expect(button.style.transform).toBe('');

      await user.unhover(button);
      expect(button).toHaveStyle({ backgroundColor: color });
    });

    it('Stay starts focused but not highlighted, since it isn\'t hovered', () => {
      renderConfirmation();
      const stay = screen.getByRole('button', { name: STAY_LABEL });

      expect(stay).toHaveFocus();
      expect(stay).toHaveStyle({ backgroundColor: COLORS.stayButton });
    });

    it('fades the color change', () => {
      renderConfirmation();

      expect(screen.getByRole('button', { name: GO_BACK_LABEL }).style.transition).toBe('background 150ms');
    });
  });
});
