import { describe, it, expect } from 'vitest';
import { scoreArticle, type SubjectRatings } from '../../../services/article';

// scoreArticle is the mock of the backend's scoring rule. These tests should
// move to the backend along with it.
const ratings: SubjectRatings = {
  q1: { s1: 'strong', s2: 'strong', w1: 'weak', i1: 'irrelevant' },
  q2: { s1: 'weak', s3: 'strong', w2: 'weak' },
  q3: { s4: 'strong', w3: 'weak' },
};

describe('scoreArticle', () => {
  it('gives the good ending for all strong evidence', () => {
    expect(scoreArticle(ratings, { q1: ['s1'], q2: ['s3'], q3: ['s4'] }).ending).toBe('good');
  });

  it('gives the bad ending for all weak evidence', () => {
    expect(scoreArticle(ratings, { q1: ['w1'], q2: ['w2'], q3: ['w3'] }).ending).toBe('bad');
  });

  it('adds up the score across questions', () => {
    // 1 + 1 + 0 = 2, which meets the threshold
    expect(scoreArticle(ratings, { q1: ['s1'], q2: ['s3'], q3: [] }).ending).toBe('good');
    // 1 + 1 - 1 = 1
    expect(scoreArticle(ratings, { q1: ['s1'], q2: ['s3'], q3: ['w3'] }).ending).toBe('bad');
  });

  it('counts irrelevant and unknown evidence as zero', () => {
    expect(scoreArticle(ratings, { q1: ['s1', 'i1', 'unknown'], q2: [], q3: [] }).ending).toBe('bad');
    expect(scoreArticle(ratings, { q1: ['s1', 's2', 'i1', 'unknown'] }).ending).toBe('good');
  });

  it('rates the same evidence against the question it answers', () => {
    // s1 is strong for q1 but weak for q2, and unrated for q3.
    expect(scoreArticle(ratings, { q1: ['s1'], q3: ['s4'] }).ending).toBe('good');
    expect(scoreArticle(ratings, { q2: ['s1'], q3: ['s4'] }).ending).toBe('bad');
    expect(scoreArticle(ratings, { q3: ['s1', 's4'] }).ending).toBe('bad');
  });

  it('ignores answers to unknown questions', () => {
    expect(scoreArticle(ratings, { nope: ['s1', 's2', 's3'] }).ending).toBe('bad');
  });
});
