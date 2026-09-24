import { API_BASE, http } from './http';

/** Deliberately generic household-bill categories, not a real biller brand — see
 * bill-payment-service's BillCategory.java. */
export type BillCategory = 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'TV_CABLE';

export type BillLookupResponse = {
  category: BillCategory;
  customerCode: string;
  customerName: string;
  amount: number;
  period: string;
};

export type BillPaymentReceipt = {
  id: string;
  userId: string;
  category: BillCategory;
  customerCode: string;
  amount: number;
  newBalance: number;
  createdAt: string;
};

export const billPaymentService = {
  /** Mock biller lookup — see bill-payment-service's BillPaymentService.java Javadoc: the due
   * amount is a deterministic hash of (category, customerCode), not a real biller integration. */
  lookup: (category: BillCategory, customerCode: string) =>
    http.get<BillLookupResponse>(
      `${API_BASE.billPayment}/bills/lookup?category=${category}&customerCode=${encodeURIComponent(customerCode)}`,
    ),

  /** No `amount` param on purpose — the server recomputes it from the same deterministic
   * formula the lookup used, so the payer can never pay a different amount than quoted. */
  pay: (userId: string, category: BillCategory, customerCode: string) =>
    http.post<BillPaymentReceipt>(`${API_BASE.billPayment}/bills/pay`, { userId, category, customerCode }),
};
