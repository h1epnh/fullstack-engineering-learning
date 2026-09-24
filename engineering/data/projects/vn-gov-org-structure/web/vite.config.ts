import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Plain static data-browser — no backend calls, data is bundled from src/data/*.json (synced
// from ../data/ via `npm run sync-data`). `base: './'` keeps it deployable from any path.
export default defineConfig({
  base: './',
  plugins: [react()],
});
