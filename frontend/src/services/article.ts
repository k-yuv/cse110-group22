export type ArticleEnding = 'good' | 'bad';

// What the player is writing about. Ratings are deliberately not included:
// the client never learns which evidence is strong.
export interface ArticleSubject {
  id: string;
  prompt: string;
  requiredCount: number;
}

export interface ArticleResult {
  ending: ArticleEnding;
}

// ---------------------------------------------------------------------------
// MOCK: everything below stands in for the backend until the article API
// exists. When it does, replace getArticleSubject and submitArticle with fetch
// calls and move scoreArticle (and its tests) to the backend.
// ---------------------------------------------------------------------------

export type EvidenceRating = 'strong' | 'weak' | 'irrelevant';

// Evidence id → rating for one subject. A missing id counts as irrelevant.
export type EvidenceRatings = Record<string, EvidenceRating>;

const RATING_POINTS: Record<EvidenceRating, number> = {
  strong: 1,
  weak: -1,
  irrelevant: 0,
};

// Score needed for the Good Ending.
export const GOOD_ENDING_THRESHOLD = 3;

export function scoreArticle(ratings: EvidenceRatings, evidenceIds: string[]): ArticleResult {
  const score = evidenceIds.reduce(
    (total, id) => total + RATING_POINTS[ratings[id] ?? 'irrelevant'],
    0
  );

  return { ending: score >= GOOD_ENDING_THRESHOLD ? 'good' : 'bad' };
}

const MOCK_SUBJECT: ArticleSubject = {
  id: 'subject-factory-fire',
  prompt: 'Was the Riverside factory fire an accident?',
  requiredCount: 5,
};

const MOCK_RATINGS: EvidenceRatings = {
  'ev-marshal': 'strong',
  'ev-cctv': 'strong',
  'ev-inspection': 'strong',
  'ev-foreman': 'strong',
  'ev-insurance': 'strong',
  'ev-forum': 'weak',
  'ev-neighbor': 'weak',
  'ev-weather': 'irrelevant',
  'ev-electrician': 'strong',
  'ev-911': 'strong',
  'ev-lab': 'strong',
  'ev-photos': 'strong',
  'ev-employee': 'strong',
  'ev-tweet': 'weak',
  'ev-tabloid': 'weak',
  'ev-cousin': 'weak',
  'ev-menu': 'irrelevant',
  'ev-parking': 'irrelevant',
};

export async function getArticleSubject(levelId: string): Promise<ArticleSubject> {
  void levelId; // the mock has one subject for every level
  return MOCK_SUBJECT;
}

export async function submitArticle(subjectId: string, evidenceIds: string[]): Promise<ArticleResult> {
  void subjectId;
  return scoreArticle(MOCK_RATINGS, evidenceIds);
}
