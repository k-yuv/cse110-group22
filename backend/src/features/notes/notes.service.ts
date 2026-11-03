import { randomUUID } from 'node:crypto';
import type { Note } from '../../app';
import { readJson, writeJson } from '../../utils/jsonStore';

// Services hold the business rules and read/write the data files. They know
// nothing about HTTP: they return data or throw, and the controller decides the status.
// Input shape (types, required fields, length limits) is checked by openapi.yaml
// before a request gets here.

const NOTES_FILE = 'notes.json';

export async function getAllNotes(): Promise<Note[]> {
  return readJson<Note[]>(NOTES_FILE, []);
}

export async function createNote(title: string): Promise<Note> {
  const notes = await getAllNotes();

  const note: Note = {
    id: randomUUID(),
    title: title.trim(),
    created_at: new Date().toISOString(),
  };

  notes.push(note);
  await writeJson(NOTES_FILE, notes);

  return note;
}
