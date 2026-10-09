import { API_BASE, http } from './http';

export type BillCategory =
  | 'ELECTRICITY'
  | 'WATER'
  | 'INTERNET'
  | 'TV_CABLE'
  | 'DIGITAL_SUBSCRIPTION'
  | 'ENTERTAINMENT_STREAMING'
  | 'APP_STORE_CODE';

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
  discountAmount?: number;
  voucherId?: string;
  finalAmount?: number;
};

/** Issue #26 — Auto-debit Mandates, persisted server-side in bill-payment-service
 * (AutoBillRegistration), NOT in browser localStorage — a mandate registered on one device must
 * be visible/processed by the backend scheduler regardless of which device looks at it later. */
export type AutoBillStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export type AutoBillRegistration = {
  id: string;
  userId: string;
  category: BillCategory;
  customerCode: string;
  maxAmount: number;
  autoPayDay: number;
  status: AutoBillStatus;
  createdAt: string;
  updatedAt: string;
};

export const autoBillService = {
  register: (userId: string, category: BillCategory, customerCode: string, maxAmount: number, autoPayDay: number) =>
    http.post<AutoBillRegistration>(`${API_BASE.billPayment}/bills/auto-pay/register`, {
      userId,
      category,
      customerCode,
      maxAmount,
      autoPayDay,
    }),

  list: (userId: string) =>
    http.get<AutoBillRegistration[]>(`${API_BASE.billPayment}/bills/auto-pay?userId=${userId}`),

  updateStatus: (id: string, status: AutoBillStatus) =>
    http.put<AutoBillRegistration>(`${API_BASE.billPayment}/bills/auto-pay/${id}/status`, { status }),
};

export const billPaymentService = {
  /** Mock biller lookup — see bill-payment-service's BillPaymentService.java Javadoc: the due
   * amount is a deterministic hash of (category, customerCode), not a real biller integration. */
  lookup: (category: BillCategory, customerCode: string) =>
    http.get<BillLookupResponse>(
      `${API_BASE.billPayment}/bills/lookup?category=${category}&customerCode=${encodeURIComponent(customerCode)}`,
    ),

  /** No `amount` param on purpose — the server recomputes it from the same deterministic
   * formula the lookup used, so the payer can never pay a different amount than quoted.
   * `stepUpConfirmed` — issue #15: pass `true` when retrying after the user confirms the
   * (simulated) step-up prompt shown for a 428 response. */
  pay: (
    userId: string,
    category: BillCategory,
    customerCode: string,
    stepUpConfirmed?: boolean,
    voucherId?: string,
  ) =>
    http.post<BillPaymentReceipt>(`${API_BASE.billPayment}/bills/pay`, {
      userId,
      category,
      customerCode,
      stepUpConfirmed,
      voucherId,
    }),
};

// --- Issue #30: Digital Subscriptions & Entertainment Codes ---

export type DigitalServicePackage = {
  packageCode: string;
  packageName: string;
  serviceName: string;
  category: BillCategory;
  price: number;
  duration: string;
  description: string;
};

export type DigitalSubscriptionOrder = {
  id: string;
  userId: string;
  packageCode: string;
  packageName: string;
  category: BillCategory;
  price: number;
  accountIdentifier: string;
  activationCode: string;
  status: string;
  billPaymentId?: string;
  createdAt: string;
};

export type SubscribeDigitalServiceRequest = {
  userId: string;
  packageCode: string;
  accountIdentifier: string;
  stepUpConfirmed?: boolean;
};

export const digitalService = {
  getCatalog: () =>
    http.get<DigitalServicePackage[]>(`${API_BASE.billPayment}/bills/digital-services`),

  subscribe: (request: SubscribeDigitalServiceRequest) =>
    http.post<DigitalSubscriptionOrder>(`${API_BASE.billPayment}/bills/digital-services/subscribe`, request),

  getHistory: (userId: string) =>
    http.get<DigitalSubscriptionOrder[]>(
      `${API_BASE.billPayment}/bills/digital-services/history?userId=${encodeURIComponent(userId)}`,
    ),

  getOrder: (id: string) =>
    http.get<DigitalSubscriptionOrder>(
      `${API_BASE.billPayment}/bills/digital-services/${encodeURIComponent(id)}`,
    ),
};

