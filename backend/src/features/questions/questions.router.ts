import { Router } from 'express';
import * as questionsController from './questions.controller';

// Maps URLs under /api/chapters/:chapter/questions (see app.ts) to controller
// functions. mergeParams lets handlers read :chapter from that parent path.
const router = Router({ mergeParams: true });

router.get('/:number', questionsController.getQuestion);

export default router;
