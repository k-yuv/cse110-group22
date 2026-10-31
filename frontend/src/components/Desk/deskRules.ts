import type { ActivityId } from '../../services/progress';

export interface DeskItemState {
  done: boolean;
  locked: boolean;
}

export interface DeskState {
  activities: Record<ActivityId, DeskItemState>;
  createArticleLocked: boolean;
}

// The main activities unlock in story order: each one needs the one before it
// done. Minigames are side activities and are always open.
export const STORY_ORDER: ActivityId[] = ['articles', 'social', 'interviews'];

function isUnlocked(id: ActivityId, completed: readonly ActivityId[]) {
  const index = STORY_ORDER.indexOf(id);
  return index <= 0 || completed.includes(STORY_ORDER[index - 1]);
}

export function getDeskState(completed: readonly ActivityId[]): DeskState {
  const itemState = (id: ActivityId): DeskItemState => ({
    done: completed.includes(id),
    locked: !isUnlocked(id, completed),
  });

  return {
    activities: {
      articles: itemState('articles'),
      social: itemState('social'),
      interviews: itemState('interviews'),
      aiMinigame: itemState('aiMinigame'),
      deskMinigame: itemState('deskMinigame'),
    },
    createArticleLocked: !completed.includes(STORY_ORDER[STORY_ORDER.length - 1]),
  };
}
