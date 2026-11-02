# cse110-group22

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) 22+.

```sh
npm run setup   # one time (and after pulling new dependencies): installs all packages
npm run dev     # starts the backend and frontend, and opens http://localhost:5173
```

Both reload automatically when you save a file. Press `Ctrl+C` to stop both.

Data is saved to `backend/data/notes.json` (created the first time you add a note). Delete the file to start fresh.

## Commands

| Where | Command | What it does |
| --- | --- | --- |
| root | `npm run setup` | Install packages for the root, frontend, and backend |
| root | `npm run dev` | Start the backend and frontend with live reload, and open the browser |
| root | `npm test` | Run frontend and backend tests |
| root | `npm run coverage` | Run frontend and backend tests with coverage |
| `frontend/` | `npm run dev` | Start the website |
| `frontend/` | `npm test` | Run frontend tests |
| `frontend/` | `npm run lint` | Lint the frontend |
| `backend/` | `npm run dev` | Start the API |
| `backend/` | `npm test` | Run backend tests |
| `backend/` | `npm run typecheck` | Check the backend for TypeScript errors |

See [internal-docs/Bare-Essentials.md](internal-docs/Bare-Essentials.md) for more.
