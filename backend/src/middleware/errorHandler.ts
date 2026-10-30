import type { ErrorRequestHandler } from 'express';

// Turns every error into a JSON response. Errors arrive here from:
//   - express.json(), for malformed JSON bodies (400)
//   - the OpenAPI validator, for requests that break openapi.yaml (400, 404,
//     405, 415) and for responses that break it (500)
//   - controllers, whose thrown errors and rejected promises Express 5
//     forwards here automatically (500)
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {

  // Excluded from coverage: only reachable if a response was already partly
  // sent before the error, which is out of scope for our expectations.
  /* v8 ignore start -- @preserve */
  if (res.headersSent) {
    next(error);
    return;
  }
  /* v8 ignore stop -- @preserve */

  const status: number = typeof error?.status === 'number' ? error.status : 500;

  // 4xx: the client's mistake, so tell them what was wrong.
  if (status < 500) {
    res.status(status).json({ error: error.message });
    return;
  }

  // 5xx: our bug. Log the details, but don't send them to the client.
  console.error('Unhandled error:', error);
  res.status(status).json({ error: 'Internal server error' });
};
