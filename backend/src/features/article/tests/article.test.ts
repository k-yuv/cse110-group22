import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import app from '../../../app';
import type { ArticleAnswers, StoredSubjectRatings } from '../../../app';
import { GOOD_ENDING_THRESHOLD, scoreArticle } from '../article.service';

// During tests, ratings are read from backend/data/test/articleRatings.json
// (DATA_DIR is set in vitest.config.mts). Each route test starts with the ratings below.
const RATINGS_FILE = path.join(process.env.DATA_DIR!, 'articleRatings.json');

const RATINGS: StoredSubjectRatings[] = [
  { subjectId: 'q1', ratings: { s1: 'strong', s2: 'strong', w1: 'weak', i1: 'irrelevant' } },
  { subjectId: 'q2', ratings: { s1: 'weak', s3: 'strong', w2: 'weak' } },
  { subjectId: 'q3', ratings: { s4: 'strong', w3: 'weak' } },
];

async function writeRatingsFile(contents: string) {
  await fs.mkdir(path.dirname(RATINGS_FILE), { recursive: true });
  await fs.writeFile(RATINGS_FILE, contents);
}

function submit(body: unknown) {
  return request(app).post('/api/article/answers').send(body as object);
}

describe('scoreArticle', () => {
  it('gives +1 for strong evidence and -1 for weak', () => {
    expect(scoreArticle(RATINGS, { q1: ['s1'], q2: ['s3'], q3: ['s4'] })).toBe(3);
    expect(scoreArticle(RATINGS, { q1: ['w1'], q2: ['w2'], q3: ['w3'] })).toBe(-3);
  });

  it('adds up the score across questions', () => {
    expect(scoreArticle(RATINGS, { q1: ['s1'], q2: ['s3'], q3: [] })).toBe(2);
    expect(scoreArticle(RATINGS, { q1: ['s1'], q2: ['s3'], q3: ['w3'] })).toBe(1);
  });

  it('counts irrelevant and unknown evidence as zero', () => {
    expect(scoreArticle(RATINGS, { q1: ['s1', 'i1', 'unknown'], q2: [], q3: [] })).toBe(1);
  });

  it('rates the same evidence against the question it answers', () => {
    // s1 is strong for q1 but weak for q2, and unrated for q3.
    expect(scoreArticle(RATINGS, { q1: ['s1'] })).toBe(1);
    expect(scoreArticle(RATINGS, { q2: ['s1'] })).toBe(-1);
    expect(scoreArticle(RATINGS, { q3: ['s1'] })).toBe(0);
  });

  it('ignores answers to unknown questions', () => {
    expect(scoreArticle(RATINGS, { nope: ['s1', 's2', 's3'] })).toBe(0);
  });
});

describe('POST /api/article/answers', () => {
  beforeEach(async () => {
    await writeRatingsFile(JSON.stringify(RATINGS));
  });

  it('gives the good ending for all strong evidence', async () => {
    const response = await submit({ answers: { q1: ['s1'], q2: ['s3'], q3: ['s4'] } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ending: 'good' });
  });

  it('gives the bad ending for all weak evidence', async () => {
    const response = await submit({ answers: { q1: ['w1'], q2: ['w2'], q3: ['w3'] } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ending: 'bad' });
  });

  it(`gives the good ending at exactly the threshold (${GOOD_ENDING_THRESHOLD}) and the bad ending just below it`, async () => {
    // 1 + 1 + 0 = 2
    expect((await submit({ answers: { q1: ['s1'], q2: ['s3'], q3: [] } })).body).toEqual({ ending: 'good' });
    // 1 + 1 - 1 = 1
    expect((await submit({ answers: { q1: ['s1'], q2: ['s3'], q3: ['w3'] } })).body).toEqual({ ending: 'bad' });
  });

  it('gives the bad ending for no answers', async () => {
    const response = await submit({ answers: {} });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ending: 'bad' });
  });

  it('never sends the ratings or the score', async () => {
    const response = await submit({ answers: { q1: ['s1', 's2'] } });

    expect(Object.keys(response.body)).toEqual(['ending']);
  });

  it('does not change the ratings file', async () => {
    await submit({ answers: { q1: ['s1'] } });

    expect(JSON.parse(await fs.readFile(RATINGS_FILE, 'utf8'))).toEqual(RATINGS);
  });

  it('gives the bad ending when the ratings file does not exist yet', async () => {
    await fs.rm(RATINGS_FILE);

    const response = await submit({ answers: { q1: ['s1'], q2: ['s3'], q3: ['s4'] } });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ending: 'bad' });
  });

  it('responds with 500 when the ratings file cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeRatingsFile('this is not JSON');

    const response = await submit({ answers: { q1: ['s1'] } });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  it.each([
    ['no answers field', {}],
    ['answers that is a list', { answers: [['s1']] }],
    ['answers that is a string', { answers: 's1' }],
    ['an answer that is not a list', { answers: { q1: 's1' } }],
    ['an evidence id that is not a string', { answers: { q1: [1] } }],
    ['an empty evidence id', { answers: { q1: [''] } }],
    ['fields that are not in the spec', { answers: {}, ending: 'good' }],
  ])('rejects a body with %s', async (_label, body) => {
    const response = await submit(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it('rejects a request with no body', async () => {
    const response = await request(app).post('/api/article/answers');

    expect(response.status).toBe(415);
  });

  it('responds with 405 for a method the spec does not allow', async () => {
    const response = await request(app).get('/api/article/answers');

    expect(response.status).toBe(405);
  });
});

// The frontend's mock questions and Journal evidence are written to match these
// ratings, so check the real seed file gives the endings the game expects.
describe('seed/articleRatings.json', () => {
  async function seedEnding(answers: ArticleAnswers) {
    const seed: StoredSubjectRatings[] = JSON.parse(
      await fs.readFile(path.join(__dirname, '../../../../seed/articleRatings.json'), 'utf8')
    );
    return scoreArticle(seed, answers) >= GOOD_ENDING_THRESHOLD ? 'good' : 'bad';
  }

  it('gives the good ending for strong evidence', async () => {
    expect(
      await seedEnding({
        'subject-catnip': ['ev-marshal'],
        'subject-arson': ['ev-cctv'],
        'subject-warnings': ['ev-inspection'],
        'subject-cause': ['ev-marshal', 'ev-foreman'],
      })
    ).toBe('good');
  });

  it('gives the bad ending for weak evidence', async () => {
    expect(
      await seedEnding({
        'subject-catnip': ['ev-forum'],
        'subject-arson': ['ev-neighbor'],
        'subject-warnings': ['ev-weather'],
        'subject-cause': ['ev-forum', 'ev-neighbor'],
      })
    ).toBe('bad');
  });
});
