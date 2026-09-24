# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f mfe-wallet/Dockerfile \
#   --build-arg VITE_WALLET_SERVICE_URL=http://api.ewallet-lab.local \
#   -t ewallet-lab/mfe-wallet:local .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci

# See mfe-auth/Dockerfile for why this must be a build arg, not a runtime env var.
ARG VITE_WALLET_SERVICE_URL
ENV VITE_WALLET_SERVICE_URL=${VITE_WALLET_SERVICE_URL}
RUN npm run build -w mfe-wallet

FROM nginx:1.27-alpine
COPY --from=build /repo/mfe-wallet/dist /usr/share/nginx/html
COPY mfe-wallet/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
