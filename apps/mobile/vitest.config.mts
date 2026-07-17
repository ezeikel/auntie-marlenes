import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['lib/**/*.{test,spec}.ts'],
    environment: 'node',
  },
});
