export interface InterviewChoice {
  id: string;
  label: string;
  answer: string;
}

export interface InterviewQuestion {
  id: string;
  label: string;
  answer: string;
  // The story evidence (see Journal/storyEvidence.ts) that Add to Journal saves.
  evidenceId: string;
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
    label: "How do you respond to concerns that Big Drug Inc.'s catnip may be unsafe?",
    answer: 'Our catnip is perfectly safe.',
    evidenceId: 'ev-ceo-pr-claims',
    choices: [
      {
        id: 'q1-1',
        label: 'What evidence supports that safety claim?',
        answer: "I haven't shared any data to support that claim.",
      },
      {
        id: 'q1-2',
        label: 'Without data, can you still say it is perfectly safe?',
        answer: 'Like I said before, our catnip is perfectly safe.',
      },
    ],
  },
  {
    id: 'q2',
    label: 'How does Big Drug Inc. define a good customer?',
    answer: 'Repeat customers are good customers.',
    evidenceId: 'ev-ceo-values',
    choices: [
      {
        id: 'q2-1',
        label: "Should customers' health come before repeat business?",
        answer: 'Big Drug Inc prides itself in good quality catnip.',
      },
    ],
  },
  {
    id: 'q3',
    label: "Did you ask the journalist not to publish negative claims about Big Drug Inc.?",
    answer: 'I asked the journalist not to post bad claims about my company.',
    evidenceId: 'ev-ceo-request',
    choices: [],
  },
  {
    id: 'q4',
    label: "What can you tell us about Big Drug Inc.'s next catnip product?",
    answer: "We're working on a 'better' catnip, coming soon.",
    evidenceId: 'ev-ceo-deluxe-hint',
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
