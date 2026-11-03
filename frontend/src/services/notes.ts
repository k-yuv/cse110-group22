export interface Note {
  id: string;
  title: string;
  created_at: string;
}

export async function getNotes(): Promise<Note[]> {
  const response = await fetch('/api/notes');

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  return response.json();
}

export async function createNote(title: string): Promise<Note> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  return response.json();
}
