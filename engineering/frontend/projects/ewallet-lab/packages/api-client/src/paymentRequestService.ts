import { API_BASE, http } from './http';

/** Mirrors payment-request-service's PaymentRequestKind — see its javadoc for why issue #3
 * (payment-link) and #8 (payment-reminder) share one domain model. */
export type PaymentRequestKind = 'LINK' | 'REMINDER';

export type PaymentRequestStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export type PaymentRequest = {
  id: string;
  kind: PaymentRequestKind;
  creatorUserId: string;
  creatorName: string;
  creatorPhone: string;
  targetUserId: string | null;
  targetPhone: string | null;
  amount: number;
  message: string | null;
  status: PaymentRequestStatus;
  createdAt: string;
  expiresAt: string | null;
  paidAt: string | null;
  paidByUserId: string | null;
  /** Issue #11 — non-null only for a split-bill share (kind is still `LINK`, see backend
   * PaymentRequest.groupId's javadoc for why no new enum value was added). */
  groupId: string | null;
  groupTotal: number | null;
  groupLabel: string | null;
};

/** Issue #11 — "Danh sách đã thu" for one split-bill group. */
export type SplitGroup = {
  groupId: string;
  groupLabel: string;
  groupTotal: number;
  totalCollected: number;
  totalRemaining: number;
  shares: PaymentRequest[];
};

export const paymentRequestService = {
  // ---- Issue #3: payment link ----
  createLink: (creatorUserId: string, creatorPhone: string, creatorName: string, amount: number, message?: string) =>
    http.post<PaymentRequest>(`${API_BASE.paymentRequest}/payment-requests/links`, {
      creatorUserId,
      creatorPhone,
      creatorName,
      amount,
      message,
    }),

  /** Payer's confirm screen — looked up by opaque token, not by phone (the payer doesn't know
   * the creator's phone number ahead of time, unlike today's regular P2P flow). */
  getLink: (token: string) => http.get<PaymentRequest>(`${API_BASE.paymentRequest}/payment-requests/links/${token}`),

  payLink: (token: string, payerUserId: string) =>
    http.post<PaymentRequest>(`${API_BASE.paymentRequest}/payment-requests/links/${token}/pay`, { payerUserId }),

  cancelLink: (token: string, creatorUserId: string) =>
    http.post<PaymentRequest>(`${API_BASE.paymentRequest}/payment-requests/links/${token}/cancel`, { creatorUserId }),

  // ---- Issue #8: payment reminder ----
  createReminder: (
    creatorUserId: string,
    creatorPhone: string,
    creatorName: string,
    targetPhone: string,
    amount: number,
    message?: string,
  ) =>
    http.post<PaymentRequest>(`${API_BASE.paymentRequest}/payment-requests/reminders`, {
      creatorUserId,
      creatorPhone,
      creatorName,
      targetPhone,
      amount,
      message,
    }),

  listSentReminders: (userId: string) =>
    http.get<PaymentRequest[]>(`${API_BASE.paymentRequest}/payment-requests/reminders/sent/${userId}`),

  /** No push notification (lab has no such infra) — this list is polled on mount, see
   * PaymentReminderHome.tsx. Ghi rõ trong DESIGN.md đây là adapted, không giả vờ đã làm push. */
  listReceivedReminders: (userId: string) =>
    http.get<PaymentRequest[]>(`${API_BASE.paymentRequest}/payment-requests/reminders/received/${userId}`),

  payReminder: (id: string, payerUserId: string) =>
    http.post<PaymentRequest>(`${API_BASE.paymentRequest}/payment-requests/reminders/${id}/pay`, { payerUserId }),

  // ---- Issue #11: split-bill ----

  /** Even split: pass `peopleCount` (2–20, self-chosen limit — no real MoMo number to bind to,
   * see backend DESIGN.md). Custom split: pass `amounts` instead (2–20 entries) — send exactly one
   * of the two, never both/neither (validated server-side, see CreateSplitRequestDto's javadoc). */
  createSplitEven: (
    creatorUserId: string,
    creatorPhone: string,
    creatorName: string,
    label: string,
    totalAmount: number,
    peopleCount: number,
    message?: string,
  ) =>
    http.post<SplitGroup>(`${API_BASE.paymentRequest}/payment-requests/splits`, {
      creatorUserId,
      creatorPhone,
      creatorName,
      label,
      totalAmount,
      peopleCount,
      message,
    }),

  createSplitCustom: (
    creatorUserId: string,
    creatorPhone: string,
    creatorName: string,
    label: string,
    amounts: number[],
    message?: string,
  ) =>
    http.post<SplitGroup>(`${API_BASE.paymentRequest}/payment-requests/splits`, {
      creatorUserId,
      creatorPhone,
      creatorName,
      label,
      amounts,
      message,
    }),

  /** "Danh sách đã thu" — every share's current status + collected/remaining totals. */
  getSplitGroup: (groupId: string) =>
    http.get<SplitGroup>(`${API_BASE.paymentRequest}/payment-requests/splits/${groupId}`),
};
