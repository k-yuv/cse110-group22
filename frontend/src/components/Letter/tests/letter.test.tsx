import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Letter from '../letterView';
import { HINT_LABEL, LETTER_GREETING, LETTER_LABEL, LETTER_SIGNATURE, PUT_AWAY_LABEL } from '../letterContent';

function getLetter() {
  return screen.queryByRole('dialog', { name: LETTER_LABEL });
}

describe('Letter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the letter the first time', () => {
    render(<Letter />);

    expect(getLetter()).toHaveTextContent(LETTER_GREETING);
    expect(getLetter()).toHaveTextContent(LETTER_SIGNATURE);
  });

  it('stays put away after the screen is opened again', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Letter />);

    await user.click(screen.getByRole('button', { name: PUT_AWAY_LABEL }));
    expect(getLetter()).not.toBeInTheDocument();

    unmount();
    render(<Letter />);
    expect(getLetter()).not.toBeInTheDocument();
  });

  it('opens again from the hint button', async () => {
    const user = userEvent.setup();
    render(<Letter />);
    await user.click(screen.getByRole('button', { name: PUT_AWAY_LABEL }));

    await user.click(screen.getByRole('button', { name: HINT_LABEL }));

    expect(getLetter()).toBeInTheDocument();
  });
});
