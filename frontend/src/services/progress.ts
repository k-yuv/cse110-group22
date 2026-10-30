export const ACTIVITY_IDS = ['articles', 'social', 'interviews', 'aiMinigame', 'deskMinigame'] as const;

export type ActivityId = (typeof ACTIVITY_IDS)[number];

// Mock until the backend has a progress route: progress is saved in
// localStorage so it survives a page reload. 
export const STORAGE_KEY = 'progress';

function isActivityId(value: unknown): value is ActivityId {
  return ACTIVITY_IDS.includes(value as ActivityId);
}

function readCompleted(): ActivityId[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter(isActivityId) : [];
  } catch {
    return [];
  }
}

export async function getProgress(): Promise<ActivityId[]> {
  return readCompleted();
}

export async function completeActivity(id: ActivityId): Promise<ActivityId[]> {
  const completed = readCompleted();

  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }

  return completed;
}
