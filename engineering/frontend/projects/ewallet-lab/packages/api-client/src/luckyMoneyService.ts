import { API_BASE, http } from './http';

export type LuckyMoneyStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED_REFUNDED';

export type LuckyMoney = {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toPhone: string;
  amount: number;
  message: string | null;
  status: LuckyMoneyStatus;
  createdAt: string;
  expiresAt: string;
  claimedAt: string | null;
  refundedAt: string | null;
};

/** MoMo's verified real 1-recipient lucky money limits (momo.vn/hoi-dap/cach-li-xi-cho-1-nguoi,
 * fetched directly by agent-designer) — mirrors lucky-money-service's SendLuckyMoneyRequestDto. */
export const LUCKY_MONEY_MIN_AMOUNT = 1000;
export const LUCKY_MONEY_MAX_AMOUNT = 20_000_000;

export const luckyMoneyService = {
  send: (fromUserId: string, fromName: string, toPhone: string, amount: number, message?: string) =>
    http.post<LuckyMoney>(`${API_BASE.luckyMoney}/lucky-money`, { fromUserId, fromName, toPhone, amount, message }),

  get: (id: string) => http.get<LuckyMoney>(`${API_BASE.luckyMoney}/lucky-money/${id}`),

  listSent: (userId: string) => http.get<LuckyMoney[]>(`${API_BASE.luckyMoney}/lucky-money/sent/${userId}`),

  listReceived: (userId: string) => http.get<LuckyMoney[]>(`${API_BASE.luckyMoney}/lucky-money/received/${userId}`),

  claim: (id: string, toUserId: string) =>
    http.post<LuckyMoney>(`${API_BASE.luckyMoney}/lucky-money/${id}/claim`, { toUserId }),
};
