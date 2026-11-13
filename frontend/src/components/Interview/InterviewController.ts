import { InterviewModel } from './InterviewModel';

export class InterviewController {
  readonly model: InterviewModel;

  constructor(model = new InterviewModel()) {
    this.model = model;
  }

  selectQuestion(id: string): void {
    this.model.selectQuestion(id);
  }

  selectChoice(id: string): void {
    this.model.selectChoice(id);
  }

  completeCurrentQuestion(): void {
    this.model.completeCurrentQuestion();
  }
}
