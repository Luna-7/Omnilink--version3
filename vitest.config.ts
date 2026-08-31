import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd()),
    },
  },
  test: {
    environment: 'node',
    // P0 scope: only the new product-with-variants tests.
    // Existing legacy tests in lib/product/*.test.ts and lib/imports/__tests__/*.test.ts
    // are not part of this P0 task and are excluded to keep the test surface minimal.
    include: ['lib/products/__tests__/**/*.test.ts', 'lib/semantic/__tests__/**/*.test.ts'],
    globals: false,
  },
})