import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfe_wallet',
      filename: 'remoteEntry.js',
      exposes: {
        './Home': './src/screens/Home.tsx',
        './History': './src/screens/History.tsx',
        './AllServices': './src/screens/AllServices.tsx',
        './Notifications': './src/screens/Notifications.tsx',
        './ReceiveQr': './src/screens/ReceiveQr.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
    }),
  ],
  server: { port: 5175, strictPort: true },
  preview: { port: 5175, strictPort: true },
  build: {
    target: 'esnext',
    modulePreload: false,
  },
});
