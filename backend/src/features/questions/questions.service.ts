import type { Question, StoredQuestion } from '../../app';
import { readJson } from '../../utils/jsonStore';

// Services hold the business rules and read/write the data files. They know
// nothing about HTTP: they return data or throw, and the controller decides the status.

const QUESTIONS_FILE = 'questions.json';

async function findQuestion(chapter: number, number: number): Promise<StoredQuestion | null> {
  const questions = await readJson<StoredQuestion[]>(QUESTIONS_FILE, []);

  return questions.find((q) => q.chapter === chapter && q.number === number) ?? null;
}

// Returns null when no question has that chapter and number. The correct
// choice is left out so it never reaches the client.
export async function getQuestion(chapter: number, number: number): Promise<Question | null> {
  const question = await findQuestion(chapter, number);
  if (!question) {
    return null;
  }

  const { correctChoice: _correctChoice, ...publicQuestion } = question;
  return publicQuestion;
}

// Returns whether `choice` (a position 0-3 in the question's choices) is the
// correct one, or null when the question doesn't exist.
export async function checkAnswer(chapter: number, number: number, choice: number): Promise<boolean | null> {
  const question = await findQuestion(chapter, number);
  if (!question) {
    return null;
  }

  return choice === question.correctChoice;
}
