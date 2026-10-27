# Configs

A high-level overview of the Docker setup and the GitHub Actions workflow: what each piece does and how they fit together. For step-by-step usage, see [Bare-Essentials.md](Bare-Essentials.md).

## Docker

The whole local environment is defined in [`compose.yaml`](../compose.yaml) at the repo root. Running `npm run dev` (which is `docker compose up --build --watch`) starts three services: **frontend**, **backend**, and **db**. The project name is fixed to `cse110-group22`, so containers and volumes have the same names on every machine.

The Dockerfiles are for **local development only**. In production, the frontend and backend are deployed to Vercel and don't use these images.

### Frontend

**`frontend/Dockerfile`** builds an image that runs the Vite dev server:

- Starts from `node:22-alpine` and runs as the non-root `node` user.
- Copies `package.json` / `package-lock.json` and runs `npm ci` *before* copying the source code. Docker caches each step, so dependencies are only reinstalled when those files change.
- Copies the rest of the source, exposes port `5173`, and runs `npm run dev`.

**`frontend` service in `compose.yaml`:**

- Builds from `./frontend` and maps port `5173`, so the site is at http://localhost:5173.
- Waits for the `backend` service to start first.
- **Watch mode:** when you save a file in `frontend/`, it is copied into the container and Vite hot-reloads the page. `node_modules/` and `dist/` are not copied. If `package.json` or `package-lock.json` changes, the image is rebuilt so new dependencies get installed.

`frontend/.dockerignore` keeps `node_modules`, build output, coverage reports, `.env` files, and `.git` out of the image.

### Backend

**`backend/Dockerfile`** builds an image that runs the Express API:

- Same pattern as the frontend: `node:22-alpine`, non-root user, `npm ci` before the source is copied, then `npm run dev` on port `3000`.
- Also copies the migration files from `database/migrations` into `/database/migrations` in the image. That folder is outside `backend/`, so the Dockerfile needs an extra build context named `database`, which `compose.yaml` provides. **Because of this, build the backend through Docker Compose, not with a plain `docker build`.**

**`backend` service in `compose.yaml`:**

- Builds from `./backend` with `./database` attached as the extra build context.
- Maps port `3000` (API at http://localhost:3000).
- Sets the environment variables directly: `NODE_ENV`, `PORT`, `DATABASE_URL` (points at the `db` service), `DB_POOL_MAX`, and `FRONTEND_URL` (used for CORS). This is why there is no `backend/.env.development`.
- Waits until the `db` service passes its health check, not just until it has started.
- On startup, runs `npm run migrate` to apply any new migrations, then starts the server with `npm run dev`.
- **Watch mode:** edits in `backend/` are copied in and the server restarts. A new file in `database/migrations` is copied in and the container restarts so the migration gets applied. Changes to the package files trigger a rebuild.

**`backend-test` service** extends `backend`, with two differences:

- It points at the separate `app_test` database instead of `app_db`, so tests never touch your dev data.
- It runs migrations and then `npm test` once, instead of starting the server.

It is in the `test` profile, so `npm run dev` does **not** start it. It only runs through `npm run test:backend` (`docker compose run --rm --build backend-test`), which is the same command CI uses.

`backend/.dockerignore` keeps `node_modules`, coverage reports, `.env` files, and `.git` out of the image.

### Database

The database has no Dockerfile. The `db` service uses the official `postgres:17` image as-is.

**`db` service in `compose.yaml`:**

- Creates the `app_user` user (password `dev_password`) and the `app_db` database. These credentials are for local development only.
- Maps port `5432` to `127.0.0.1` only, so other computers on your network can't reach it.
- **Volumes:**
  - `postgres_data`: a named volume where the data is stored, so it survives `npm run stop`. `npm run db:reset` deletes it to start fresh.
  - `database/init` → `/docker-entrypoint-initdb.d`: SQL scripts here run **once**, the first time the volume is created. This is where the `app_test` database is created.
  - `database/seeds` → `/seeds`: sample data, loaded on demand with `npm run db:seed`.
- **Health check:** runs `pg_isready` every 2 seconds. The backend waits for it to pass before starting. The check connects over TCP (`-h 127.0.0.1`) so it doesn't pass too early during first-time setup, while the init scripts are still running.

Table structure is **not** defined here. The backend creates and changes tables by running the migrations in `database/migrations` on startup.

## GitHub Actions

The CI workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). It runs on every pull request, on every push to `main`, and manually from the **Actions** tab ("Run workflow"). If you push again to the same branch or PR, the older run is cancelled.

It has three jobs:

### 1. `frontend`

Runs in `frontend/` on Node 22:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`: a production build that catches type errors and build failures before Vercel deploys. `VITE_API_URL` is set to a placeholder because the build needs it to be set.

### 2. `backend`

1. `npm ci` and `npm run typecheck` in `backend/`. The dev server (`tsx`) and Vercel run the code without checking types, so this step is what catches TypeScript errors.
2. `docker compose run --rm --build backend-test`: the same command as `npm run test:backend` locally. It starts Postgres and runs the integration tests against `app_test`.
3. If anything fails, it prints the database container's logs to help with debugging.

### 3. `migrate` (main only)

Applies new migrations to the **production** database.

- Runs only on pushes to `main` (normally a merged PR) or a manual run on `main`, and only after `frontend` and `backend` both pass. It never runs on PRs.
- Reads the production connection string from the `PRODUCTION_DATABASE_URL` repo secret (Settings → Secrets and variables → Actions). If the secret isn't set, the job skips itself with a notice instead of failing.
- Runs `npm run migrate -- --no-reject-unauthorized`: connects with SSL but doesn't verify the certificate, the same way the backend connects in production.
- Has its own concurrency group with cancelling turned off, so a migration is never stopped halfway through.
