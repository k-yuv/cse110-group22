import type { ArticleAnswers, ArticleResult, EvidenceRating, StoredSubjectRatings } from '../../app';
import { readJson } from '../../utils/jsonStore';

// Services hold the business rules and read/write the data files. They know
// nothing about HTTP: they return data or throw, and the controller decides the status.

const RATINGS_FILE = 'articleRatings.json';

const RATING_POINTS: Record<EvidenceRating, number> = {
  strong: 1,
  weak: -1,
  irrelevant: 0,
};

// Score needed for the good ending, summed over every question.
export const GOOD_ENDING_THRESHOLD = 2;

// Adds up the points for every picked piece of evidence. Each pick is rated
// against the question it answers, so the same evidence can be strong for one
// question and irrelevant for another. Unknown questions and unrated evidence
// count as zero.
export function scoreArticle(ratings: StoredSubjectRatings[], answers: ArticleAnswers): number {
  return Object.entries(answers).reduce((total, [subjectId, evidenceIds]) => {
    const subjectRatings = ratings.find((r) => r.subjectId === subjectId)?.ratings ?? {};
    return evidenceIds.reduce(
      (subtotal, id) => subtotal + RATING_POINTS[subjectRatings[id] ?? 'irrelevant'],
      total
    );
  }, 0);
}

// Scores the player's answers against the saved ratings and decides the ending.
export async function scoreAnswers(answers: ArticleAnswers): Promise<ArticleResult['ending']> {
  const ratings = await readJson<StoredSubjectRatings[]>(RATINGS_FILE, []);

  return scoreArticle(ratings, answers) >= GOOD_ENDING_THRESHOLD ? 'good' : 'bad';
}
