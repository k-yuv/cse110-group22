import { describe, expect, it } from 'vitest';
import { InterviewModel } from '../InterviewModel';

describe('InterviewModel', () => {
  it('starts with all interview questions available', () => {
    const model = new InterviewModel();

    expect(model.getState()).toMatchObject({
      questions: [
        { id: 'q1', label: 'Q1' },
        { id: 'q2', label: 'Q2' },
        { id: 'q3', label: 'Q3' },
      ],
    });
  });

  it('selects a question and then one of its answer choices', () => {
    const model = new InterviewModel();

    model.selectQuestion('q1');
    expect(model.getState().question?.answer).toBe('Q1 answer');
    expect(model.getState().choice).toBeUndefined();

    model.selectChoice('q1-1');
    expect(model.getState().choice).toMatchObject({
      id: 'q1-1',
      answer: 'Q1.1 Answer',
    });
  });

  it('returns to the question list and removes the completed question', () => {
    const model = new InterviewModel();

    model.selectQuestion('q1');
    model.selectChoice('q1-2');
    model.completeCurrentQuestion();

    expect(model.getState().question).toBeUndefined();
    expect(model.getState().choice).toBeUndefined();
    expect(model.getState().questions.map((question) => question.id)).toEqual(['q2', 'q3']);
  });

  it('ignores invalid question and choice selections', () => {
    const model = new InterviewModel();

    model.selectQuestion('missing');
    model.selectChoice('q1-1');
    expect(model.getState().question).toBeUndefined();

    model.selectQuestion('q2');
    model.selectChoice('q1-1');
    expect(model.getState().choice).toBeUndefined();
  });

  it('can complete the no-choice question and finish the interview', () => {
    const model = new InterviewModel();

    model.selectQuestion('q3');
    model.completeCurrentQuestion();

    expect(model.getState().questions.map((question) => question.id)).toEqual(['q1', 'q2']);
  });
});
