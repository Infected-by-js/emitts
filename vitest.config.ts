import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['examples/basic.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      exclude: ['examples/basic.ts'],
    },
  },
}); 