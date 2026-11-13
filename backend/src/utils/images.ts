import path from 'node:path';

// The AI minigame's picture files live in backend/data/images/. Unlike the
// rest of backend/data/, they are committed to git (see .gitignore). They are
// read-only, so tests use the real folder instead of DATA_DIR.
export const IMAGES_DIR = path.join(__dirname, '../../data/images');

// URL prefix the files are served under (see app.ts), e.g. /api/images/cat.jpg.
// It starts with /api so the frontend's Vite proxy forwards it to the backend.
export const IMAGES_URL = '/api/images';
