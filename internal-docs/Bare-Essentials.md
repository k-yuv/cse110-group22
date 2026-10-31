# Bare Essentials

Everything you need to start working on this project, even if you have never built a web app before. Read this once from top to bottom, then keep it open as a reference.

## What the project is made of

| Part | Folder | What it is | Runs at |
| --- | --- | --- | --- |
| Frontend | `frontend/` | The website users see (React + TypeScript) | http://localhost:5173 |
| Backend | `backend/` | The API the frontend calls for data (Express + TypeScript) | http://localhost:3000 |
| Data | `backend/data/` | JSON files where the backend saves data (e.g. `notes.json`) | (just files on your computer) |

There is no database. The backend reads and writes plain JSON files, and everything runs on your own computer (`localhost`).

## One-time setup

### 1. Install the tools

1. **Node.js 22 or newer:** https://nodejs.org/ (the "LTS" version). This also installs `npm`.
2. **Git:** https://git-scm.com/downloads (already installed on most Macs).
3. **VS Code** (recommended): https://code.visualstudio.com/

To check everything installed, open a terminal and run:

```sh
node --version     # should print v22 or higher
git --version
```

### 2. Get the code and install packages

```sh
git clone <repo-url>
cd cse110-group22
npm run setup
```

`npm run setup` installs the packages the project depends on into `frontend/node_modules` and `backend/node_modules`.

### 3. Start the app

From the repo root:

```sh
npm run dev
```

This starts the backend, waits until it's ready, then starts the frontend and **opens http://localhost:5173 in your browser**. Both run in the same terminal: lines starting with `[backend]` (blue) come from the API, and lines starting with `[frontend]` (green) come from the website.

Leave it running while you work. It watches your code:

- Saving a file in `frontend/` updates the page in the browser instantly, without a full reload.
- Saving a file in `backend/src/` or `backend/openapi.yaml` restarts the API. You'll see `[tsx] change in ... Restarting...`.

Press `Ctrl+C` once to stop both. If either one crashes, the other stops too, so you're never left with half the app running.

To check the API on its own, open http://localhost:3000/api/health; it should show `{"status":"ok"}`.

**Running them separately:** if you'd rather have the backend and frontend in two terminals (handy when one has lots of logs), run `npm run dev` inside `backend/` in one terminal and inside `frontend/` in the other. That way the browser doesn't open automatically; go to http://localhost:5173 yourself.

**How the frontend reaches the backend:** the frontend calls relative URLs like `fetch('/api/notes')`. The Vite dev server (see `frontend/vite.config.ts`) forwards anything starting with `/api` to `http://localhost:3000`. That means the backend must be running for the website to load data.

## Commands

### Inside `frontend/`

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the website with live reload |
| `npm test` | Run the frontend tests |
| `npm run test:watch` | Re-run frontend tests every time you save |
| `npm run lint` | Check frontend code for common mistakes |
| `npm run build` | Type-check and build the site (CI runs this) |

### IMPORTANT NOTE
ALWAYS RUN COVERAGE BEFORE YOU COMMIT. IT WILL OFTEN REVEAL CODE THAT YOU MAY HAVE NOT TESTED(or code that might be unnecessary for your feature). Be careful with excluding lines of coverage. You should only do it for purely defensive code that will only run in weird/rare circumstances.

### Inside `backend/`

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API with live reload |
| `npm test` | Run the backend tests |
| `npm run coverage` | Run the tests, plus a table of which lines they ran |
| `npm run typecheck` | Check the backend for TypeScript errors (CI runs this) |

### From the repo root

| Command | What it does |
| --- | --- |
| `npm run setup` | Install packages for the root, frontend, and backend. Run again after pulling changes that touched a `package.json`. |
| `npm run dev` | Start the backend and frontend together with live reload, and open the site in your browser |
| `npm test` | Run the frontend tests, then the backend tests |
| `npm run coverage` | Run both test suites with coverage tables |

### Before you open a pull request

CI (`.github/workflows/ci.yml`) runs these same checks on every pull request. Run them first so you aren't surprised:

```sh
cd frontend && npm run lint && npm test && npm run build
cd ../backend && npm run typecheck && npm test
```

## Where the data lives

The backend saves notes to `backend/data/notes.json`. The file is created the first time you add a note, and you can open it in VS Code to see exactly what's stored.

