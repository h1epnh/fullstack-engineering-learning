# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f mfe-topup/Dockerfile \
#   --build-arg VITE_TOPUP_SERVICE_URL=http://api.ewallet-lab.local \
#   --build-arg VITE_WALLET_SERVICE_URL=http://api.ewallet-lab.local \
#   -t ewallet-lab/mfe-topup:local .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci

# See mfe-auth/Dockerfile for why this must be a build arg, not a runtime env var.
# VITE_WALLET_SERVICE_URL is needed too — NapRut.tsx (App.tsx) calls walletService.getBalance()
# directly to show "Ví chính" balance in the Nạp/Rút screen, not just topupService.
ARG VITE_TOPUP_SERVICE_URL
ARG VITE_WALLET_SERVICE_URL
ENV VITE_TOPUP_SERVICE_URL=${VITE_TOPUP_SERVICE_URL}
ENV VITE_WALLET_SERVICE_URL=${VITE_WALLET_SERVICE_URL}
RUN npm run build -w mfe-topup

FROM nginx:1.27-alpine
COPY --from=build /repo/mfe-topup/dist /usr/share/nginx/html
COPY mfe-topup/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
