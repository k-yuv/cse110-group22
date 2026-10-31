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

// ---------------------------------------------------------------------------
// MOCK: everything below stands in for the backend until the article API
// exists. When it does, replace getArticleSubjects and submitArticle with fetch
// calls and move scoreArticle (and its tests) to the backend.
// ---------------------------------------------------------------------------

export type EvidenceRating = 'strong' | 'weak' | 'irrelevant';

// Evidence id → rating for one subject. A missing id counts as irrelevant.
export type EvidenceRatings = Record<string, EvidenceRating>;

// Subject id → how each piece of evidence rates for that subject.
export type SubjectRatings = Record<string, EvidenceRatings>;

const RATING_POINTS: Record<EvidenceRating, number> = {
  strong: 1,
  weak: -1,
  irrelevant: 0,
};

// Score needed for the Good Ending, summed over every subject.
export const GOOD_ENDING_THRESHOLD = 2;

// Each answer is rated against its own subject, so the same evidence can be
// strong for one question and irrelevant for another.
export function scoreArticle(ratings: SubjectRatings, answers: ArticleAnswers): ArticleResult {
  const score = Object.entries(answers).reduce((total, [subjectId, evidenceIds]) => {
    const subjectRatings = ratings[subjectId] ?? {};
    return evidenceIds.reduce(
      (subtotal, id) => subtotal + RATING_POINTS[subjectRatings[id] ?? 'irrelevant'],
      total
    );
  }, 0);

  return { ending: score >= GOOD_ENDING_THRESHOLD ? 'good' : 'bad' };
}

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

const MOCK_RATINGS: SubjectRatings = {
  'subject-catnip': {
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
    'ev-nicotine':'strong',
  },
  'subject-arson': {
    'ev-cctv': 'strong',
    'ev-lab': 'strong',
    'ev-insurance': 'strong',
    'ev-photos': 'strong',
    'ev-forum': 'weak',
    'ev-neighbor': 'weak',
    'ev-tabloid': 'weak',
    'ev-cousin': 'weak',
  },
  'subject-warnings': {
    'ev-inspection': 'strong',
    'ev-electrician': 'strong',
    'ev-employee': 'strong',
    'ev-tweet': 'weak',
    'ev-cousin': 'weak',
  },
  'subject-cause': {
    'ev-marshal': 'strong',
    'ev-foreman': 'strong',
    'ev-911': 'strong',
    'ev-photos': 'strong',
    'ev-lab': 'strong',
    'ev-forum': 'weak',
    'ev-neighbor': 'weak',
    'ev-tweet': 'weak',
    'ev-tabloid': 'weak',
  },
};

export async function getArticleSubjects(levelId: string): Promise<ArticleSubject[]> {
  void levelId; // the mock has the same subjects for every level
  return MOCK_SUBJECTS;
}

export async function submitArticle(answers: ArticleAnswers): Promise<ArticleResult> {
  return scoreArticle(MOCK_RATINGS, answers);
}
