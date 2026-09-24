# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f mfe-bill-payment/Dockerfile \
#   --build-arg VITE_BILL_PAYMENT_SERVICE_URL=http://api.ewallet-lab.local \
#   -t ewallet-lab/mfe-bill-payment:local .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci

ARG VITE_BILL_PAYMENT_SERVICE_URL
ENV VITE_BILL_PAYMENT_SERVICE_URL=${VITE_BILL_PAYMENT_SERVICE_URL}
RUN npm run build -w mfe-bill-payment

FROM nginx:1.27-alpine
COPY --from=build /repo/mfe-bill-payment/dist /usr/share/nginx/html
COPY mfe-bill-payment/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
