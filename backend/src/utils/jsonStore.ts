import fs from 'node:fs/promises';
import path from 'node:path';

// Reads and writes the JSON files in backend/data/, which is where the app
// stores its data instead of a database. Tests set DATA_DIR to
// backend/data/test/ (see vitest.config.mts) so they never touch real data.

function dataPath(fileName: string): string {
  // Changes Database From Test/"Prod" Based On Environment Variables
  // During Testing, We Have Vitest Create DATA_DIR And Assign It To
  // Be The Test Directory.
  /* v8 ignore start -- @preserve */
  const dataDir = process.env.DATA_DIR ?? path.join(__dirname, '../../data');
  /* v8 ignore stop -- @preserve */
  return path.join(dataDir, fileName);
}

// Returns `fallback` if the file doesn't exist yet (nothing has been saved).
export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const text = await fs.readFile(dataPath(fileName), 'utf8');
    return JSON.parse(text) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

// Replaces the whole file with `data`, creating the folder if needed.
export async function writeJson(fileName: string, data: unknown): Promise<void> {
  const filePath = dataPath(fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}
