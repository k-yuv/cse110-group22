import type { Request, Response } from 'express';
import type { ArticleResult } from '../../app';
import * as articleService from './article.service';

// Controllers pull data out of the request, call the service, and choose the
// HTTP status and response body. No file access or business rules belong here.
//
// By the time a controller runs, the OpenAPI validator has already checked the
// request against openapi.yaml, so `answers` maps each subject id to a list of
// evidence ids. If the service throws, Express sends the error to
// middleware/errorHandler.ts.

export async function submitAnswers(req: Request, res: Response) {
  const ending = await articleService.scoreAnswers(req.body.answers);

  const result: ArticleResult = { ending };
  res.status(200).json(result);
}
