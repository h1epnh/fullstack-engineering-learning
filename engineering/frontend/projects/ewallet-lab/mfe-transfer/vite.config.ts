import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfe_transfer',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
    }),
  ],
  server: { port: 5177, strictPort: true },
  preview: { port: 5177, strictPort: true },
  build: {
    target: 'esnext',
    modulePreload: false,
  },
});
