# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f shell/Dockerfile \
#   --build-arg MFE_AUTH_ENTRY_URL=http://mfe-auth.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_WALLET_ENTRY_URL=http://mfe-wallet.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_TOPUP_ENTRY_URL=http://mfe-topup.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_TRANSFER_ENTRY_URL=http://mfe-transfer.ewallet-lab.local/remoteEntry.js \
#   --build-arg MFE_BILL_PAYMENT_ENTRY_URL=http://mfe-bill-payment.ewallet-lab.local/remoteEntry.js \
#   -t ewallet-lab/shell:local .
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
RUN npm run build -w shell

FROM nginx:1.27-alpine
COPY --from=build /repo/shell/dist /usr/share/nginx/html
COPY shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
