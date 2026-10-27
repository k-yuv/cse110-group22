# cse110-group22

## Getting started

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running) and [Node.js](https://nodejs.org/) 22+.

```sh
npm run setup   # one time (and after pulling new dependencies): installs packages for your editor and frontend tests
npm run dev     # starts the frontend, backend, and database
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/health

Edits to files in `frontend/`, `backend/`, and `database/migrations/` are picked up automatically. Press `Ctrl+C` to stop, or run `npm run stop` from another terminal.

## Commands

All commands run from the repository root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start everything with live reload |
| `npm run stop` | Stop all containers |
| `npm test` | Run frontend and backend tests |
| `npm run test:frontend` | Run frontend tests only (no Docker needed) |
| `npm run test:backend` | Run backend tests against the separate `app_test` database |
| `npm run lint` | Lint the frontend |
| `npm run db:seed` | Add the sample data in `database/seeds/development.sql` (while `npm run dev` is running) |
| `npm run db:reset` | **Delete** the local database and start fresh next time you run `npm run dev` |

For tests that re-run as you save, run `npm run test:watch` inside `frontend/`.
