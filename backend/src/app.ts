import express from 'express';
import cors from 'cors';
import notesRouter from './features/notes/notes.router';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

// ---------------------------------------------------------------
// Types shared across features. Import them with `import type`, e.g.
//   import type { Note } from '../../app';
// ---------------------------------------------------------------

// Matches the columns of the notes table (database/migrations/001_create_notes.js).
export interface Note {
  id: string;
  title: string;
  created_at: Date;
}

const app = express();

// Claude generated this section of code that handles CORS
// ---------------------------------------------------------------
// FRONTEND_URL is a comma-separated list of allowed origins. An entry may use
// * as a wildcard so Vercel preview URLs (which change every deploy) match,
// e.g. https://cse110-group22-frontend-*.vercel.app
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => new RegExp(
    '^' + entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$'
  ));

app.use(cors({
  origin: (origin, callback) => {
    // Requests with no Origin header (curl, server-to-server) aren't CORS.
    const allowed = !origin || allowedOrigins.some((pattern) => pattern.test(origin));
    callback(null, allowed);
  },
}));

// ---------------------------------------------------------------

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Feature routers. Each one handles every URL under its prefix.
app.use('/api/notes', notesRouter);

// These two must stay last: they only run when nothing above handled the request.
app.use(notFound);
app.use(errorHandler);

export default app;
