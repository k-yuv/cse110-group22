import { describe, it, expect } from 'vitest';
import { ARTICLE_SECTIONS, MAX_ARTICLE_QUESTIONS, getArticleSubjects, pickArticleSubjects } from '../article';
import { ALL_STORY_EVIDENCE } from '../../components/Journal/storyEvidence';
import ratingsFile from '../../../../backend/seed/articleRatings.json';

// The questions live here, the evidence in the Journal, and the ratings in the
// backend seed. Nothing else ties them together, so check that they agree.

type Rating = 'strong' | 'weak' | 'irrelevant';
const RATINGS = ratingsFile as unknown as { subjectId: string; ratings: Record<string, Rating> }[];
const EVIDENCE_IDS = new Set(ALL_STORY_EVIDENCE.map((item) => item.id));
const BANK = ARTICLE_SECTIONS.flat();

function idsRated(ratings: Record<string, Rating>, rating: Rating) {
  return Object.keys(ratings).filter((id) => ratings[id] === rating);
}

describe('article question bank', () => {
  it('rates every question in the bank, and only those questions', () => {
    expect(RATINGS.map((r) => r.subjectId).sort()).toEqual(BANK.map((s) => s.id).sort());
  });

  it('only rates evidence the player can collect', () => {
    for (const { subjectId, ratings } of RATINGS) {
      for (const id of Object.keys(ratings)) {
        expect(EVIDENCE_IDS.has(id), `${subjectId} rates unknown evidence ${id}`).toBe(true);
      }
    }
  });

  it('lets every question be answered fully with strong evidence', () => {
    for (const subject of BANK) {
      const ratings = RATINGS.find((r) => r.subjectId === subject.id)!.ratings;
      expect(idsRated(ratings, 'strong').length, subject.id).toBeGreaterThanOrEqual(subject.requiredCount);
    }
  });

  it('gives every question at least one tempting weak answer', () => {
    for (const { subjectId, ratings } of RATINGS) {
      expect(idsRated(ratings, 'weak').length, subjectId).toBeGreaterThan(0);
    }
  });
});

describe('picking the questions for one article', () => {
  it(`asks at most ${MAX_ARTICLE_QUESTIONS} questions, one from each section, in order`, async () => {
    const subjects = await getArticleSubjects('level-1');

    expect(subjects.length).toBeLessThanOrEqual(MAX_ARTICLE_QUESTIONS);
    subjects.forEach((subject, index) => expect(ARTICLE_SECTIONS[index]).toContain(subject));
  });

  it('uses the random number to choose within each section', () => {
    expect(pickArticleSubjects(() => 0)).toEqual(ARTICLE_SECTIONS.map((section) => section[0]));
    expect(pickArticleSubjects(() => 0.999)).toEqual(ARTICLE_SECTIONS.map((section) => section[section.length - 1]));
  });

  it('can ask every question in the bank', () => {
    const asked = new Set<string>();
    for (let i = 0; i < 20; i++) {
      for (const subject of pickArticleSubjects(() => i / 20)) asked.add(subject.id);
    }
    expect(asked).toEqual(new Set(BANK.map((s) => s.id)));
  });
});
