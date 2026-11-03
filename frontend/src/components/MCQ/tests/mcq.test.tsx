import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MCQ from '../mcqView';
import * as questionsApi from '../../../services/questions';

// jsdom has no <canvas>, so real Konva crashes. Everything this component
// shows is on the canvas, so swap each Konva shape for plain HTML the test can
// read and click: Text shows its text, Group passes clicks through, and Rect
// exposes its fill color (looked up by its `name`).

// Claude Generated This Section To Mock Konva UI By Replacing The Simulated
// One With Actual React Components That Render In The Fake DOM.
// <------------------------BEGIN SECTION-------------------------------->
vi.mock('react-konva', () => ({
  Stage: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Layer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Group: ({ children, onClick }: { children?: ReactNode; onClick?: () => void }) => (
    <div onClick={onClick}>{children}</div>
  ),
  Rect: ({ name, fill }: { name?: string; fill?: string }) => <div data-testid={name} data-fill={fill} />,
  Text: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock('../../../services/questions', () => ({
  getQuestion: vi.fn(),
  submitAnswer: vi.fn(),
}));

const QUESTION = {
  chapter: 1,
  number: 2,
  content: 'What is 2 + 2?',
  choices: ['3', '4', '5', '22'],
};

const DEFAULT_FILL = '#f5f5f5';
const CORRECT_FILL = '#d4edda';
const WRONG_FILL = '#f8d7da';

// <--------------------------END SECTION-------------------------------->

function fillOf(index: number) {
  return screen.getByTestId(`choice-${index}`).getAttribute('data-fill');
}

describe('MCQ component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(questionsApi.getQuestion).mockResolvedValue(QUESTION);
  });

  it('shows a loading message until the question arrives', async () => {
    render(<MCQ chapter={1} number={2} />);

    expect(screen.getByText('Loading question...')).toBeInTheDocument();
    expect(await screen.findByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.queryByText('Loading question...')).not.toBeInTheDocument();
    expect(questionsApi.getQuestion).toHaveBeenCalledWith(1, 2);
  });

  it('shows the chapter, question, and all 4 lettered choices', async () => {
    render(<MCQ chapter={1} number={2} />);

    expect(await screen.findByText('A. 3')).toBeInTheDocument();
    expect(screen.getByText('Chapter 1 · Question 2')).toBeInTheDocument();
    expect(screen.getByText('B. 4')).toBeInTheDocument();
    expect(screen.getByText('C. 5')).toBeInTheDocument();
    expect(screen.getByText('D. 22')).toBeInTheDocument();
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });

  it('marks a correct answer green', async () => {
    vi.mocked(questionsApi.submitAnswer).mockResolvedValue({ correct: true });
    const user = userEvent.setup();
    render(<MCQ chapter={1} number={2} />);

    await user.click(await screen.findByText('B. 4'));

    expect(await screen.findByText('Correct!')).toBeInTheDocument();
    expect(questionsApi.submitAnswer).toHaveBeenCalledWith(1, 2, 1);
    expect(fillOf(1)).toBe(CORRECT_FILL);
    expect(fillOf(0)).toBe(DEFAULT_FILL);
  });

  it('marks a wrong answer red', async () => {
    vi.mocked(questionsApi.submitAnswer).mockResolvedValue({ correct: false });
    const user = userEvent.setup();
    render(<MCQ chapter={1} number={2} />);

    await user.click(await screen.findByText('A. 3'));

    expect(await screen.findByText('Incorrect, try again')).toBeInTheDocument();
    expect(questionsApi.submitAnswer).toHaveBeenCalledWith(1, 2, 0);
    expect(fillOf(0)).toBe(WRONG_FILL);
    expect(fillOf(1)).toBe(DEFAULT_FILL);
  });

  it('ignores other choices once an answer is shown', async () => {
    vi.mocked(questionsApi.submitAnswer).mockResolvedValue({ correct: false });
    const user = userEvent.setup();
    render(<MCQ chapter={1} number={2} />);

    await user.click(await screen.findByText('A. 3'));
    await screen.findByText('Incorrect, try again');
    await user.click(screen.getByText('B. 4'));

    expect(questionsApi.submitAnswer).toHaveBeenCalledTimes(1);
    expect(fillOf(1)).toBe(DEFAULT_FILL);
  });

  it('lets the user try again after pressing Reset', async () => {
    vi.mocked(questionsApi.submitAnswer)
      .mockResolvedValueOnce({ correct: false })
      .mockResolvedValueOnce({ correct: true });
    const user = userEvent.setup();
    render(<MCQ chapter={1} number={2} />);

    await user.click(await screen.findByText('A. 3'));
    await user.click(await screen.findByText('Reset'));

    expect(screen.queryByText('Incorrect, try again')).not.toBeInTheDocument();
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    expect(fillOf(0)).toBe(DEFAULT_FILL);

    await user.click(screen.getByText('B. 4'));

    expect(await screen.findByText('Correct!')).toBeInTheDocument();
    expect(fillOf(1)).toBe(CORRECT_FILL);
  });

  it('shows an error when the question fails to load', async () => {
    vi.mocked(questionsApi.getQuestion).mockRejectedValue(new Error('down'));

    render(<MCQ chapter={1} number={2} />);

    expect(await screen.findByText('Could not load question')).toBeInTheDocument();
    expect(screen.queryByText('Loading question...')).not.toBeInTheDocument();
  });

  it('shows an error and allows another try when checking fails', async () => {
    vi.mocked(questionsApi.submitAnswer)
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce({ correct: true });
    const user = userEvent.setup();
    render(<MCQ chapter={1} number={2} />);

    await user.click(await screen.findByText('B. 4'));

    expect(await screen.findByText('Could not check answer')).toBeInTheDocument();
    expect(fillOf(1)).toBe(DEFAULT_FILL);

    await user.click(screen.getByText('B. 4'));

    expect(await screen.findByText('Correct!')).toBeInTheDocument();
    expect(screen.queryByText('Could not check answer')).not.toBeInTheDocument();
  });

  it('loads the new question and clears the answer when the props change', async () => {
    vi.mocked(questionsApi.submitAnswer).mockResolvedValue({ correct: true });
    vi.mocked(questionsApi.getQuestion)
      .mockResolvedValueOnce(QUESTION)
      .mockResolvedValueOnce({ ...QUESTION, number: 3, content: 'What is 3 + 3?' });
    const user = userEvent.setup();
    const { rerender } = render(<MCQ chapter={1} number={2} />);

    await user.click(await screen.findByText('B. 4'));
    await screen.findByText('Correct!');

    rerender(<MCQ chapter={1} number={3} />);

    expect(await screen.findByText('What is 3 + 3?')).toBeInTheDocument();
    expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
    expect(questionsApi.getQuestion).toHaveBeenLastCalledWith(1, 3);
  });
});
