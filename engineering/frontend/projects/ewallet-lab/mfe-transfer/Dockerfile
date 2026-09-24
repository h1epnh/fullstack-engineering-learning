# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f mfe-transfer/Dockerfile \
#   --build-arg VITE_USER_SERVICE_URL=http://api.ewallet-lab.local \
#   --build-arg VITE_TRANSFER_SERVICE_URL=http://api.ewallet-lab.local \
#   --build-arg VITE_TOPUP_SERVICE_URL=http://api.ewallet-lab.local \
#   --build-arg VITE_PAYMENT_REQUEST_SERVICE_URL=http://api.ewallet-lab.local \
#   --build-arg VITE_LUCKY_MONEY_SERVICE_URL=http://api.ewallet-lab.local \
#   -t ewallet-lab/mfe-transfer:local .
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci

# All five needed: user-service for the recipient-name preview lookup, transfer-service for the
# P2P transfer call, topup-service for bank-transfer-out (see BankTransferOutController.java —
# reuses topup-service's DB/IPN infra instead of adding one to transfer-service), (issue #3/#8)
# payment-request-service for payment-link + payment-reminder, and (issue #10) lucky-money-service.
# See mfe-auth/Dockerfile for why these are build args, not runtime env.
ARG VITE_USER_SERVICE_URL
ARG VITE_TRANSFER_SERVICE_URL
ARG VITE_TOPUP_SERVICE_URL
ARG VITE_PAYMENT_REQUEST_SERVICE_URL
ARG VITE_LUCKY_MONEY_SERVICE_URL
ENV VITE_USER_SERVICE_URL=${VITE_USER_SERVICE_URL}
ENV VITE_TRANSFER_SERVICE_URL=${VITE_TRANSFER_SERVICE_URL}
ENV VITE_TOPUP_SERVICE_URL=${VITE_TOPUP_SERVICE_URL}
ENV VITE_PAYMENT_REQUEST_SERVICE_URL=${VITE_PAYMENT_REQUEST_SERVICE_URL}
ENV VITE_LUCKY_MONEY_SERVICE_URL=${VITE_LUCKY_MONEY_SERVICE_URL}
RUN npm run build -w mfe-transfer

FROM nginx:1.27-alpine
COPY --from=build /repo/mfe-transfer/dist /usr/share/nginx/html
COPY mfe-transfer/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
