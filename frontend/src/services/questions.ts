export interface Question {
  chapter: number;
  number: number;
  content: string;
  // Always exactly 4. A choice is referred to by its position (0-3).
  choices: string[];
}

export interface AnswerResult {
  correct: boolean;
}

export async function getQuestion(chapter: number, number: number): Promise<Question> {
  const response = await fetch(`/api/chapters/${chapter}/questions/${number}`);

  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }

  return response.json();
}

export async function submitAnswer(chapter: number, number: number, choice: number): Promise<AnswerResult> {
  const response = await fetch(`/api/chapters/${chapter}/questions/${number}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ choice }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit answer');
  }

  return response.json();
}
