import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    // Integration tests share one real database. Running test files one at a
    // time stops one file's cleanup from deleting another file's rows.
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
  },
});
