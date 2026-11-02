import path from 'node:path';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import notesRouter from './features/notes/notes.router';
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

// Must stay last: it only runs when something above passed along an error.
app.use(errorHandler);

export default app;
