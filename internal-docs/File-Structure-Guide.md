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
notesView.tsx  →  notesModel.tsx  →  services/notes.ts  →  backend (via /api)
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

The backend is organized **by feature**: everything for one feature (e.g. notes) lives in one folder under `backend/src/features/`. Code shared by every feature lives in `middleware/` and `utils/`. Every route is described in **`backend/openapi.yaml`**, which the app uses to check requests and responses automatically.

```
backend/
├── openapi.yaml              ← every route, and the shape of its requests and responses
├── data/                     ← JSON files the app saves to (ignored by git)
│   ├── notes.json
│   └── test/                 ← the data files tests use
└── src/
    ├── app.ts                ← shared types, Express setup, OpenAPI validator, registers routers
    ├── server.ts             ← starts the server (don't edit)
    ├── features/
    │   └── notes/
    │       ├── notes.router.ts       ← which URL goes to which controller function
    │       ├── notes.controller.ts   ← reads the request, sends the response
    │       ├── notes.service.ts      ← business rules, reads/writes notes.json
    │       └── tests/
    │           └── notes.test.ts
    ├── middleware/           ← errorHandler.ts: turns every error into a JSON response
    ├── utils/                ← small helpers shared by features (jsonStore.ts)
    └── tests/                ← tests not tied to one feature
```

A request passes through the layers in one direction only:

```
request → express.json() → OpenAPI validator → router → controller → service → data/notes.json
                                  ↓ (bad request)                       ↓ (throws)
                                  └──────────→ errorHandler ←───────────┘
```

For example, `POST /api/notes` with `{ "title": "Buy milk" }`:

1. `express.json()` in `app.ts` parses the JSON body.
2. The **OpenAPI validator** finds `POST /api/notes` in `openapi.yaml` and checks the body against the `NewNote` schema. If the title is missing, not a string, blank, or over 200 characters, it rejects the request with `400` right here, and the controller never runs.
3. `notes.router.ts` sees `POST /` and calls `notesController.createNote`.
4. `notes.controller.ts` takes `title` out of the (already valid) body and calls `notesService.createNote(title)`.
5. `notes.service.ts` reads `notes.json`, adds the new note, writes the file back, and returns the new note.
6. The controller sends the note with status `201 Created`. Before it goes out, the validator checks it against the `Note` schema. If it doesn't match (say the service forgot `created_at`), the client gets a `500` instead of bad data.

### `openapi.yaml`

The single description of the API: every path, which methods it accepts, what the request body must look like, and what each response looks like. **Edit it first** whenever you add or change a route.

```yaml
paths:
  /api/notes:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewNote'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Note'
        default:
          $ref: '#/components/responses/Error'

components:
  schemas:
    NewNote:
      type: object
      required: [title]
      additionalProperties: false   # reject fields we don't expect
      properties:
        title:
          type: string
          maxLength: 200
          pattern: '\S'             # at least one non-space character
```

What the validator does for you, so you don't write it yourself:

| Situation | Response |
| --- | --- |
| Body breaks the schema (wrong type, missing field, too long, extra field) | `400`, e.g. `{ "error": "request/body/title must be string" }` |
| Path not in the spec | `404 { "error": "not found" }` |
| Method not in the spec (e.g. `DELETE /api/notes`) | `405` |
| Body isn't JSON, or there's no body | `415` |
| Your response doesn't match its schema | `500` (and the details are logged in the terminal) |

Tips:

- Put reusable shapes under `components/schemas` and point to them with `$ref`.
- Give every operation a `default: $ref: '#/components/responses/Error'` response, so error responses pass response validation too.
- Useful schema keywords: `required`, `type`, `minLength`/`maxLength`, `minimum`/`maximum`, `pattern`, `enum`, `format` (`uuid`, `date-time`, `email`), and `additionalProperties: false`.
- If a route works in your code but always returns `404` or `405`, it's probably missing from `openapi.yaml` (or the path/method is spelled differently there).

### `app.ts`

Sets up the whole app. Feature authors only touch it for two things:

