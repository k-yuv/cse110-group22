# Bare Essentials

Everything you need to start working on this project, even if you have never built a web app before. Read this once from top to bottom, then keep it open as a reference.

## What the project is made of

| Part | Folder | What it is | Runs at |
| --- | --- | --- | --- |
| Frontend | `frontend/` | The website users see (React + TypeScript) | http://localhost:5173 |
| Backend | `backend/` | The API the frontend calls for data (Express + TypeScript) | http://localhost:3000 |
| Database | `database/` | PostgreSQL, where data is stored | `localhost:5432` (you rarely touch it directly) |

You don't install PostgreSQL or run the backend yourself. **Docker** runs all three for you with one command.

## One-time setup

### 1. Install the tools

1. **Docker Desktop:** https://www.docker.com/products/docker-desktop/
   - Windows: if the installer asks to enable **WSL 2**, say yes and restart your computer.
   - Mac: pick the download that matches your chip (Apple Silicon or Intel). To check, click the Apple menu → About This Mac.
   - After installing, **open Docker Desktop** and leave it running. Every command below that uses Docker fails if Docker Desktop isn't open.
2. **Node.js 22 or newer:** https://nodejs.org/ (the "LTS" version). This also installs `npm`.
3. **Git:** https://git-scm.com/downloads (already installed on most Macs).
4. **VS Code** (recommended): https://code.visualstudio.com/

To check everything installed, open a terminal and run:

```sh
docker --version
node --version     # should print v22 or higher
git --version
```

### 2. Get the code and install packages

```sh
git clone <repo-url>
cd cse110-group22
npm run setup
```

`npm run setup` installs the packages the project depends on into `frontend/node_modules` and `backend/node_modules`. Your editor needs these to show types and errors, and the frontend tests need them to run.

### 3. Start the app

```sh
npm run dev
```

The first run takes a few minutes while Docker downloads and builds everything. When it's ready:

- open http://localhost:5173 to see the website
- open http://localhost:3000/api/health; it should show `{"status":"ok"}`

Leave this terminal running while you work. Saving a file in `frontend/` or `backend/` updates the running app automatically. Press `Ctrl+C` (or run `npm run stop` in another terminal) to stop.

## Commands

Run all of these from the **root of the repo** (the `cse110-group22` folder), not from inside `frontend/` or `backend/`.

### Everyday

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the frontend, backend, and database with live reload |
| `npm run stop` | Stop everything |
| `npm test` | Run all frontend and backend tests |
| `npm run lint` | Check frontend code for common mistakes |

### Testing

| Command | What it does |
| --- | --- |
| `npm run test:frontend` | Frontend tests only. Doesn't need Docker. |
| `npm run test:backend` | Backend tests only, against a separate test database so your dev data is safe. Needs Docker Desktop open. |
| `npm run test:coverage` | All tests, plus a table of which lines the tests ran |
| `npm run test:coverage:frontend` | Coverage for the frontend only |
| `npm run test:coverage:backend` | Coverage for the backend only |

### Database

| Command | What it does |
| --- | --- |
| `npm run db:seed` | Add the sample data from `database/seeds/development.sql`. Run it while `npm run dev` is running. |
| `npm run db:reset` | **Deletes all local data.** The database is rebuilt empty the next time you run `npm run dev`. Use it when your local database is in a weird state. |

### Setup and maintenance

| Command | What it does |
| --- | --- |
| `npm run setup` | Install packages. Run again after pulling changes that touched a `package.json`. |

### Commands you run inside a folder

A few commands only exist inside `frontend/` or `backend/`. `cd` into the folder first:

| Folder | Command | What it does |
| --- | --- | --- |
| `frontend/` | `npm run test:watch` | Re-run frontend tests every time you save |
| `frontend/` | `npm run build` | Type-check and build the production site (CI runs this) |
| `backend/` | `npm run typecheck` | Check the backend for TypeScript errors (CI runs this) |

