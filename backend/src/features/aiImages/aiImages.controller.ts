import type { Request, Response } from 'express';
import type { AnswerResult } from '../../app';
import * as aiImagesService from './aiImages.service';

// Controllers pull data out of the request, call the service, and choose the
// HTTP status and response body. No file access or business rules belong here.
//
// By the time a controller runs, the OpenAPI validator has already checked the
// request against openapi.yaml, so `isAi` is a boolean. If the service throws,
// Express sends the error to middleware/errorHandler.ts.

export async function getImages(req: Request, res: Response) {
  const images = await aiImagesService.getImages();
  res.status(200).json(images);
}

export async function submitAnswer(req: Request, res: Response) {
  const correct = await aiImagesService.checkAnswer(String(req.params.id), req.body.isAi);

  if (correct === null) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  const result: AnswerResult = { correct };
  res.status(200).json(result);
}
