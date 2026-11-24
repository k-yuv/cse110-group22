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

// The share of the article's picks the score has to reach for the good ending.
// Each article asks a random set of questions, so the number of picks varies
// (5 to 10). At 0.5, an article of 8 picks needs a score of 4: 6 strong and 2
// weak is good, 5 strong and 3 weak is bad.
export const GOOD_ENDING_SHARE = 0.5;

// An empty article is never good.
export function endingFor(score: number, pickCount: number): ArticleResult['ending'] {
  return pickCount > 0 && score >= pickCount * GOOD_ENDING_SHARE ? 'good' : 'bad';
}

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

  const pickCount = Object.values(answers).reduce((count, ids) => count + ids.length, 0);

  return endingFor(scoreArticle(ratings, answers), pickCount);
}
