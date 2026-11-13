import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAiImages, submitAiAnswer } from '../aiImage';

const fetchMock = vi.fn();

function respond(body: unknown, ok = true) {
  fetchMock.mockResolvedValueOnce({ ok, json: async () => body });
}

describe('aiImage service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  describe('getAiImages', () => {
    it('gets the images from the backend', async () => {
      const images = [{ id: 'img-1', src: '/api/images/1.png', alt: 'one' }];
      respond(images);

      expect(await getAiImages()).toEqual(images);
      expect(fetchMock).toHaveBeenCalledWith('/api/ai-images');
    });

    it('throws when the backend responds with an error', async () => {
      respond({ error: 'Internal server error' }, false);

      await expect(getAiImages()).rejects.toThrow();
    });
  });

  describe('submitAiAnswer', () => {
    it('posts the guess for one image and returns whether it was right', async () => {
      respond({ correct: true });

      expect(await submitAiAnswer('img-1', false)).toEqual({ correct: true });
      expect(fetchMock).toHaveBeenCalledWith('/api/ai-images/img-1/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAi: false }),
      });
    });

    it('escapes the id in the URL', async () => {
      respond({ correct: false });

      await submitAiAnswer('a/b c', true);

      expect(fetchMock.mock.calls[0][0]).toBe('/api/ai-images/a%2Fb%20c/answers');
    });

    it('throws when the backend responds with an error', async () => {
      respond({ error: 'Image not found' }, false);

      await expect(submitAiAnswer('nope', true)).rejects.toThrow();
    });
  });
});
