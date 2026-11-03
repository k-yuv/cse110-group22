import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import app from '../../../app';
import type { StoredQuestion } from '../../../app';

// During tests, questions are read from backend/data/test/questions.json
// (DATA_DIR is set in vitest.config.mts). Each test starts with an empty file.
const QUESTIONS_FILE = path.join(process.env.DATA_DIR!, 'questions.json');

async function writeQuestionsFile(contents: string) {
  await fs.mkdir(path.dirname(QUESTIONS_FILE), { recursive: true });
  await fs.writeFile(QUESTIONS_FILE, contents);
}

describe('Questions API', () => {
  beforeEach(async () => {
    await writeQuestionsFile('[]');
  });

  it('retrieves a question and its choices, without the correct choice', async () => {
    const saved: StoredQuestion[] = [
      { chapter: 1, number: 1, content: 'what is 1 + 1?', choices: ['1', '2', '3', '4'], correctChoice: 1 },
      { chapter: 2, number: 1, content: 'what is 2 + 2?', choices: ['4', '5', '6', '7'], correctChoice: 0 },
      { chapter: 2, number: 2, content: 'what is 3 + 3?', choices: ['3', '4', '5', '6'], correctChoice: 3 },
    ];
    await writeQuestionsFile(JSON.stringify(saved));

    const response = await request(app).get('/api/chapters/2/questions/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      chapter: 2,
      number: 1,
      content: 'what is 2 + 2?',
      choices: ['4', '5', '6', '7'],
    });
  });

  it('responds with 404 when the question does not exist', async () => {
    const response = await request(app).get('/api/chapters/1/questions/1');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Question not found' });
  });

  it('responds with 404 when the questions file does not exist yet', async () => {
    await fs.rm(QUESTIONS_FILE);

    const response = await request(app).get('/api/chapters/1/questions/1');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Question not found' });
  });

  it.each([
    ['a word', 'abc', '1'],
    ['a decimal', '1.5', '1'],
    ['zero', '1', '0'],
    ['negative', '-1', '1'],
  ])('rejects a parameter that is %s', async (_label, chapter, number) => {
    const response = await request(app).get(`/api/chapters/${chapter}/questions/${number}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it('responds with 500 when the questions file cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeQuestionsFile('this is not JSON');

    const response = await request(app).get('/api/chapters/1/questions/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  it.each([
    ['has no content', { chapter: 1, number: 1, choices: ['a', 'b', 'c', 'd'], correctChoice: 0 }],
    ['has no choices', { chapter: 1, number: 1, content: 'q?', correctChoice: 0 }],
    ['has 3 choices', { chapter: 1, number: 1, content: 'q?', choices: ['a', 'b', 'c'], correctChoice: 0 }],
    ['has 5 choices', { chapter: 1, number: 1, content: 'q?', choices: ['a', 'b', 'c', 'd', 'e'], correctChoice: 0 }],
    ['has an empty choice', { chapter: 1, number: 1, content: 'q?', choices: ['a', '', 'c', 'd'], correctChoice: 0 }],
  ])('responds with 500 instead of sending a question that %s', async (_label, saved) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeQuestionsFile(JSON.stringify([saved]));

    const response = await request(app).get('/api/chapters/1/questions/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