- **Shared types.** Add an `interface` for each kind of object that more than one file uses, and `export` it. Keep it in sync with the matching schema in `openapi.yaml`:

  ```ts
  // Matches the Note schema in backend/openapi.yaml.
  export interface Note {
    id: string;
    title: string;
    created_at: string;
  }
  ```

  Use `string` for dates: JSON has no date type, so they're saved as text like `"2026-10-30T14:54:01.238Z"` (from `new Date().toISOString()`).

  Import it elsewhere with `import type`, which avoids a circular import with `app.ts`:

  ```ts
  import type { Note } from '../../app';
  ```

- **Registering your router.** Import it and add one `app.use` line next to the existing ones, above `errorHandler` (which must stay last):

  ```ts
  import notesRouter from './features/notes/notes.router';
  // ...
  app.use('/api/notes', notesRouter);
  ```

Ask the group before changing anything else in this file.

### Router (`<name>.router.ts`)

A list of URLs and the controller function for each. Paths are relative to the prefix in `app.ts`, so `'/'` here means `/api/notes`, and `'/:id'` would mean `/api/notes/123`. Every route here also needs an entry in `openapi.yaml`.

```ts
const router = Router();

router.get('/', notesController.getNotes);
router.post('/', notesController.createNote);

export default router;
```

- **Goes here:** HTTP method + path → controller function. Nothing else.
- **Does not go here:** logic of any kind.

### Controller (`<name>.controller.ts`)

One function per route. Each one takes data out of the request, calls the service, and sends the response with the right status code.

```ts
export async function createNote(req: Request, res: Response) {
  const note = await notesService.createNote(req.body.title);
  res.status(201).json(note);
}
```

- **Goes here:** reading `req.body`, `req.params`, `req.query`; calling the service; `res.status(...).json(...)`.
- **Does not go here:** checking the request's shape (that's `openapi.yaml`'s job), reading or writing files, or business rules.
- **No `try`/`catch` needed.** If the service throws, Express 5 passes the error to `middleware/errorHandler.ts`, which responds `500`. Only catch an error if you want to respond with something specific, like a `404` for an `id` that doesn't exist.

Common status codes:

| Code | When |
| --- | --- |
| `200 OK` | Request succeeded (e.g. a list was fetched) |
| `201 Created` | Something new was created |
| `400 Bad Request` | The request breaks `openapi.yaml` (sent by the validator) |
| `404 Not Found` | The path isn't in `openapi.yaml`, or the requested item doesn't exist |
| `500 Internal Server Error` | Something unexpected failed, e.g. the data file is broken |

### Service (`<name>.service.ts`)

The business rules and the data. Services know nothing about HTTP: they return data, or throw an error, and the controller decides what that means for the response. By the time a service runs, the validator has already checked the input's shape, so services only hold rules a schema can't express.

Each feature keeps its data in its own JSON file in `backend/data/` (notes use `notes.json`). Read and write it with the two helpers in `utils/jsonStore.ts`:

- `readJson<T>(fileName, fallback)` returns the file's contents, or `fallback` if the file doesn't exist yet.
- `writeJson(fileName, data)` replaces the whole file with `data`.

To change data, read the whole list, change it in memory, and write the whole list back:

```ts
const NOTES_FILE = 'notes.json';

export async function getAllNotes(): Promise<Note[]> {
  return readJson<Note[]>(NOTES_FILE, []);
}

export async function createNote(title: string): Promise<Note> {
  const notes = await getAllNotes();

  const note: Note = {
    id: randomUUID(),
    title: title.trim(),
    created_at: new Date().toISOString(),
  };

  notes.push(note);
  await writeJson(NOTES_FILE, notes);

  return note;
}
```

- **Goes here:** business rules, reading and writing the feature's JSON file, combining or reshaping data.
- **Does not go here:** `req`, `res`, status codes, or type/length checks that `openapi.yaml` already does.
- Give new items an `id` with `randomUUID()` from `node:crypto`.
- Only use `readJson`/`writeJson`, not `fs` directly, so tests can point the app at their own data folder.

### Middleware (`middleware/`)

Currently one file:

