import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      // Tests read and write backend/data/test/ instead of the real data files.
      DATA_DIR: fileURLToPath(new URL('./data/test', import.meta.url)),
    },
    // Test files share the same data files. Running them one at a time stops
    // one file's reset from wiping another file's data mid-test.
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      // List every file (even 100% ones) in a table wide enough that
      // file names and uncovered line numbers aren't cut off with "...".
      reporter: [['text', { skipFull: false, maxCols: 200 }]],
    },
  },
});
