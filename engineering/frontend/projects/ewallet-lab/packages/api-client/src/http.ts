export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    // Most of this backend's @ExceptionHandlers return a plain-text body (the precise, already
    // sourced Vietnamese message — e.g. issue #15's step-up requirement) rather than a JSON error
    // envelope. Read it so callers that need the exact reason (not just the status code
    // describeApiError maps) — e.g. the step-up confirmation modal — can show it verbatim.
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, body || `Request to ${url} failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Issue #15 — wallet-service's StepUpRequiredException maps to this status (see wallet-service's
 * WalletController), distinct from the 409s already used for insufficient balance / monthly limit,
 * so callers can tell "confirm step-up and retry this exact request" apart from a hard rejection. */
export const STEP_UP_REQUIRED_STATUS = 428;

export const http = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
};

/**
 * Base URLs for each backend service, overridable per-deployment via Vite env
 * vars. Defaults match engineering/backend/projects/ewallet-lab/docker-compose.yml
 * host port mappings.
 */
export const API_BASE = {
  user: import.meta.env.VITE_USER_SERVICE_URL ?? 'http://localhost:8090',
  wallet: import.meta.env.VITE_WALLET_SERVICE_URL ?? 'http://localhost:8091',
  topup: import.meta.env.VITE_TOPUP_SERVICE_URL ?? 'http://localhost:8092',
  transfer: import.meta.env.VITE_TRANSFER_SERVICE_URL ?? 'http://localhost:8094',
  billPayment: import.meta.env.VITE_BILL_PAYMENT_SERVICE_URL ?? 'http://localhost:8095',
  paymentRequest: import.meta.env.VITE_PAYMENT_REQUEST_SERVICE_URL ?? 'http://localhost:8096',
  luckyMoney: import.meta.env.VITE_LUCKY_MONEY_SERVICE_URL ?? 'http://localhost:8097',
  bnpl: import.meta.env.VITE_BNPL_SERVICE_URL ?? 'http://localhost:8098',
  loyalty: import.meta.env.VITE_LOYALTY_SERVICE_URL ?? 'http://localhost:8099',
  // family-wallet-service and fund-service originally also defaulted to 8098/8099 (dev-dangling
  // branch, never reconciled with bnpl-service/loyalty-service until this merge) — reassigned to
  // 8100/8101 to avoid a real port collision. See backend DESIGN.md/docker-compose.yml.
  familyWallet: import.meta.env.VITE_FAMILY_WALLET_SERVICE_URL ?? 'http://localhost:8100',
  fund: import.meta.env.VITE_FUND_SERVICE_URL ?? 'http://localhost:8101',
  investmentFund: import.meta.env.VITE_INVESTMENT_FUND_SERVICE_URL ?? 'http://localhost:8102',
};
