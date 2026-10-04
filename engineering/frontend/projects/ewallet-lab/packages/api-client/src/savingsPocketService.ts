import { API_BASE, http } from './http';

/**
 * Issue #13 — "Túi Thần Tài". Served by wallet-service itself (operator's architecture decision on
 * issue #13, option (a) — bảng mới `SavingsPocket` trong cùng DB, không phải service riêng), so
 * this reuses {@code API_BASE.wallet} rather than adding a new base URL.
 */
export type SavingsPocketResponse = {
  opened: boolean;
  balance: number;
  annualRate: number | null;
  openedAt: string | null;
};

export const savingsPocketService = {
  view: (userId: string) => http.get<SavingsPocketResponse>(`${API_BASE.wallet}/wallets/${userId}/savings-pocket`),

  open: (userId: string, amount: number) =>
    http.post<SavingsPocketResponse>(`${API_BASE.wallet}/wallets/${userId}/savings-pocket/open`, { amount }),

  deposit: (userId: string, amount: number) =>
    http.post<SavingsPocketResponse>(`${API_BASE.wallet}/wallets/${userId}/savings-pocket/deposit`, { amount }),

  withdraw: (userId: string, amount: number) =>
    http.post<SavingsPocketResponse>(`${API_BASE.wallet}/wallets/${userId}/savings-pocket/withdraw`, { amount }),
};
