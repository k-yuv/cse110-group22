import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { seedData } from '../utils/seed';

// During tests, data files live in backend/data/test/ (DATA_DIR is set in
// vitest.config.mts), so seeding here never touches real data.
const SEED_FILE = path.join(__dirname, '../../seed/questions.json');
const DATA_FILE = path.join(process.env.DATA_DIR!, 'questions.json');

async function readDataFile(): Promise<unknown> {
  return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
}

describe('seedData', () => {
  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await fs.rm(DATA_FILE, { force: true });
  });

  it('copies the seed file when the data file does not exist', async () => {
    await seedData();

    expect(await readDataFile()).toEqual(JSON.parse(await fs.readFile(SEED_FILE, 'utf8')));
  });

  it('copies the seed file when the data file is an empty list', async () => {
    await fs.writeFile(DATA_FILE, '[]');

    await seedData();

    expect(await readDataFile()).toEqual(JSON.parse(await fs.readFile(SEED_FILE, 'utf8')));
  });

  it('leaves existing data alone', async () => {
    const existing = [{ chapter: 5, number: 5, content: 'already here' }];
    await fs.writeFile(DATA_FILE, JSON.stringify(existing));

    await seedData();

    expect(await readDataFile()).toEqual(existing);
  });
});
