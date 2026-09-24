import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Remote entry URLs default to the `preview` servers each remote's own build
 * runs on locally (see root package.json `preview:remotes`), not their `dev`
 * servers. @module-federation/vite's dev-mode remote consumption has known
 * gaps (no cross-remote HMR yet, per module-federation.io) — build+preview is
 * the reliable path and mirrors how these would actually be deployed (each
 * remote's dist/ pushed to its own static host), see DESIGN.md "Dev workflow".
 *
 * Each URL is overridable via env var so a container build can bake in the
 * in-cluster/Ingress address instead (see deploy/helm — MFE_AUTH_ENTRY_URL
 * etc. become Docker build args there). Unset, everything behaves exactly as
 * before for local dev.
 */
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        mfe_auth: {
          type: 'module',
          name: 'mfe_auth',
          entry: process.env.MFE_AUTH_ENTRY_URL || 'http://localhost:5174/remoteEntry.js',
        },
        mfe_wallet: {
          type: 'module',
          name: 'mfe_wallet',
          entry: process.env.MFE_WALLET_ENTRY_URL || 'http://localhost:5175/remoteEntry.js',
        },
        mfe_topup: {
          type: 'module',
          name: 'mfe_topup',
          entry: process.env.MFE_TOPUP_ENTRY_URL || 'http://localhost:5176/remoteEntry.js',
        },
        mfe_transfer: {
          type: 'module',
          name: 'mfe_transfer',
          entry: process.env.MFE_TRANSFER_ENTRY_URL || 'http://localhost:5177/remoteEntry.js',
        },
        mfe_bill_payment: {
          type: 'module',
          name: 'mfe_bill_payment',
          entry: process.env.MFE_BILL_PAYMENT_ENTRY_URL || 'http://localhost:5178/remoteEntry.js',
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
      },
    }),
  ],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  build: {
    target: 'esnext',
    modulePreload: false,
  },
});
