# Build context is the monorepo root (engineering/frontend/projects/ewallet-lab/), not this
# directory — npm workspaces needs the whole tree to resolve @ewallet-lab/* deps.
# docker build -f mfe-wallet/Dockerfile \
#   --build-arg VITE_USER_SERVICE_URL=https://api.ewallet-lab.local \
#   --build-arg VITE_WALLET_SERVICE_URL=https://api.ewallet-lab.local \
#   --build-arg VITE_TOPUP_SERVICE_URL=https://api.ewallet-lab.local \
#   --build-arg VITE_BNPL_SERVICE_URL=https://api.ewallet-lab.local \
#   --build-arg VITE_LOYALTY_SERVICE_URL=https://api.ewallet-lab.local \
#   --build-arg VITE_FAMILY_WALLET_SERVICE_URL=https://api.ewallet-lab.local \
#   --build-arg VITE_INVESTMENT_FUND_SERVICE_URL=https://api.ewallet-lab.local \
#   -t ewallet-lab/mfe-wallet:local .
#
# Issue #41 follow-up (mixed-content audit): this Dockerfile was accidentally reverted to a
# plain `COPY dist` (no build stage, no ARGs at all) in commit dd6fc9c4 — meaning the running
# image just repackaged whatever `mfe-wallet/dist` happened to be on disk, with none of the
# VITE_*_SERVICE_URL build-args applied. Restored here. Also added VITE_USER_SERVICE_URL
# (Home.tsx eKYC banner calls userService), VITE_TOPUP_SERVICE_URL (TelcoTopup.tsx) and
# VITE_INVESTMENT_FUND_SERVICE_URL (InvestmentFund.tsx) — these were missing even before the
# revert, a separate pre-existing instance of the "forgot a build-arg" bug class in CLAUDE.md.
FROM node:22-alpine AS build
WORKDIR /repo
COPY . .
RUN npm ci

# See mfe-auth/Dockerfile for why this must be a build arg, not a runtime env var.
ARG VITE_USER_SERVICE_URL
ENV VITE_USER_SERVICE_URL=${VITE_USER_SERVICE_URL}
ARG VITE_WALLET_SERVICE_URL
ENV VITE_WALLET_SERVICE_URL=${VITE_WALLET_SERVICE_URL}
# TelcoTopup.tsx calls topup-service directly.
ARG VITE_TOPUP_SERVICE_URL
ENV VITE_TOPUP_SERVICE_URL=${VITE_TOPUP_SERVICE_URL}
# Issue #18: BnplWallet screen calls bnpl-service.
ARG VITE_BNPL_SERVICE_URL
ENV VITE_BNPL_SERVICE_URL=${VITE_BNPL_SERVICE_URL}
# Issue #19: LoyaltyRewards screen calls loyalty-service. Issue #28: VoucherPass.tsx too.
ARG VITE_LOYALTY_SERVICE_URL
ENV VITE_LOYALTY_SERVICE_URL=${VITE_LOYALTY_SERVICE_URL}
# Issue #12 — "Ví Gia Đình" screen (FamilyWallet.tsx) calls family-wallet-service directly.
ARG VITE_FAMILY_WALLET_SERVICE_URL
ENV VITE_FAMILY_WALLET_SERVICE_URL=${VITE_FAMILY_WALLET_SERVICE_URL}
# Issue #25 — InvestmentFund.tsx calls investment-fund-service directly.
ARG VITE_INVESTMENT_FUND_SERVICE_URL
ENV VITE_INVESTMENT_FUND_SERVICE_URL=${VITE_INVESTMENT_FUND_SERVICE_URL}
RUN npm run build -w mfe-wallet

FROM nginx:1.27-alpine
COPY --from=build /repo/mfe-wallet/dist /usr/share/nginx/html
COPY mfe-wallet/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
