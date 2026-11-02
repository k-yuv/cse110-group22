import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import app from '../../../app';
import type { StoredQuestion } from '../../../app';

// During tests, questions are read from backend/data/test/questions.json
// (DATA_DIR is set in vitest.config.mts). Each test starts with the questions below.
const QUESTIONS_FILE = path.join(process.env.DATA_DIR!, 'questions.json');

const SAVED: StoredQuestion[] = [
  { chapter: 1, number: 1, content: 'what is 2 + 2?', choices: ['3', '4', '5', '22'], correctChoice: 1 },
  { chapter: 1, number: 2, content: 'what is 3 + 3?', choices: ['9', '33', '0', '6'], correctChoice: 3 },
];

async function writeQuestionsFile(contents: string) {
  await fs.mkdir(path.dirname(QUESTIONS_FILE), { recursive: true });
  await fs.writeFile(QUESTIONS_FILE, contents);
}

describe('Answers API', () => {
  beforeEach(async () => {
    await writeQuestionsFile(JSON.stringify(SAVED));
  });

  it('says the correct choice is correct', async () => {
    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({ choice: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ correct: true });
  });

  it.each([0, 2, 3])('says choice %i is not correct', async (choice) => {
    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({ choice });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ correct: false });
  });

  it('checks against the right question', async () => {
    const wrong = await request(app)
      .post('/api/chapters/1/questions/2/answers')
      .send({ choice: 1 });
    const right = await request(app)
      .post('/api/chapters/1/questions/2/answers')
      .send({ choice: 3 });

    expect(wrong.body).toEqual({ correct: false });
    expect(right.body).toEqual({ correct: true });
  });

  it('does not change the questions file', async () => {
    await request(app).post('/api/chapters/1/questions/1/answers').send({ choice: 1 });

    expect(JSON.parse(await fs.readFile(QUESTIONS_FILE, 'utf8'))).toEqual(SAVED);
  });

  it('responds with 404 when the question does not exist', async () => {
    const response = await request(app)
      .post('/api/chapters/9/questions/9/answers')
      .send({ choice: 0 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Question not found' });
  });

  it('responds with 404 when the questions file does not exist yet', async () => {
    await fs.rm(QUESTIONS_FILE);

    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({ choice: 0 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Question not found' });
  });

  it.each([
    ['a word', 'abc', '1'],
    ['a decimal', '1.5', '1'],
    ['zero', '1', '0'],
    ['negative', '-1', '1'],
  ])('rejects a parameter that is %s', async (_label, chapter, number) => {
    const response = await request(app)
      .post(`/api/chapters/${chapter}/questions/${number}/answers`)
      .send({ choice: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it.each([
    ['below 0', -1],
    ['above 3', 4],
    ['a decimal', 1.5],
  ])('rejects a choice that is %s', async (_label, choice) => {
    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({ choice });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/choice/);
  });

  it.each([
    ['a string', '1'],
    ['null', null],
    ['an array', [1]],
    ['an object', { value: 1 }],
  ])('rejects a choice that is %s', async (_label, choice) => {
    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({ choice });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'request/body/choice must be integer' });
  });

  it('rejects a body with no choice', async () => {
    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/choice/);
  });

  it('rejects fields that are not in the spec', async () => {
    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({ choice: 1, correct: true });

    expect(response.status).toBe(400);
  });

  it('rejects a request with no body', async () => {
    const response = await request(app).post('/api/chapters/1/questions/1/answers');

    expect(response.status).toBe(415);
  });

  it('responds with 405 for a method the spec does not allow', async () => {
    const response = await request(app).get('/api/chapters/1/questions/1/answers');

    expect(response.status).toBe(405);
  });

  it('responds with 500 when the questions file cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeQuestionsFile('this is not JSON');

    const response = await request(app)
      .post('/api/chapters/1/questions/1/answers')
      .send({ choice: 0 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
