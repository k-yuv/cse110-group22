import type { Request, Response } from 'express';
import * as questionsService from './questions.service';

// Controllers pull data out of the request, call the service, and choose the
// HTTP status and response body. No file access or business rules belong here.
//
// By the time a controller runs, the OpenAPI validator has already checked the
// request against openapi.yaml, so both params are positive integers. If the
// service throws, Express sends the error to middleware/errorHandler.ts.

export async function getQuestion(req: Request, res: Response) {
  const chapter = Number(req.params.chapter);
  const number = Number(req.params.number);

  const question = await questionsService.getQuestion(chapter, number);

  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  res.status(200).json(question);
}
