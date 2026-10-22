import pool from '../../config/database';
import type { Note } from '../../app';
import { ValidationError } from '../../utils/errors';

// Services hold the business rules and talk to the database. They know nothing
// about HTTP: they return data or throw, and the controller decides the status.

const MAX_TITLE_LENGTH = 200;

export async function getAllNotes(): Promise<Note[]> {
  const result = await pool.query<Note>(
    'SELECT id, title, created_at FROM notes ORDER BY id'
  );

  return result.rows;
}

export async function createNote(title: unknown): Promise<Note> {
  if (typeof title !== 'string' || !title.trim() || title.length > MAX_TITLE_LENGTH) {
    throw new ValidationError('Invalid note title');
  }

  const result = await pool.query<Note>(
    'INSERT INTO notes (title) VALUES ($1) RETURNING id, title, created_at',
    [title.trim()]
  );

  return result.rows[0];
}
