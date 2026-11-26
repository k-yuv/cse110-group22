import { describe, expect, it } from 'vitest';
import { InterviewModel } from '../InterviewModel';

describe('InterviewModel', () => {
  it('starts with all interview questions available', () => {
    const model = new InterviewModel();

    expect(model.getState()).toMatchObject({
      questions: [
        { id: 'q1', label: "How do you respond to concerns that Big Drug Inc.'s catnip may be unsafe?" },
        { id: 'q2', label: 'How does Big Drug Inc. define a good customer?' },
        { id: 'q3', label: "Did you ask the journalist not to publish negative claims about Big Drug Inc.?" },
        { id: 'q4', label: "What can you tell us about Big Drug Inc.'s next catnip product?" },
      ],
    });
  });

  it('selects a question and then one of its answer choices', () => {
    const model = new InterviewModel();

    model.selectQuestion('q1');
    expect(model.getState().question?.answer).toBe('Our catnip is perfectly safe.');
    expect(model.getState().choice).toBeUndefined();

    model.selectChoice('q1-1');
    expect(model.getState().choice).toMatchObject({
      id: 'q1-1',
      answer: "I haven't shared any data to support that claim.",
    });

    model.selectChoice('q1-2');
    expect(model.getState().choice).toMatchObject({
      id: 'q1-2',
      answer: 'Our catnip is perfectly safe.',
    });
  });

  it('returns to the question list and removes the completed question', () => {
    const model = new InterviewModel();

    model.selectQuestion('q1');
    model.selectChoice('q1-1');
    model.completeCurrentQuestion();

    expect(model.getState().question).toBeUndefined();
    expect(model.getState().choice).toBeUndefined();
    expect(model.getState().questions.map((question) => question.id)).toEqual(['q2', 'q3', 'q4']);
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

    expect(model.getState().questions.map((question) => question.id)).toEqual(['q1', 'q2', 'q4']);
  });
});
