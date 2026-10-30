import type { Request, Response } from 'express';
import * as notesService from './notes.service';

// Controllers pull data out of the request, call the service, and choose the
// HTTP status and response body. No file access or business rules belong here.
//
// By the time a controller runs, the OpenAPI validator has already checked the
// request against openapi.yaml, so req.body has the documented shape. If the
// service throws, Express sends the error to middleware/errorHandler.ts.

export async function getNotes(req: Request, res: Response) {
  const notes = await notesService.getAllNotes();
  res.status(200).json(notes);
}

export async function createNote(req: Request, res: Response) {
  const note = await notesService.createNote(req.body.title);
  res.status(201).json(note);
}
