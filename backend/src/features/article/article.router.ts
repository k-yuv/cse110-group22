import { Router } from 'express';
import * as articleController from './article.controller';

// Maps URLs under /api/article (see app.ts) to controller functions.
const router = Router();

router.post('/answers', articleController.submitAnswers);

export default router;
