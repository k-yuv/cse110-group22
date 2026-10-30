import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from './jsonStore';

// Fills backend/data/ with the starter data in backend/seed/, so a fresh clone
// has something to show. Each file in seed/ is copied to the data file with the
// same name, but only when that data file is missing or holds an empty list.
// Data that already exists is never overwritten.
export async function seedData(seedDir = path.join(__dirname, '../../seed')): Promise<void> {
  const fileNames = (await fs.readdir(seedDir)).filter((name) => name.endsWith('.json'));

  for (const fileName of fileNames) {
    const existing = await readJson<unknown[]>(fileName, []);
    if (existing.length > 0) {
      continue;
    }

    const seed = JSON.parse(await fs.readFile(path.join(seedDir, fileName), 'utf8'));
    await writeJson(fileName, seed);
    console.log(`Seeded data/${fileName}`);
  }
}
