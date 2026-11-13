import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import app from '../../../app';
import type { StoredAiImage } from '../../../app';
import { IMAGES_DIR } from '../../../utils/images';

// During tests, the image list is read from backend/data/test/aiImages.json
// (DATA_DIR is set in vitest.config.mts). Each test starts with the images below.
// The picture files themselves are read-only, so they come from the real
// backend/data/images/ folder.
const AI_IMAGES_FILE = path.join(process.env.DATA_DIR!, 'aiImages.json');

const SAVED: StoredAiImage[] = [
  { id: 'img-1', fileName: 'placeholder-1.svg', alt: 'first', isAi: true },
  { id: 'img-2', fileName: 'placeholder-2.svg', alt: 'second', isAi: false },
];

async function writeAiImagesFile(contents: string) {
  await fs.mkdir(path.dirname(AI_IMAGES_FILE), { recursive: true });
  await fs.writeFile(AI_IMAGES_FILE, contents);
}

describe('AI Images API', () => {
  beforeEach(async () => {
    await writeAiImagesFile(JSON.stringify(SAVED));
  });

  describe('GET /api/ai-images', () => {
    it('lists every image in order, without the answer', async () => {
      const response = await request(app).get('/api/ai-images');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 'img-1', src: '/api/images/placeholder-1.svg', alt: 'first' },
        { id: 'img-2', src: '/api/images/placeholder-2.svg', alt: 'second' },
      ]);
    });

    it('escapes file names in the src URL', async () => {
      await writeAiImagesFile(JSON.stringify([
        { id: 'x', fileName: 'my cat #1.png', alt: '', isAi: false },
      ]));

      const response = await request(app).get('/api/ai-images');

      expect(response.body[0].src).toBe('/api/images/my%20cat%20%231.png');
    });

    it('responds with an empty list when the file does not exist yet', async () => {
      await fs.rm(AI_IMAGES_FILE);

      const response = await request(app).get('/api/ai-images');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('responds with 500 when the file cannot be read', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      await writeAiImagesFile('this is not JSON');

      const response = await request(app).get('/api/ai-images');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('every src works', () => {
    it('serves the picture file each listed image points to', async () => {
      const list = await request(app).get('/api/ai-images');

      for (const image of list.body) {
        const response = await request(app).get(image.src);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toMatch(/^image\//);
      }
    });

    it('every image in the seed file has a picture file', async () => {
      const seed: StoredAiImage[] = JSON.parse(
        await fs.readFile(path.join(__dirname, '../../../../seed/aiImages.json'), 'utf8'),
      );

      expect(seed.length).toBeGreaterThan(0);
      for (const image of seed) {
        await expect(fs.access(path.join(IMAGES_DIR, image.fileName))).resolves.toBeUndefined();
      }
    });

    it('responds with 404 for a picture file that does not exist', async () => {
      const response = await request(app).get('/api/images/nope.png');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/ai-images/:id/answers', () => {
    it.each([
      ['img-1', true, true],
      ['img-1', false, false],
      ['img-2', false, true],
      ['img-2', true, false],
    ])('for %s, guessing isAi=%s is correct=%s', async (id, isAi, correct) => {
      const response = await request(app)
        .post(`/api/ai-images/${id}/answers`)
        .send({ isAi });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ correct });
    });

    it('does not change the images file', async () => {
      await request(app).post('/api/ai-images/img-1/answers').send({ isAi: true });

      expect(JSON.parse(await fs.readFile(AI_IMAGES_FILE, 'utf8'))).toEqual(SAVED);
    });

    it('responds with 404 when the image does not exist', async () => {
      const response = await request(app)
        .post('/api/ai-images/img-99/answers')
        .send({ isAi: true });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Image not found' });
    });

    it('responds with 404 when the images file does not exist yet', async () => {
      await fs.rm(AI_IMAGES_FILE);

      const response = await request(app)
        .post('/api/ai-images/img-1/answers')
        .send({ isAi: true });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Image not found' });
    });

    it.each([
      ['a string', 'true'],
      ['a number', 1],
      ['null', null],
    ])('rejects isAi that is %s', async (_label, isAi) => {
      const response = await request(app)
        .post('/api/ai-images/img-1/answers')
        .send({ isAi });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/isAi/);
    });

    it('rejects a body with no isAi', async () => {
      const response = await request(app)
        .post('/api/ai-images/img-1/answers')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/isAi/);
    });

    it('rejects fields that are not in the spec', async () => {
      const response = await request(app)
        .post('/api/ai-images/img-1/answers')
        .send({ isAi: true, correct: true });

      expect(response.status).toBe(400);
    });

    it('rejects a request with no body', async () => {
      const response = await request(app).post('/api/ai-images/img-1/answers');

      expect(response.status).toBe(415);
    });

    it('responds with 405 for a method the spec does not allow', async () => {
      const response = await request(app).get('/api/ai-images/img-1/answers');

      expect(response.status).toBe(405);
    });

    it('responds with 500 when the images file cannot be read', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      await writeAiImagesFile('this is not JSON');

      const response = await request(app)
        .post('/api/ai-images/img-1/answers')
        .send({ isAi: true });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
