import type { Question } from '../../app';
import { readJson } from '../../utils/jsonStore';

// Services hold the business rules and read/write the data files. They know
// nothing about HTTP: they return data or throw, and the controller decides the status.

const QUESTIONS_FILE = 'questions.json';

// Returns null when no question has that chapter and number.
export async function getQuestion(chapter: number, number: number): Promise<Question | null> {
  const questions = await readJson<Question[]>(QUESTIONS_FILE, []);

  return questions.find((q) => q.chapter === chapter && q.number === number) ?? null;
}
