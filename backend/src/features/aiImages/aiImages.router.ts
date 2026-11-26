import { Router } from 'express';
import * as aiImagesController from './aiImages.controller';

// Maps URLs under /api/ai-images (see app.ts) to controller functions.
const router = Router();

router.get('/', aiImagesController.getImages);
router.post('/:id/answers', aiImagesController.submitAnswer);

export default router;
