# Ewallet Lab Web

Microfrontend React app for [`ewallet-lab`](../../../backend/projects/ewallet-lab/). See
[`DESIGN.md`](DESIGN.md) for the architecture analysis (why Module Federation, micro-app map,
cross-app state, and the MoMo UX sources this is grounded in).

## Structure

```
shell/            host app — bottom nav, session, coming-soon screen
mfe-auth/         phone entry + register              → user-service    :8090
mfe-wallet/       balance + transactions (Home/History) → wallet-service :8091
mfe-topup/        link bank + top-up + status polling  → topup-service  :8092
packages/ui/      shared design tokens + components (not federated, see DESIGN.md §3)
packages/api-client/  typed fetch wrappers per backend service
packages/session/     session storage + the useSession hook (shell-owned)
```

## Run

```bash
# 1. Backend (from repo root)
cd engineering/backend/projects/ewallet-lab && docker compose up --build

# 2. Frontend (this directory)
npm install
npm run dev
```

Open http://localhost:5173. First run: enter any `0` + 9-digit phone number — it won't exist yet,
so you'll land on Register; after that it's remembered in `localStorage`.

To work on one micro-app alone (no shell, no other remotes, mock session):
```bash
npm run dev -w mfe-wallet   # or mfe-auth / mfe-topup
```

## Known gaps

See `DESIGN.md` §6 — not browser-tested end-to-end in this environment (build + remote-resolution
verified, no headless browser available here), no `transfer-service`/`bill-payment-service`
micro-apps yet (backends don't exist), no routing library.
