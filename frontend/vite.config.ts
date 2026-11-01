import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forwards requests like fetch('/api/notes') to the backend on port 3000,
    // so the frontend doesn't need the backend's URL and CORS never comes up.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      // List every file (even 100% ones) in a table wide enough that
      // file names and uncovered line numbers aren't cut off with "...".
      reporter: [['text', { skipFull: false, maxCols: 200 }]],
    },
  },
})
