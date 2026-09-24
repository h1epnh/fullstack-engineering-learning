# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f mfe-auth/Dockerfile \
#   --build-arg VITE_USER_SERVICE_URL=http://api.ewallet-lab.local \
#   -t ewallet-lab/mfe-auth:local .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci

# Baked in at build time — Vite resolves import.meta.env.VITE_* when it builds the static
# bundle, there's no server process here to read this at runtime. Must be a URL the BROWSER
# can reach (the public Ingress host), not the in-cluster Service DNS name.
ARG VITE_USER_SERVICE_URL
ENV VITE_USER_SERVICE_URL=${VITE_USER_SERVICE_URL}
RUN npm run build -w mfe-auth

FROM nginx:1.27-alpine
COPY --from=build /repo/mfe-auth/dist /usr/share/nginx/html
COPY mfe-auth/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