- **Start fresh:** stop the backend and delete `backend/data/notes.json`.
- `backend/data/` is in `.gitignore`, so everyone's local data stays on their own computer and never gets committed.
- Tests use a separate folder, `backend/data/test/`, so running tests never touches your notes.

## Where your code goes

Every feature follows the same pattern on both sides. The **Notes** feature is the working example: when in doubt, copy its files and rename them. See [File-Structure-Guide.md](File-Structure-Guide.md) for what goes in each file.

### Folders and files you can create and edit

**Frontend (`frontend/src/`)**

| Path | What to put there |
| --- | --- |
| `components/<Name>/<name>View.tsx` | What the user sees (JSX) |
| `components/<Name>/<name>Model.tsx` | State and logic (a `use<Name>Model()` hook) |
| `components/<Name>/tests/<name>.test.tsx` | Tests for that component |
| `services/<name>.ts` | Functions that call the backend API |
| `App.tsx` | Add your component to the page |
| `assets/` | Images and icons used by components |

**Backend (`backend/src/`)**

| Path | What to put there |
| --- | --- |
| `backend/openapi.yaml` (one folder up from `src/`) | Add every new route here first: its path, methods, request body, and responses. Requests and responses that don't match are rejected automatically. |
| `features/<name>/<name>.router.ts` | Which URL goes to which controller function |
| `features/<name>/<name>.controller.ts` | Reads the request, calls the service, sends the response and status code |
| `features/<name>/<name>.service.ts` | Business rules, and reading/writing the feature's JSON file (input shape is already checked by `openapi.yaml`) |
| `features/<name>/tests/<name>.test.ts` | Tests for that feature |
| `app.ts` | Two things only: add a shared type/interface, and register your router with `app.use('/api/<name>', <name>Router)`. Ask before changing anything else in this file. |

### Ask the group before touching

These files affect everyone's setup. If you think one needs to change, bring it up in the group chat or a PR first.

| Path | Why |
| --- | --- |
| `.github/workflows/ci.yml` | The automatic checks on every PR |
| `package.json` (root, frontend, backend) | Scripts and dependencies. Ask before adding a new package. If agreed, install it with `npm install <package>` inside `frontend/` or `backend/`; don't edit the file by hand. |
| `tsconfig*.json`, `vite.config.ts`, `vitest.config.mts`, `eslint.config.js` | TypeScript, build, test, and lint settings |
| `backend/src/server.ts` | Starts the server |
| `backend/src/middleware/`, `backend/src/utils/` | Shared by every feature, including `middleware/errorHandler.ts` (turns every error into JSON) and `utils/jsonStore.ts` (reads and writes the data files). Adding a new file is fine after a quick check-in; changing an existing one affects everyone. |
| `frontend/src/main.tsx` | The frontend's entry point |
| `frontend/src/tests/setup.ts` | Shared frontend test setup |

### Never edit

These are generated automatically. Changes are overwritten and should never be committed.

- `node_modules/`
- `package-lock.json` (updated by `npm install`; commit the changes it makes, but don't edit it by hand)
- `dist/`, `build/`, `coverage/`
- `backend/data/` (your local data; it's ignored by git)

## FAQ/Common Errors

| Problem | Fix |
| --- | --- |
| The website shows "Could not load notes" | The backend isn't running, or it crashed. Check the `[backend]` lines in the terminal for an error, then restart with `npm run dev` from the repo root. |
| `port is already allocated` / `address already in use` / `EADDRINUSE` | Something else is using port 5173 or 3000, often another copy of the project still running in another terminal. Stop it with `Ctrl+C`. |
| Your editor shows red errors on imports | Run `npm run setup`. |
| Errors after pulling the latest code | Run `npm run setup`, then restart `npm run dev`. |
| A route you added always returns `404` or `405` | It's missing from `backend/openapi.yaml`, or the path or method is spelled differently there. |
| A route returns `500` and the terminal says the response doesn't match | Your response doesn't match its schema in `openapi.yaml`. Fix the code or the schema. |
| Notes data is in a weird state | Stop the backend, delete `backend/data/notes.json`, and start it again. |
| Still stuck | Ask in the group chat. Paste the full error message from the terminal. |

## Feature docs

- [Desk-View.md](Desk-View.md): the hub desk (level selector): what it does, where its code is, how it's tested, and how to hook an activity screen up to it.

## Other docs

- [File-Structure-Guide.md](File-Structure-Guide.md): what goes in each file of a frontend component and a backend feature, with examples.
- [Konva-Testing.md](Konva-Testing.md): how to test components that draw with Konva.
