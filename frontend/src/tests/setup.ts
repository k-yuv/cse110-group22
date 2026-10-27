import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Unmount rendered React components after each test.
afterEach(() => {
  cleanup();
});
