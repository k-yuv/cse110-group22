import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import pool from '../../../config/database';

describe('Notes API', () => {
  beforeEach(async () => {
    // Remove only records owned by this test suite.
    await pool.query(
      "DELETE FROM notes WHERE title LIKE 'vitest:%'"
    );
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM notes WHERE title LIKE 'vitest:%'"
    );
  });

  it('creates a note and retrieves it from the database', async () => {
    const createResponse = await request(app)
      .post('/api/notes')
      .send({ title: 'vitest: integration test' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe(
      'vitest: integration test'
    );

    const listResponse = await request(app)
      .get('/api/notes');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createResponse.body.id,
          title: 'vitest: integration test',
        }),
      ])
    );
  });

  it('trims whitespace from the title', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: '  vitest: padded  ' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('vitest: padded');
  });

  it('rejects an empty title', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid note title' });
  });

  it('rejects a title over 200 characters', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'vitest:' + 'x'.repeat(200) });

    expect(response.status).toBe(400);
  });

  it('accepts a title of exactly 200 characters', async () => {
    const title = 'vitest:' + 'x'.repeat(193);

    const response = await request(app)
      .post('/api/notes')
      .send({ title });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(title);
  });

  it.each([
    ['a number', 123],
    ['null', null],
    ['an array', ['vitest: array']],
    ['an object', { text: 'vitest: object' }],
  ])('rejects a title that is %s', async (_label, title) => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid note title' });
  });

  it('rejects a request with no body', async () => {
    const response = await request(app).post('/api/notes');

    expect(response.status).toBe(400);
  });

  it('rejects malformed JSON with a JSON error', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid request' });
  });

  it('responds with 500 when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('database down') as never);

    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to retrieve notes' });
  });

  it('responds with JSON 404 for unknown routes', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not found' });
  });
});
