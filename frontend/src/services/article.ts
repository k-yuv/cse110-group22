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
//
// Together the questions argue one thing: cats are addicted to Big Drug Inc.'s
// catnip, the company knows it, and it hides it.
// ---------------------------------------------------------------------------

// The question bank, one array per section of the argument. Each article asks
// one question from each section, in this order.
export const ARTICLE_SECTIONS: readonly (readonly ArticleSubject[])[] = [
  // 1. The claim: cats are addicted
  [
    {
      id: 'subject-what-happens',
      prompt: "What happens to cats after they start using Big Drug Inc.'s catnip?",
      requiredCount: 2,
    },
    {
      id: 'subject-quitting',
      prompt: 'What happens when cats try to stop using the catnip?',
      requiredCount: 2,
    },
    {
      id: 'subject-how-many',
      prompt: 'Is this a few unlucky cats, or is it happening to most users?',
      requiredCount: 1,
    },
  ],
  // 2. The cause: it's the product
  [
    {
      id: 'subject-ingredient',
      prompt: 'What is in the catnip that makes it addictive?',
      requiredCount: 1,
    },
    {
      id: 'subject-deluxe',
      prompt: 'Is the new Catnip Deluxe even more addictive than the original?',
      requiredCount: 2,
    },
  ],
  // 3. The company knows
  [
    {
      id: 'subject-company-knows',
      prompt: 'Does Big Drug Inc. know its catnip is addictive?',
      requiredCount: 2,
    },
    {
      id: 'subject-motive',
      prompt: 'Why would Big Drug Inc. want cats to keep buying more catnip?',
      requiredCount: 1,
    },
  ],
  // 4. The cover-up
  [
    {
      id: 'subject-why-trusted',
      prompt: 'Why do so many cats still believe the catnip is safe?',
      requiredCount: 2,
    },
    {
      id: 'subject-left-out',
      prompt: 'What did the company-owned newspaper leave out of its coverage?',
      requiredCount: 2,
    },
    {
      id: 'subject-online-praise',
      prompt: 'Can the glowing reviews of the catnip online be trusted?',
      requiredCount: 2,
    },
  ],
  // 5. Answering the company
  [
    {
      id: 'subject-rebuttal',
      prompt: 'Big Drug Inc. says its catnip is perfectly safe. What proves otherwise?',
      requiredCount: 1,
    },
  ],
];

// The most questions one article asks.
export const MAX_ARTICLE_QUESTIONS = 5;

// Picks one random question from each section, keeping the sections' order so
// the article still builds its argument step by step. `random` is
// Math.random unless a test passes its own.
export function pickArticleSubjects(random: () => number = Math.random): ArticleSubject[] {
  return ARTICLE_SECTIONS.map((section) => section[Math.floor(random() * section.length)]).slice(
    0,
    MAX_ARTICLE_QUESTIONS
  );
}

// A new random set of questions every time the Create Article page loads.
export async function getArticleSubjects(levelId: string): Promise<ArticleSubject[]> {
  void levelId; // the mock picks from the same bank for every level
  return pickArticleSubjects();
}
