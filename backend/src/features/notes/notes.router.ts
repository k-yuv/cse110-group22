import { Router } from 'express';
import * as notesController from './notes.controller';

// Maps URLs under /api/notes (see app.ts) to controller functions.
const router = Router();

router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);

export default router;
