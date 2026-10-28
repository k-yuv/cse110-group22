import { describe, it, expect } from 'vitest';
import { scoreArticle, type EvidenceRatings } from '../../../services/article';

// scoreArticle is the mock of the backend's scoring rule. These tests should
// move to the backend along with it.
const ratings: EvidenceRatings = {
  s1: 'strong',
  s2: 'strong',
  s3: 'strong',
  s4: 'strong',
  s5: 'strong',
  w1: 'weak',
  w2: 'weak',
  w3: 'weak',
  i1: 'irrelevant',
};

describe('scoreArticle', () => {
  it('gives the good ending for all strong evidence', () => {
    expect(scoreArticle(ratings, ['s1', 's2', 's3', 's4', 's5']).ending).toBe('good');
  });

  it('gives the bad ending for all weak evidence', () => {
    expect(scoreArticle(ratings, ['w1', 'w2', 'w3']).ending).toBe('bad');
  });

  it('gives the good ending for mixed evidence that is mostly strong', () => {
    // 4 strong - 1 weak = 3, which meets the threshold
    expect(scoreArticle(ratings, ['s1', 's2', 's3', 's4', 'w1']).ending).toBe('good');
  });

  it('gives the bad ending for mixed evidence with too much weak', () => {
    // 3 strong - 2 weak = 1
    expect(scoreArticle(ratings, ['s1', 's2', 's3', 'w1', 'w2']).ending).toBe('bad');
  });

  it('counts irrelevant and unknown evidence as zero', () => {
    expect(scoreArticle(ratings, ['s1', 's2', 'i1', 'unknown']).ending).toBe('bad');
    expect(scoreArticle(ratings, ['s1', 's2', 's3', 'i1', 'unknown']).ending).toBe('good');
  });

  it('rates the same evidence differently for different subjects', () => {
    const otherSubject: EvidenceRatings = { s1: 'weak', s2: 'weak', s3: 'weak' };

    expect(scoreArticle(ratings, ['s1', 's2', 's3']).ending).toBe('good');
    expect(scoreArticle(otherSubject, ['s1', 's2', 's3']).ending).toBe('bad');
  });
});
