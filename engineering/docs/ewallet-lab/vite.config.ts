import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Plain static docs site — no backend calls, so `base: './'` keeps it deployable
// from any path (a Cloudflare Pages project root, a repo subfolder preview, etc.)
// without extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
});
