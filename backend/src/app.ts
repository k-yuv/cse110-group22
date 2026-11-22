import path from 'node:path';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import notesRouter from './features/notes/notes.router';
import questionsRouter from './features/questions/questions.router';
import articleRouter from './features/article/article.router';
import { errorHandler } from './middleware/errorHandler';

// ---------------------------------------------------------------
// Types shared across features. Import them with `import type`, e.g.
//   import type { Note } from '../../app';
// ---------------------------------------------------------------

// Matches the Note schema in backend/openapi.yaml.
export interface Note {
  id: string;
  title: string;
  created_at: string;
}

// Matches the Question schema in backend/openapi.yaml.
export interface Question {
  chapter: number;
  number: number;
  content: string;
  // Always exactly 4 answer choices. A choice is referred to by its position (0-3).
  choices: string[];
}

// How a question is saved in backend/data/questions.json. The correct choice
// is never sent to the client, so it isn't part of the Question schema.
export interface StoredQuestion extends Question {
  // Position (0-3) in `choices` of the correct answer.
  correctChoice: number;
}

// Matches the AnswerResult schema in backend/openapi.yaml.
export interface AnswerResult {
  correct: boolean;
}

// How useful one piece of evidence is for answering one article question.
export type EvidenceRating = 'strong' | 'weak' | 'irrelevant';

// How one question's ratings are saved in backend/data/articleRatings.json.
// Ratings are never sent to the client.
export interface StoredSubjectRatings {
  // The question (subject) these ratings are for, e.g. "subject-ingredient".
  subjectId: string;
  // Evidence id → its rating for this question. A missing id counts as irrelevant.
  ratings: Record<string, EvidenceRating>;
}

// Matches the ArticleAnswers schema in backend/openapi.yaml:
// subject id → the evidence ids the player picked for it.
export type ArticleAnswers = Record<string, string[]>;

// Matches the ArticleResult schema in backend/openapi.yaml.
export interface ArticleResult {
  ending: 'good' | 'bad';
}

const app = express();

app.use(express.json());

// Checks every request and response against backend/openapi.yaml. Bad
// requests are rejected with a 4xx before they reach a controller, routes
// missing from the spec respond 404, and a response that doesn't match its
// schema becomes a 500.
app.use(OpenApiValidator.middleware({
  apiSpec: path.join(__dirname, '../openapi.yaml'),
  validateRequests: true,
  validateResponses: true,
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Feature routers. Each one handles every URL under its prefix.
app.use('/api/notes', notesRouter);
app.use('/api/chapters/:chapter/questions', questionsRouter);
app.use('/api/article', articleRouter);

// Must stay last: it only runs when something above passed along an error.
app.use(errorHandler);

export default app;
