export interface Evidence {
  id: string;
  toolName: string;
  toolDescription: string;
  iconPath: string;
}

// Mock until the backend has a journal route: evidence is saved in
// localStorage so it survives a page reload. Only the three exported functions
// change when the route exists.
export const STORAGE_KEY = 'journal';

function isEvidence(value: unknown): value is Evidence {
  const evidence = value as Evidence | null;
  return (
    typeof evidence?.id === 'string' &&
    typeof evidence.toolName === 'string' &&
    typeof evidence.toolDescription === 'string' &&
    typeof evidence.iconPath === 'string'
  );
}

function readSaved(): Evidence[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter(isEvidence) : [];
  } catch {
    return [];
  }
}

export async function getEvidence(): Promise<Evidence[]> {
  return readSaved();
}

// Adding an id that's already saved changes nothing.
export async function addEvidence(evidence: Evidence): Promise<Evidence[]> {
  const saved = readSaved();

  if (!saved.some((item) => item.id === evidence.id)) {
    saved.push(evidence);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  return saved;
}

export async function clearEvidence(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
}