### Before you open a pull request

CI runs these checks on every pull request. Run them first so you aren't surprised:

```sh
npm run lint
npm test
cd backend && npm run typecheck
```

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
| `features/<name>/<name>.router.ts` | Which URL goes to which controller function |
| `features/<name>/<name>.controller.ts` | Reads the request, calls the service, sends the response and status code |
| `features/<name>/<name>.service.ts` | Business rules and database queries |
| `features/<name>/tests/<name>.test.ts` | Tests for that feature |
| `app.ts` | Two things only: add a shared type/interface, and register your router with `app.use('/api/<name>', <name>Router)`. Ask before changing anything else in this file. |

**Database (`database/`)**

| Path | What to put there |
| --- | --- |
| `migrations/<next number>_<description>.js` | A **new** file for each change to the database's tables, e.g. `002_add_due_date_to_notes.js`. Use `001_create_notes.js` as the template. It's applied automatically when you run `npm run dev`. |
| `seeds/development.sql` | Sample data for local development. Update it when you add or change a table. |

### Ask the group before touching

These files affect everyone's setup, CI, or the live site. A mistake here can break the project for the whole team, often in ways that only show up later. If you think one needs to change, bring it up in the group chat or a PR first.

| Path | Why |
| --- | --- |
| `compose.yaml`, `*/Dockerfile`, `*/.dockerignore` | How Docker runs the app for everyone |
| `.github/workflows/ci.yml` | The automatic checks on every PR, and **production database migrations** |
| `package.json` (root, frontend, backend) | Scripts and dependencies. Ask before adding a new package. If agreed, install it with `npm install <package>` inside `frontend/` or `backend/`; don't edit the file by hand. |
| `tsconfig*.json`, `vite.config.ts`, `vitest.config.mts`, `eslint.config.js` | TypeScript, build, test, and lint settings |
| `.env*` files | Configuration. **Never** put passwords or real database URLs in any file you commit. |
| `backend/src/server.ts`, `backend/src/config/database.ts` | Server startup and the database connection, also used in production |
| The CORS section of `backend/src/app.ts` | Controls which websites may call the API in production |
| `backend/src/middleware/`, `backend/src/utils/` | Shared by every feature. Adding a new file is fine after a quick check-in; changing an existing one affects everyone. |
| `frontend/src/main.tsx` | The frontend's entry point |
| `*/src/tests/setup.ts` | Shared test setup. The backend one stops tests from wiping the wrong database. |
| `database/init/` | Only runs when a database is first created |
| **Existing** files in `database/migrations/` | Never edit a migration after it's merged. It has already run on everyone's database and on production, so editing it does nothing there and makes databases disagree. Write a new migration instead. |

### Never edit

These are generated automatically. Changes are overwritten and should never be committed.

- `node_modules/`
- `package-lock.json` (updated by `npm install`; commit the changes it makes, but don't edit it by hand)
- `dist/`, `build/`, `coverage/`

## FAQ/Common Errors

| Problem | Fix |
| --- | --- |
| `Cannot connect to the Docker daemon` or `docker: command not found` | Open Docker Desktop and wait until it says it's running. |
| `port is already allocated` / `address already in use` | Something else is using port 5173, 3000, or 5432. Run `npm run stop`, or close the other program (often another copy of the project). |
| Your editor shows red errors on imports | Run `npm run setup`. |
| Errors after pulling the latest code | Run `npm run setup`, then `npm run dev` again. |
| The database is missing tables or has strange data | `npm run db:reset`, then `npm run dev`, then `npm run db:seed`. |
| Still stuck | Ask in the group chat. Paste the full error message from the terminal. |

## Other docs

- [File-Structure-Guide.md](File-Structure-Guide.md): what goes in each file of a frontend component and a backend feature, with examples.
- [Prod-Deployment-Instructions.md](Prod-Deployment-Instructions.md): how the live site is deployed. You won't need this for day-to-day work.
