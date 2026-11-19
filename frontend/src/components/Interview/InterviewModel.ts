export interface InterviewChoice {
  id: string;
  label: string;
  answer: string;
}

export interface InterviewQuestion {
  id: string;
  label: string;
  answer: string;
  choices: InterviewChoice[];
}

export interface InterviewState {
  questions: readonly InterviewQuestion[];
  question?: InterviewQuestion;
  choice?: InterviewChoice;
}

export const INTERVIEW_QUESTIONS: readonly InterviewQuestion[] = [
  {
    id: 'q1',
    label: 'Q1',
    answer: 'Q1 answer',
    choices: [
      { id: 'q1-1', label: 'Q1.1', answer: 'Q1.1 Answer' },
      { id: 'q1-2', label: 'Q1.2', answer: 'Q1.2 Answer' },
    ],
  },
  {
    id: 'q2',
    label: 'Q2',
    answer: 'Q2 answer',
    choices: [{ id: 'q2-1', label: 'Q2.1', answer: 'Q2.1 Answer' }],
  },
  {
    id: 'q3',
    label: 'Q3',
    answer: 'Q3 answer',
    choices: [],
  },
];

export class InterviewModel {
  private remainingQuestions: InterviewQuestion[] = [...INTERVIEW_QUESTIONS];
  private selectedQuestionId: string | undefined;
  private selectedChoiceId: string | undefined;

  getState(): InterviewState {
    const question = this.remainingQuestions.find((item) => item.id === this.selectedQuestionId);
    const choice = question?.choices.find((item) => item.id === this.selectedChoiceId);

    return {
      questions: this.remainingQuestions,
      question,
      choice,
    };
  }

  selectQuestion(id: string): void {
    if (!this.remainingQuestions.some((question) => question.id === id)) return;
    this.selectedQuestionId = id;
    this.selectedChoiceId = undefined;
  }

  selectChoice(id: string): void {
    const question = this.remainingQuestions.find((item) => item.id === this.selectedQuestionId);
    if (!question?.choices.some((choice) => choice.id === id)) return;
    this.selectedChoiceId = id;
  }

  completeCurrentQuestion(): void {
    if (!this.selectedQuestionId) return;
    this.remainingQuestions = this.remainingQuestions.filter(
      (question) => question.id !== this.selectedQuestionId,
    );
    this.selectedQuestionId = undefined;
    this.selectedChoiceId = undefined;
  }
}
