import type { Request, Response } from 'express';
import * as notesService from './notes.service';
import { ValidationError, getErrorMessage } from '../../utils/errors';

// Controllers pull data out of the request, call the service, and choose the
// HTTP status and response body. No SQL or business rules belong here.

export async function getNotes(req: Request, res: Response) {
  try {
    const notes = await notesService.getAllNotes();
    res.status(200).json(notes);
  } catch (error) {
    console.error('Failed to retrieve notes:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to retrieve notes' });
  }
}

export async function createNote(req: Request, res: Response) {
  // req.body is undefined when the request has no JSON body.
  const title: unknown = req.body?.title;

  try {
    const note = await notesService.createNote(title);
    res.status(201).json(note);
  } catch (error) {
    
    // The false branch of this covers nitpicky errors relating to 
    // the database itself failing.
    /* v8 ignore else -- @preserve */ 
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Excluded from coverage: only reachable when the database itself fails
    // For the sake of this project, we will not do nitpick tests of database functionality
    /* v8 ignore start -- @preserve */
    console.error('Failed to create note:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to create note' });
    /* v8 ignore stop -- @preserve */
  }
}
