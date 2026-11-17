export type ArticleEnding = 'good' | 'bad';

// One question the article has to answer. Ratings are deliberately not
// included: the client never learns which evidence is strong.
export interface ArticleSubject {
  id: string;
  prompt: string;
  requiredCount: number;
}

// Subject id → the evidence ids the player picked for it.
export type ArticleAnswers = Record<string, string[]>;

export interface ArticleResult {
  ending: ArticleEnding;
}

export async function submitArticle(answers: ArticleAnswers): Promise<ArticleResult> {
  const response = await fetch('/api/article/answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit article');
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// MOCK: the questions stand in for the backend until there is a route for
// them. When there is, replace getArticleSubjects with a fetch call. The
// subject ids must match the ones rated in backend/seed/articleRatings.json.
// ---------------------------------------------------------------------------

const MOCK_SUBJECTS: ArticleSubject[] = [
  {
    id: 'subject-catnip',
    prompt: 'How did Big Drug Inc. make the catnip so dangerous?',
    requiredCount: 1,
  },
  {
    id: 'subject-arson',
    prompt: 'Was the fire set on purpose?',
    requiredCount: 1,
  },
  {
    id: 'subject-warnings',
    prompt: 'Did the owner ignore warnings?',
    requiredCount: 1,
  },
  {
    id: 'subject-cause',
    prompt: 'What caused the fire?',
    requiredCount: 2,
  },
];

export async function getArticleSubjects(levelId: string): Promise<ArticleSubject[]> {
  void levelId; // the mock has the same subjects for every level
  return MOCK_SUBJECTS;
}
