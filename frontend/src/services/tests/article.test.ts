import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getArticleSubjects, submitArticle } from '../article';

const fetchMock = vi.fn();

describe('article service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  describe('submitArticle', () => {
    it('posts every answer at once and returns the ending', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ending: 'good' }) });
      const answers = { 'subject-cause': ['ev-marshal', 'ev-foreman'], 'subject-arson': ['ev-cctv'] };

      expect(await submitArticle(answers)).toEqual({ ending: 'good' });
      expect(fetchMock).toHaveBeenCalledWith('/api/article/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
    });

    it('throws when the backend responds with an error', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Internal server error' }) });

      await expect(submitArticle({})).rejects.toThrow();
    });
  });

  describe('getArticleSubjects (mock)', () => {
    it('returns questions with an id, prompt, and required count, without calling the backend', async () => {
      const subjects = await getArticleSubjects('level-1');

      expect(subjects.length).toBeGreaterThan(0);
      for (const subject of subjects) {
        expect(subject).toEqual({
          id: expect.any(String),
          prompt: expect.any(String),
          requiredCount: expect.any(Number),
        });
      }
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
