import type { ReactNode } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import Interview from '../InterviewView';
import * as progress from '../../../services/progress';
import { BACK_BUTTON_LABEL } from '../../Back-Button/backButtonView';
import { GO_BACK_LABEL, STAY_LABEL } from '../../Back-Confirmation/backConfirmationContent';

vi.mock('react-konva', () => {
  const Group = forwardRef<
    { to: () => { destroy: () => void } },
    { children?: ReactNode; onClick?: () => void }
  >(({ children, onClick }, ref) => {
    useImperativeHandle(ref, () => ({
      to: () => ({ destroy: vi.fn() }),
    }));
    return <div onClick={onClick}>{children}</div>;
  });

  return {
    Stage: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Layer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Group,
    Line: () => null,
    Rect: () => null,
    Text: ({ text }: { text: string }) => <span>{text}</span>,
  };
});

vi.mock('../../TitleScreen/titleButton', () => ({
  default: ({ text, onClick }: { text: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{text}</button>
  ),
}));

vi.mock('../../SettingsButton/SettingsButton', () => ({
  default: () => null,
}));

vi.mock('../../URLImage/URLImage', () => ({
  URLImage: () => null,
}));

vi.mock('../../../services/progress', () => ({
  completeActivity: vi.fn(),
}));

function renderInterview() {
  return render(
    <MemoryRouter initialEntries={['/interview']}>
      <Routes>
        <Route path="/interview" element={<Interview />} />
        <Route path="/desk" element={<p>Desk view</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Interview view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(progress.completeActivity).mockResolvedValue(['interviews']);
  });

  it('shows the opening prompt and all questions', () => {
    renderInterview();

    expect(screen.getByText('Select a question to ask')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Q1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Q2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Q3' })).toBeInTheDocument();
  });

  it('confirms before returning to the desk', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: BACK_BUTTON_LABEL }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('You will lose all your progress on the interview');

    await user.click(screen.getByRole('button', { name: STAY_LABEL }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByText('Select a question to ask')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: BACK_BUTTON_LABEL }));
    await user.click(screen.getByRole('button', { name: GO_BACK_LABEL }));

    expect(await screen.findByText('Desk view')).toBeInTheDocument();
  });

  it('shows Q1 guidance and its choices after Q1 is selected', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: 'Q1' }));

    expect(screen.getByText('Q1 answer')).toBeInTheDocument();
    expect(screen.getByText('Choose your question wisely! You can only ask one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Q1.1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Q1.2' })).toBeInTheDocument();
  });

  it('shows the selected answer and returns to the list after Add to Journal', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: 'Q1' }));
    await user.click(screen.getByRole('button', { name: 'Q1.1' }));

    expect(screen.getByText('Q1.1 Answer')).toBeInTheDocument();
    expect(screen.queryByText('Choose your question wisely! You can only ask one.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to Journal' }));

    expect(screen.getByText('Select a question to ask')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Q1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Q2' })).toBeInTheDocument();
  });

  it('returns to the desk and marks the interview complete', async () => {
    const user = userEvent.setup();
    renderInterview();

    for (const [question, choice] of [['Q1', 'Q1.1'], ['Q2', 'Q2.1']] as const) {
      await user.click(screen.getByRole('button', { name: question }));
      await user.click(screen.getByRole('button', { name: choice }));
      await user.click(screen.getByRole('button', { name: 'Add to Journal' }));
    }

    await user.click(screen.getByRole('button', { name: 'Q3' }));
    await user.click(screen.getByRole('button', { name: 'Add to Journal' }));
    await user.click(screen.getByRole('button', { name: 'Finish Interview' }));

    expect(progress.completeActivity).toHaveBeenCalledWith('interviews');
    expect(await screen.findByText('Desk view')).toBeInTheDocument();
  });
});
