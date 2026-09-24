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
    throw new ApiError(res.status, `Request to ${url} failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const http = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
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
};
