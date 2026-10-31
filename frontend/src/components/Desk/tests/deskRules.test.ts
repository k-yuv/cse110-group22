import { describe, it, expect } from 'vitest';
import { getDeskState } from '../deskRules';

describe('getDeskState', () => {
  it('only opens Online Articles and the minigames with no progress', () => {
    const { activities, createArticleLocked } = getDeskState([]);

    expect(activities.articles).toMatchObject({ done: false, locked: false });
    expect(activities.social).toMatchObject({ done: false, locked: true });
    expect(activities.interviews).toMatchObject({ done: false, locked: true });
    expect(activities.aiMinigame).toMatchObject({ done: false, locked: false });
    expect(activities.deskMinigame).toMatchObject({ done: false, locked: false });
    expect(createArticleLocked).toBe(true);
  });

  it('unlocks each activity once the one before it is done', () => {
    const afterArticles = getDeskState(['articles']);
    expect(afterArticles.activities.articles).toMatchObject({ done: true, locked: false });
    expect(afterArticles.activities.social.locked).toBe(false);
    expect(afterArticles.activities.interviews.locked).toBe(true);
    expect(afterArticles.createArticleLocked).toBe(true);

    const afterSocial = getDeskState(['articles', 'social']);
    expect(afterSocial.activities.interviews.locked).toBe(false);
    expect(afterSocial.createArticleLocked).toBe(true);
  });

  it('unlocks Create Article once Interviews is done', () => {
    const { activities, createArticleLocked } = getDeskState(['articles', 'social', 'interviews']);

    expect(activities.interviews).toMatchObject({ done: true, locked: false });
    expect(createArticleLocked).toBe(false);
  });

  it('marks minigames done without unlocking anything else', () => {
    const { activities, createArticleLocked } = getDeskState(['aiMinigame', 'deskMinigame']);

    expect(activities.aiMinigame.done).toBe(true);
    expect(activities.deskMinigame.done).toBe(true);
    expect(activities.social.locked).toBe(true);
    expect(createArticleLocked).toBe(true);
  });
});
