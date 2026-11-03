import { describe, it, expect, beforeEach } from 'vitest';
import { completeActivity, getProgress, resetProgress, STORAGE_KEY } from '../progress';

describe('progress service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completeActivity saves each activity only once', async () => {
    await completeActivity('articles');

    expect(await completeActivity('articles')).toEqual(['articles']);
    expect(await getProgress()).toEqual(['articles']);
  });

  it('ignores saved progress that is not a list of activities', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ articles: true }));
    expect(await getProgress()).toEqual([]);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(['articles', 'notAnActivity']));
    expect(await getProgress()).toEqual(['articles']);
  });

  it('resetProgress clears everything', async () => {
    await completeActivity('articles');
    await completeActivity('aiMinigame');

    expect(await resetProgress()).toEqual([]);
    expect(await getProgress()).toEqual([]);
  });
});
