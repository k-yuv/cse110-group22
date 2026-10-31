import { describe, it, expect, beforeEach } from 'vitest';
import { completeActivity, getProgress, resetProgress } from '../progress';

describe('progress service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resetProgress clears everything', async () => {
    await completeActivity('articles');
    await completeActivity('aiMinigame');

    expect(await resetProgress()).toEqual([]);
    expect(await getProgress()).toEqual([]);
  });
});
