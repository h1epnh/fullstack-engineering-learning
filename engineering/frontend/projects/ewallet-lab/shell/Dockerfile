# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f shell/Dockerfile \
#   --build-arg MFE_AUTH_ENTRY_URL=https://mfe-auth.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_WALLET_ENTRY_URL=https://mfe-wallet.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_TOPUP_ENTRY_URL=https://mfe-topup.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_TRANSFER_ENTRY_URL=https://mfe-transfer.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_BILL_PAYMENT_ENTRY_URL=https://mfe-bill-payment.ewallet-lab.local/remoteEntry.js \
#   --build-arg VITE_USER_SERVICE_URL=https://api.ewallet-lab.local \
#   -t ewallet-lab/shell:local .
# Issue #41 mixed-content audit: after the Ingress TLS rollout, all of the above must be https —
# a page served over https cannot fetch http:// resources (browser blocks it as mixed content),
# which is exactly what broke `shell` the first time these were baked in as http.
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci

ARG MFE_AUTH_ENTRY_URL
ARG MFE_WALLET_ENTRY_URL
ARG MFE_TOPUP_ENTRY_URL
ARG MFE_TRANSFER_ENTRY_URL
ARG MFE_BILL_PAYMENT_ENTRY_URL
ENV MFE_AUTH_ENTRY_URL=${MFE_AUTH_ENTRY_URL}
ENV MFE_WALLET_ENTRY_URL=${MFE_WALLET_ENTRY_URL}
ENV MFE_TOPUP_ENTRY_URL=${MFE_TOPUP_ENTRY_URL}
ENV MFE_TRANSFER_ENTRY_URL=${MFE_TRANSFER_ENTRY_URL}
ENV MFE_BILL_PAYMENT_ENTRY_URL=${MFE_BILL_PAYMENT_ENTRY_URL}
# Issue #41: Account.tsx (Cá nhân tab) now calls user-service directly to register/check
# WebAuthn (Touch ID) credentials — the shell's first direct backend call, see frontend
# CLAUDE.md's "quên build-arg" recurring bug.
ARG VITE_USER_SERVICE_URL
ENV VITE_USER_SERVICE_URL=${VITE_USER_SERVICE_URL}
RUN npm run build -w shell

FROM nginx:1.27-alpine
COPY --from=build /repo/shell/dist /usr/share/nginx/html
COPY shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
