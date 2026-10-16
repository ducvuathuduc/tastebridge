import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Inline (empty) PostCSS config so Vite doesn't pick up the web app's postcss.config.js from the repo root.
  css: { postcss: {} },
  resolve: { alias: { 'cloudflare:workers': fileURLToPath(new URL('./test/cf-workers-stub.ts', import.meta.url)) } },
  test: { environment: 'node', include: ['test/**/*.test.ts'] }
});
