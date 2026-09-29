import { defineConfig } from 'vite';

export default defineConfig({
  base: '/concepts/the-living-equation/',
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 4173 },
});
