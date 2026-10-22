export interface Note {
  id: string;
  title: string;
  created_at: string;
}

// Comes from .env.development locally. Production builds fail in
// vite.config.ts if it is missing, so the fallback only applies in tests.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function getNotes(): Promise<Note[]> {
  const response = await fetch(`${API_URL}/api/notes`);

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  return response.json();
}

export async function createNote(title: string): Promise<Note> {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  return response.json();
}
