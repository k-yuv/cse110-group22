import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import app from '../../../app';
import type { Note } from '../../../app';

// During tests, notes are saved to backend/data/test/notes.json
// (DATA_DIR is set in vitest.config.mts). Each test starts with an empty file.
const NOTES_FILE = path.join(process.env.DATA_DIR!, 'notes.json');

async function readNotesFile(): Promise<Note[]> {
  return JSON.parse(await fs.readFile(NOTES_FILE, 'utf8'));
}

async function writeNotesFile(contents: string) {
  await fs.mkdir(path.dirname(NOTES_FILE), { recursive: true });
  await fs.writeFile(NOTES_FILE, contents);
}

describe('Notes API', () => {
  beforeEach(async () => {
    await writeNotesFile('[]');
  });

  it('returns the notes saved in the file', async () => {
    const saved: Note[] = [
      { id: crypto.randomUUID(), title: 'First', created_at: '2026-01-01T00:00:00.000Z' },
      { id: crypto.randomUUID(), title: 'Second', created_at: '2026-01-02T00:00:00.000Z' },
    ];
    await writeNotesFile(JSON.stringify(saved));

    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(saved);
  });

  it('returns an empty list when the notes file does not exist yet', async () => {
    await fs.rm(NOTES_FILE);

    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('creates a note and saves it to the file', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'Buy milk' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      title: 'Buy milk',
      created_at: expect.any(String),
    });

    expect(await readNotesFile()).toEqual([response.body]);
  });

  it('adds new notes after the existing ones', async () => {
    await request(app).post('/api/notes').send({ title: 'First' });
    await request(app).post('/api/notes').send({ title: 'Second' });

    const notes = await readNotesFile();
    expect(notes.map((note) => note.title)).toEqual(['First', 'Second']);
  });

  it('trims whitespace from the title', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: '  padded  ' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('padded');
    expect((await readNotesFile())[0].title).toBe('padded');
  });

  it('rejects an empty title', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/title/);
    expect(await readNotesFile()).toEqual([]);
  });

  it('rejects a title over 200 characters', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'x'.repeat(201) });

    expect(response.status).toBe(400);
    expect(await readNotesFile()).toEqual([]);
  });

  it('accepts a title of exactly 200 characters', async () => {
    const title = 'x'.repeat(200);

    const response = await request(app)
      .post('/api/notes')
      .send({ title });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(title);
  });

  it.each([
    ['a number', 123],
    ['null', null],
    ['an array', ['array']],
    ['an object', { text: 'object' }],
  ])('rejects a title that is %s', async (_label, title) => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'request/body/title must be string' });
  });

  it('rejects a body with no title', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/title/);
  });

  it('rejects fields that are not in the spec', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'Buy milk', id: 'my-own-id' });

    expect(response.status).toBe(400);
    expect(await readNotesFile()).toEqual([]);
  });

  it('rejects a request with no body', async () => {
    const response = await request(app).post('/api/notes');

    expect(response.status).toBe(415);
  });

  it('rejects malformed JSON with a JSON error', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it('responds with 500 when the notes file cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeNotesFile('this is not JSON');

    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  it('responds with 500 instead of sending notes that break the spec', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeNotesFile(JSON.stringify([{ id: 'not-a-uuid', title: 'Bad' }]));

    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  it('responds with 500 when creating a note and the notes file cannot be read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await writeNotesFile('this is not JSON');

    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'Buy milk' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  it('responds with 405 for a method the spec does not allow', async () => {
    const response = await request(app).delete('/api/notes');

    expect(response.status).toBe(405);
  });

  it('responds with JSON 404 for unknown routes', async () => {
    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'not found' });
  });
});
