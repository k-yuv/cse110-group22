# File Structure Guide

How code is organized on the [frontend](#frontend-components) and the [backend](#backend-features). Both sides split each feature into layers with one job each, and **Notes** is the working example of both. When in doubt, copy the Notes files and rename them.

## Frontend Components

Each component in `frontend/src/components/` is split into three layers. Each layer has one job, so when you need to change something you know which file to open.

```
frontend/src/
├── services/
│   └── notes.ts             ← talks to the backend API
└── components/
    └── Notes/
        ├── tests/
        │   └── notes.test.tsx
        ├── notesModel.tsx   ← state and logic
        └── notesView.tsx    ← what the user sees
```

The files depend on each other in one direction only:

```
notesView.tsx  →  notesModel.tsx  →  services/notes.ts  →  backend
```

The view calls the model, and the model calls the service. Never the other way round.

### Service (`services/<name>.ts`)

Functions that send requests to the backend and return the data, e.g. `getNotes()` and `createNote(title)`.

- **Goes here:** `fetch` calls, API URLs, converting responses to TypeScript types.
- **Does not go here:** React code of any kind (`useState`, JSX, and so on).

### Model (`<name>Model.tsx`)

A custom hook, e.g. `useNotesModel()`, that holds the component's state and does its work.

- **Goes here:**
  - `useState`
  - `useEffect`
  - `useContext` (shared app state)
  - calls to service functions
  - event handlers that change state (e.g. what happens when a form is submitted)
- **Does not go here:** JSX or anything visual.
- **Returns:** an object with everything the view needs. Name the functions after what the user did, not how the state is stored:

```ts
return {
  notes,
  title,
  error,
  loading,
  onTitleChange: setTitle,   // the view doesn't need to know this is a useState setter
  onSubmit: handleSubmit,
};
```

### View (`<name>View.tsx`)

The component itself. It calls the model hook, then renders JSX using what the hook returned.

```tsx
export default function Notes() {
  const { notes, title, error, loading, onTitleChange, onSubmit } = useNotesModel();
  // ...return JSX
}
```

- **Goes here:** JSX, layout, styling, conditional rendering (`if (loading) ...`), wiring inputs to the model's handlers.
- **Does not go here:** `useState`, `useEffect`, or service calls. If you're about to add one of these, add it to the model and return it from the hook instead.
- Destructure by name (`const { notes } = ...`), not by position (`const [notes] = ...`), so reordering the hook's return can't silently break the view.
- This file has the default export, so other files import the component from here:

```tsx
import Notes from './components/Notes/notesView';
```

### Tests (`tests/<name>.test.tsx`)

Test the component as a whole: render the view and interact with it the way a user would. Mock only the service, so tests never hit the real backend.

```tsx
vi.mock('../../../services/notes', () => ({
  getNotes: vi.fn(),
  createNote: vi.fn(),
}));
```

Cover at least:

- the normal ("happy") path, e.g. data loads and the user can add an item
- the loading state
- each error the model can show (load failure, create failure, and so on)

Find elements by what the user sees (`getByText`, `getByLabelText`, `getByRole`), not by CSS classes or IDs.

Run the tests with `npm test` from the `frontend/` folder.

### Adding a new component

1. Create `components/<Name>/` with `<name>Model.tsx`, `<name>View.tsx`, and `tests/<name>.test.tsx`.
2. If it needs backend data, add the API functions to `services/<name>.ts` (or to an existing service).
3. Write the hook in the model: state, effects, service calls, handlers.
4. Write the view: call the hook and render.
5. Write tests that mock the service.
6. Use `components/Notes/` as the reference example.

## Backend Features

The backend is organized **by feature**: everything for one feature (e.g. notes) lives in one folder under `backend/src/features/`. Code shared by every feature lives in `middleware/` and `utils/`.

```
backend/src/
├── app.ts                    ← shared types, CORS, Express setup, registers routers
├── server.ts                 ← starts the server (don't edit)
├── config/
│   └── database.ts           ← the database connection (don't edit)
├── features/
│   └── notes/
│       ├── notes.router.ts       ← which URL goes to which controller function
│       ├── notes.controller.ts   ← reads the request, sends the response
│       ├── notes.service.ts      ← business rules and database queries
│       └── tests/
│           └── notes.test.ts
├── middleware/               ← runs on every request (e.g. 404 and error handling)
├── utils/                    ← small helpers shared by features (e.g. errors.ts)
└── tests/                    ← tests not tied to one feature, plus shared test setup
```

A request passes through the layers in one direction only:

```
request → app.ts → notes.router.ts → notes.controller.ts → notes.service.ts → database
```

For example, `POST /api/notes` with `{ "title": "Buy milk" }`:

1. `app.ts` runs CORS and JSON parsing, then sees the URL starts with `/api/notes` and hands the request to the notes router.
2. `notes.router.ts` sees `POST /` and calls `notesController.createNote`.
3. `notes.controller.ts` takes `title` out of the request body and calls `notesService.createNote(title)`.
4. `notes.service.ts` checks the title is valid, inserts it into the database, and returns the new note.
5. The controller sends the note back with status `201 Created`. If the service threw a `ValidationError`, it sends `400 Bad Request` instead.

### `app.ts`

Sets up the whole app. Feature authors only touch it for two things:

- **Shared types.** Add an `interface` for each table or object that more than one file uses, and `export` it:

  ```ts
  // Matches the columns of the notes table (database/migrations/001_create_notes.js).
  export interface Note {
    id: string;
    title: string;
    created_at: Date;
  }
  ```

  Import it elsewhere with `import type`, which avoids a circular import with `app.ts`:

  ```ts
  import type { Note } from '../../app';
  ```

- **Registering your router.** Import it and add one `app.use` line next to the existing ones, above `notFound` and `errorHandler` (those two must stay last):

  ```ts
  import notesRouter from './features/notes/notes.router';
  // ...
  app.use('/api/notes', notesRouter);
  ```

Ask the group before changing anything else in this file, especially the CORS section.

### Router (`<name>.router.ts`)

A list of URLs and the controller function for each. Paths are relative to the prefix in `app.ts`, so `'/'` here means `/api/notes`, and `'/:id'` would mean `/api/notes/123`.

```ts
const router = Router();

router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);

export default router;
```

- **Goes here:** HTTP method + path → controller function. Nothing else.
- **Does not go here:** logic of any kind.

### Controller (`<name>.controller.ts`)

One function per route. Each one takes data out of the request, calls the service, and decides the HTTP status code and response body.

```ts
export async function createNote(req: Request, res: Response) {
  const title: unknown = req.body?.title;

  try {
    const note = await notesService.createNote(title);
    res.status(201).json(note);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error('Failed to create note:', getErrorMessage(error));
    res.status(500).json({ error: 'Failed to create note' });
  }
}
```

- **Goes here:** reading `req.body`, `req.params`, `req.query`; calling the service; `res.status(...).json(...)`; turning service errors into status codes.
- **Does not go here:** SQL, `pool`, or business rules (e.g. "titles can't be longer than 200 characters").
- Use `req.body?.title`, not `req.body.title`: `req.body` is `undefined` when a request has no body.
- After sending an early response, `return;` so the function doesn't try to send a second one.
- Wrap the service call in `try`/`catch` and always send a response from the `catch`. Otherwise a failed request hangs until it times out.

Common status codes:

| Code | When |
| --- | --- |
| `200 OK` | Request succeeded (e.g. a list was fetched) |
| `201 Created` | Something new was created |
| `400 Bad Request` | The request's data is invalid (a `ValidationError`) |
| `404 Not Found` | The requested item doesn't exist |
| `500 Internal Server Error` | Something unexpected failed, usually the database |

### Service (`<name>.service.ts`)

The business rules and the database queries. Services know nothing about HTTP: they return data, or throw an error, and the controller decides what that means for the response.

```ts
export async function createNote(title: unknown): Promise<Note> {
  if (typeof title !== 'string' || !title.trim() || title.length > MAX_TITLE_LENGTH) {
    throw new ValidationError('Invalid note title');
  }

  const result = await pool.query<Note>(
    'INSERT INTO notes (title) VALUES ($1) RETURNING id, title, created_at',
    [title.trim()]
  );

  return result.rows[0];
}
```

- **Goes here:** validation and business rules, SQL queries with `pool.query`, combining or reshaping data.
- **Does not go here:** `req`, `res`, or status codes.
- When input breaks a rule, `throw new ValidationError('message')` (from `utils/errors.ts`). The controller turns it into a `400` with that message.
- **Always pass values as parameters** (`$1`, `$2`, ... with an array), never by building the SQL string yourself:

  ```ts
  // ✅ safe
  pool.query('SELECT * FROM notes WHERE id = $1', [id]);

  // ❌ never do this: anyone can run their own SQL on our database
  pool.query(`SELECT * FROM notes WHERE id = '${id}'`);
  ```

- Pass your type to `pool.query<Note>(...)` so `result.rows` is typed.

### Middleware (`middleware/`)

Functions that run on every request, registered in `app.ts`. Currently:

- `notFound.ts`: responds `404` with JSON when no route matched.
- `errorHandler.ts`: a safety net that responds with JSON for errors no controller caught (e.g. malformed JSON in a request body).

These are shared by every feature. Check in with the group before adding or changing one.

### Utils (`utils/`)

Small helper functions and classes shared across features. Currently:

- `errors.ts`: `ValidationError` (thrown by services for invalid input) and `getErrorMessage(error)` (gets a loggable message from a caught error).

If you write a helper that only one feature uses, keep it in that feature's folder instead. Move it to `utils/` once a second feature needs it.

### Tests (`features/<name>/tests/<name>.test.ts`)

Backend tests are **integration tests**: they send real HTTP requests to the app with `supertest` and run against a real, separate `app_test` database. Nothing is mocked by default.

```ts
const response = await request(app)
  .post('/api/notes')
  .send({ title: 'vitest: integration test' });

expect(response.status).toBe(201);
expect(response.body.title).toBe('vitest: integration test');
```

- **Start every test row's text with `vitest:`** (e.g. titles), and delete rows matching `'vitest:%'` in `beforeEach`/`afterAll`. That way tests only clean up their own data. See `notes.test.ts`.
- Cover at least:
  - the happy path for every route (status code **and** body)
  - each validation rule the service enforces, including the edges (e.g. exactly at a length limit, and one over)
  - a request with no body or the wrong types
- Tests that aren't tied to one feature (e.g. `health.test.ts`) go in `src/tests/`.
- Run them with `npm run test:backend` from the repo root (Docker Desktop must be open).

**Coverage exclusions.** We don't test paths that only run when the database itself fails (the `500` branches). With the team's approval in code review, those lines can be excluded from coverage with a comment saying why:

```ts
// Excluded from coverage: only reachable when the database itself fails
/* v8 ignore start -- @preserve */
console.error('Failed to create note:', getErrorMessage(error));
res.status(500).json({ error: 'Failed to create note' });
/* v8 ignore stop -- @preserve */
```

Keep `-- @preserve` in the comment, or it is stripped out when TypeScript is compiled and Vitest ignores it. Use `/* v8 ignore else -- @preserve */` above an `if` whose only untested side is one of these paths. Never use exclusions to hide code that ordinary input can reach; write a test for it instead.

### Adding a new feature

1. **Database:** if the feature needs a new table or column, add a new migration in `database/migrations/` (next number, e.g. `002_create_tasks.js`), using `001_create_notes.js` as the template. Never edit an existing migration. Add sample rows to `database/seeds/development.sql`.
2. **Types:** add an `export interface` for the table in `app.ts`.
3. **Folder:** create `features/<name>/` with `<name>.service.ts`, `<name>.controller.ts`, `<name>.router.ts`, and `tests/<name>.test.ts`.
4. **Service:** write the validation and queries. Throw `ValidationError` for bad input.
5. **Controller:** one function per route that calls the service and sends the right status code.
6. **Router:** map each method and path to its controller function.
7. **Register:** add `app.use('/api/<name>', <name>Router)` in `app.ts`.
8. **Tests:** cover every route and validation rule, then run `npm run test:backend`.
9. **Type-check:** run `npm run typecheck` in `backend/`.
10. **Frontend:** add matching functions in `frontend/src/services/<name>.ts` so components can call the new routes.
11. Use `features/notes/` as the reference example.