- `errorHandler.ts`: registered last in `app.ts`. Every error ends up here: malformed JSON from `express.json()`, rejected requests and responses from the OpenAPI validator, and anything a controller or service throws. For a `4xx` it sends `{ "error": <what was wrong> }`; for anything else it logs the error in the terminal and sends `500 { "error": "Internal server error" }`, without leaking details to the client.

It's shared by every feature. Check in with the group before changing it.

### Utils (`utils/`)

Small helper functions shared across features. Currently:

- `jsonStore.ts`: `readJson` and `writeJson`, which every service uses to load and save its data file.

If you write a helper that only one feature uses, keep it in that feature's folder instead. Move it to `utils/` once a second feature needs it.

### Tests (`features/<name>/tests/<name>.test.ts`)

Backend tests send real HTTP requests to the app with `supertest`, then check both the response **and** what ended up in the JSON file. Nothing is mocked by default, and the OpenAPI validator runs in tests just like it does for real requests.

`vitest.config.mts` sets `DATA_DIR` to `backend/data/test/`, so during tests the app reads and writes `backend/data/test/notes.json` instead of your real notes. Each test starts by resetting that file, so tests don't affect each other:

```ts
const NOTES_FILE = path.join(process.env.DATA_DIR!, 'notes.json');

beforeEach(async () => {
  await writeNotesFile('[]');
});

it('creates a note and saves it to the file', async () => {
  const response = await request(app)
    .post('/api/notes')
    .send({ title: 'Buy milk' });

  expect(response.status).toBe(201);
  expect(await readNotesFile()).toEqual([response.body]);
});
```

`readNotesFile` and `writeNotesFile` are small helpers at the top of `notes.test.ts` that use `fs` to read or write the test file directly. To test what a `GET` returns, write the data you want into the file first, then make the request. Data you write must match `openapi.yaml` (e.g. real UUIDs from `crypto.randomUUID()`), or response validation turns the response into a `500`.

- Cover at least:
  - the happy path for every route (status code, body, **and** what's in the file)
  - each rule in the route's schema, including the edges (e.g. exactly at a length limit, and one over), and that nothing was saved
  - a request with no body, the wrong types, and extra fields
  - the `500` path: write invalid JSON into the file (e.g. `'this is not JSON'`) so reading it fails
- Tests that aren't tied to one feature (e.g. `health.test.ts`) go in `src/tests/`.
- Run them with `npm test` from the `backend/` folder.

**Coverage exclusions.** Lines that ordinary tests genuinely can't reach can be excluded from `npm run coverage` with a comment saying why, with the team's approval in code review (see `middleware/errorHandler.ts`):

```ts
// Excluded from coverage: only reachable if a response was already partly
// sent before the error, which is out of scope for our expectations.
/* v8 ignore start -- @preserve */
// ...
/* v8 ignore stop -- @preserve */
```

Keep `-- @preserve` in the comment, or it is stripped out when TypeScript is compiled and Vitest ignores it. Never use exclusions to hide code that ordinary input can reach; write a test for it instead.

### Adding a new feature

1. **Spec:** add the new paths, request bodies, and responses to `openapi.yaml`, with schemas under `components/schemas`.
2. **Types:** add an `export interface` for the feature's data in `app.ts`, matching its schema.
3. **Folder:** create `features/<name>/` with `<name>.service.ts`, `<name>.controller.ts`, `<name>.router.ts`, and `tests/<name>.test.ts`.
4. **Service:** pick a file name (e.g. `tasks.json`), then write the `readJson`/`writeJson` calls and any business rules.
5. **Controller:** one function per route that calls the service and sends the right status code.
6. **Router:** map each method and path to its controller function.
7. **Register:** add `app.use('/api/<name>', <name>Router)` in `app.ts`.
8. **Tests:** reset the feature's file in `DATA_DIR` in `beforeEach`, cover every route and schema rule, then run `npm test` in `backend/`.
9. **Type-check:** run `npm run typecheck` in `backend/`.
10. **Frontend:** add matching functions in `frontend/src/services/<name>.ts` that call relative URLs like `fetch('/api/<name>')`, so components can call the new routes.
11. Use `features/notes/` as the reference example.
