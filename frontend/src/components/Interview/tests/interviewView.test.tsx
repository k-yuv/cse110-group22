import type { ReactNode } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import Interview, { HINT_TEXT } from '../InterviewView';
import { INTERVIEW_QUESTIONS } from '../InterviewModel';
import * as progress from '../../../services/progress';
import { addEvidence } from '../../NewsArticle/journalAdapter';
import { ADD_EVIDENCE_ERROR } from '../interviewScreenModel';
import { ALL_STORY_EVIDENCE } from '../../Journal/storyEvidence';
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
  default: ({
    text,
    y,
    height,
    onClick,
  }: {
    text: string;
    y: number;
    height: number;
    onClick?: () => void;
  }) => (
    <button type="button" data-y={y} data-height={height} onClick={onClick}>{text}</button>
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

vi.mock('../../NewsArticle/journalAdapter', () => ({ addEvidence: vi.fn() }));

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
    vi.mocked(addEvidence).mockResolvedValue(true);
  });

  it('opens the hint from the hint button', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(await screen.findByRole('button', { name: 'Open hint' }));

    expect(screen.getByRole('dialog', { name: 'Hint' })).toHaveTextContent(HINT_TEXT);
  });

  it('shows the opening prompt and all questions', () => {
    renderInterview();

    expect(screen.getByText('Let\'s interview the CEO of Big Drug Inc! Select a question to ask.')).toBeInTheDocument();
    for (const question of INTERVIEW_QUESTIONS) {
      expect(screen.getByRole('button', { name: question.label })).toBeInTheDocument();
    }

    const buttons = INTERVIEW_QUESTIONS.map((question) =>
      screen.getByRole('button', { name: question.label }),
    );
    const bounds = buttons.map((button) => {
      const top = Number(button.getAttribute('data-y'));
      return { top, bottom: top + Number(button.getAttribute('data-height')) };
    });

    expect(bounds.at(-1)?.bottom).toBeLessThan(622);
    for (let index = 1; index < bounds.length; index += 1) {
      expect(bounds[index].top - bounds[index - 1].bottom).toBeGreaterThanOrEqual(12);
    }
  });

  it('confirms before returning to the desk', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: BACK_BUTTON_LABEL }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('You will lose all your progress on the interview');

    await user.click(screen.getByRole('button', { name: STAY_LABEL }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByText('Let\'s interview the CEO of Big Drug Inc! Select a question to ask.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: BACK_BUTTON_LABEL }));
    await user.click(screen.getByRole('button', { name: GO_BACK_LABEL }));

    expect(await screen.findByText('Desk view')).toBeInTheDocument();
  });

  it('shows the CEO safety claim and follow-up after the question is selected', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[0].label }));

    expect(screen.getByText('Our catnip is perfectly safe.')).toBeInTheDocument();
    expect(screen.getByText('Choose your follow-up wisely! You can only ask one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[0].choices[0].label })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[0].choices[1].label })).toBeInTheDocument();
  });

  it('shows the selected follow-up answer and returns to the list after Add to Journal', async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[0].label }));
    await user.click(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[0].choices[0].label }));

    expect(screen.getByText("I haven't shared any data to support that claim.")).toBeInTheDocument();
    expect(screen.queryByText('Choose your follow-up wisely! You can only ask one.')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to Journal' }));

    expect(screen.getByText('Let\'s interview the CEO of Big Drug Inc! Select a question to ask.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: INTERVIEW_QUESTIONS[0].label })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[1].label })).toBeInTheDocument();
  });

  it('returns to the desk and marks the interview complete', async () => {
    const user = userEvent.setup();
    renderInterview();

    for (const question of INTERVIEW_QUESTIONS) {
      await user.click(screen.getByRole('button', { name: question.label }));
      if (question.choices.length > 0) {
        await user.click(screen.getByRole('button', { name: question.choices[0].label }));
      }
      await user.click(screen.getByRole('button', { name: 'Add to Journal' }));
    }

    await user.click(screen.getByRole('button', { name: 'Finish Interview' }));

    expect(progress.completeActivity).toHaveBeenCalledWith('interviews');
    expect(await screen.findByText('Desk view')).toBeInTheDocument();
  });

  it('gives every question evidence that exists in the story evidence', () => {
    const ids = new Set(ALL_STORY_EVIDENCE.map((item) => item.id));
    for (const question of INTERVIEW_QUESTIONS) {
      expect(ids.has(question.evidenceId)).toBe(true);
    }
  });

  it("adds the question's evidence to the journal on Add to Journal", async () => {
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[1].label }));
    await user.click(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[1].choices[0].label }));
    await user.click(screen.getByRole('button', { name: 'Add to Journal' }));

    expect(addEvidence).toHaveBeenCalledWith('ev-ceo-values');
  });

  it('keeps the question open and shows an error if the evidence cannot be saved', async () => {
    vi.mocked(addEvidence).mockResolvedValueOnce(false);
    const user = userEvent.setup();
    renderInterview();

    await user.click(screen.getByRole('button', { name: INTERVIEW_QUESTIONS[2].label }));
    await user.click(screen.getByRole('button', { name: 'Add to Journal' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(ADD_EVIDENCE_ERROR);
    expect(screen.getByText(INTERVIEW_QUESTIONS[2].answer)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Journal' })).toBeInTheDocument();
  });
});
