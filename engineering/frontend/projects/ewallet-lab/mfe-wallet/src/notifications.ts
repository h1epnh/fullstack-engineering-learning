import {
  type AutoBillRegistration,
  type GiftCardTransfer,
  type LuckyMoney,
  type PaymentRequest,
  type Transaction,
  type UpcomingBillItem,
  autoBillService,
  giftCardService,
  luckyMoneyService,
  paymentRequestService,
  walletService,
} from '@ewallet-lab/api-client';

export type NotificationCategory = 'ACTION_REQUIRED' | 'BALANCE_ALERT' | 'REMINDER_BILL';

export type NotificationAction = {
  label: string;
  routeKey: string;
  payload?: unknown;
};

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  icon: string;
  title: string;
  body: string;
  createdAt: string;
  action?: NotificationAction;
  badge?: string;
  amount?: number;
};

export const NOTIFICATION_EVENT = 'ewallet-notifications-changed';

/**
 * Notifications are derived from real transaction history and microservices state:
 * - ACTION_REQUIRED: Pending Lucky Money (#10/#100), Pending Payment Reminders (#8), Unopened Gift Cards (#34/#92), Bill Spike Alerts (#89).
 * - BALANCE_ALERT: Real wallet balance changes (TOPUP, WITHDRAW, TRANSFER, BILL_PAYMENT, REFUND).
 * - REMINDER_BILL: Upcoming recurring bills & radar alerts (#26/#89).
 * Read/unread state is per-viewer localStorage only (keyed by userId).
 */
export function buildNotifications(
  transactions: Transaction[],
  extras?: {
    luckyMoneys?: LuckyMoney[];
    reminders?: PaymentRequest[];
    giftCards?: GiftCardTransfer[];
    autoBills?: AutoBillRegistration[];
    upcomingBills?: UpcomingBillItem[];
  },
): NotificationItem[] {
  const items: NotificationItem[] = [];

  // 1. BALANCE_ALERT from transactions
  for (const tx of transactions) {
    let title = 'Biến động số dư';
    let icon = 'account_balance_wallet';
    let body = `${tx.amount.toLocaleString('vi-VN')} đ`;

    switch (tx.type) {
      case 'TOPUP':
        title = 'Nạp tiền thành công';
        icon = 'check_circle';
        body = `+${tx.amount.toLocaleString('vi-VN')} đ đã được nạp vào ví${tx.reference ? ` · Mã GD: ${tx.reference}` : ''}`;
        break;
      case 'WITHDRAW':
        title = 'Rút tiền thành công';
        icon = 'remove_circle';
        body = `-${tx.amount.toLocaleString('vi-VN')} đ từ tài khoản ví${tx.reference ? ` · Mã GD: ${tx.reference}` : ''}`;
        break;
      case 'TRANSFER_IN':
        title = 'Nhận tiền thành công';
        icon = 'call_received';
        body = `+${tx.amount.toLocaleString('vi-VN')} đ${tx.note ? ` · ${tx.note}` : ''}${tx.reference ? ` · ${tx.reference}` : ''}`;
        break;
      case 'TRANSFER_OUT':
        title = 'Chuyển tiền thành công';
        icon = 'north_east';
        body = `-${tx.amount.toLocaleString('vi-VN')} đ${tx.note ? ` · ${tx.note}` : ''}${tx.reference ? ` · ${tx.reference}` : ''}`;
        break;
      case 'BILL_PAYMENT':
        title = 'Thanh toán hoá đơn thành công';
        icon = 'receipt_long';
        body = `-${tx.amount.toLocaleString('vi-VN')} đ${tx.reference ? ` · ${tx.reference}` : ''}`;
        break;
      case 'REFUND':
        title = 'Hoàn tiền giao dịch';
        icon = 'replay';
        body = `+${tx.amount.toLocaleString('vi-VN')} đ hoàn tiền về số dư ví`;
        break;
      default:
        title = 'Biến động số dư ví';
        icon = 'payments';
        body = `${tx.amount.toLocaleString('vi-VN')} đ${tx.reference ? ` · ${tx.reference}` : ''}`;
        break;
    }

    items.push({
      id: `tx-${tx.id}`,
      category: 'BALANCE_ALERT',
      icon,
      title,
      body,
      createdAt: tx.createdAt,
      amount: tx.amount,
      action: {
        label: 'Xem lịch sử',
        routeKey: 'history',
      },
    });
  }

  // 2. ACTION_REQUIRED - Lucky money pending
  if (extras?.luckyMoneys) {
    for (const lm of extras.luckyMoneys) {
      if (lm.status === 'PENDING') {
        items.push({
          id: `lm-${lm.id}`,
          category: 'ACTION_REQUIRED',
          icon: 'redeem',
          title: `🧧 Lì xì từ ${lm.fromName || 'bạn bè'}`,
          body: `Bạn nhận được phong bao may mắn ${lm.amount.toLocaleString('vi-VN')} đ!${lm.message ? ` "${lm.message}"` : ''}`,
          createdAt: lm.createdAt,
          amount: lm.amount,
          badge: 'Lì xì',
          action: {
            label: 'Mở lì xì ngay 🧧',
            routeKey: 'lucky-money',
            payload: { luckyMoneyId: lm.id },
          },
        });
      }
    }
  }

  // 3. ACTION_REQUIRED - Payment reminders pending
  if (extras?.reminders) {
    for (const r of extras.reminders) {
      if (r.kind === 'REMINDER' && r.status === 'PENDING') {
        items.push({
          id: `reminder-${r.id}`,
          category: 'ACTION_REQUIRED',
          icon: 'request_quote',
          title: `💸 Lời nhắc trả tiền từ ${r.creatorName || r.creatorPhone || 'bạn bè'}`,
          body: `${r.message ? `"${r.message}": ` : ''}${r.amount.toLocaleString('vi-VN')} đ`,
          createdAt: r.createdAt,
          amount: r.amount,
          badge: 'Chờ trả',
          action: {
            label: 'Thanh toán ngay 💸',
            routeKey: 'payment-reminder',
            payload: { reminderId: r.id },
          },
        });
      }
    }
  }

  // 4. ACTION_REQUIRED - Gift cards unopened
  if (extras?.giftCards) {
    for (const gc of extras.giftCards) {
      if (gc.status === 'SENT') {
        items.push({
          id: `gc-${gc.id}`,
          category: 'ACTION_REQUIRED',
          icon: 'featured_seasonal_and_gifts',
          title: `🎁 Thiệp mừng từ ${gc.senderName}`,
          body: `Bạn có 1 thiệp mừng kèm quà tặng ${gc.amount.toLocaleString('vi-VN')} đ!${gc.customMessage ? ` "${gc.customMessage}"` : ''}`,
          createdAt: gc.createdAt,
          amount: gc.amount,
          badge: 'Thiệp quà',
          action: {
            label: 'Mở thiệp 🎁',
            routeKey: 'send-card',
            payload: { giftCardId: gc.id },
          },
        });
      }
    }
  }

  // 5. ACTION_REQUIRED - Auto bill spike review (#89)
  if (extras?.autoBills) {
    for (const ab of extras.autoBills) {
      if (ab.status === 'HELD_FOR_SPIKE_REVIEW') {
        items.push({
          id: `spike-${ab.id}`,
          category: 'ACTION_REQUIRED',
          icon: 'warning',
          title: `⚠️ Cảnh báo cước tăng đột biến (${ab.category})`,
          body: `Hoá đơn ${ab.customerCode} kỳ này là ${(ab.heldAmount || 0).toLocaleString('vi-VN')} đ (${ab.heldReason || 'tăng vượt trần kiểm soát'}).`,
          createdAt: ab.updatedAt || ab.createdAt,
          amount: ab.heldAmount,
          badge: 'Cảnh báo spike',
          action: {
            label: 'Xem & Duyệt ⚠️',
            routeKey: 'bill-payment',
            payload: { autoBillId: ab.id },
          },
        });
      }
    }
  }

  // 6. REMINDER_BILL - Upcoming bills radar
  if (extras?.upcomingBills) {
    for (const ub of extras.upcomingBills) {
      if (ub.status !== 'PAID') {
        items.push({
          id: `upcoming-${ub.id}`,
          category: 'REMINDER_BILL',
          icon: 'event_upcoming',
          title: `📅 Nhắc lịch thanh toán: ${ub.title}`,
          body: `Hạn thanh toán ${ub.dueDate} · Mã KH: ${ub.customerCode} · Dự kiến: ${ub.expectedAmount.toLocaleString('vi-VN')} đ`,
          createdAt: ub.dueDate || new Date().toISOString(),
          amount: ub.expectedAmount,
          badge: 'Đến hạn',
          action: {
            label: 'Thanh toán ngay',
            routeKey: 'bill-payment',
            payload: { customerCode: ub.customerCode },
          },
        });
      }
    }
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Aggregates notification events across services for a given user.
 * Built with Promise.allSettled for maximum resilience against network/service errors.
 */
export async function loadAllNotifications(userId: string): Promise<NotificationItem[]> {
  const [txRes, lmRes, prRes, gcRes, abRes, radarRes] = await Promise.allSettled([
    walletService.getTransactions(userId),
    luckyMoneyService.listReceived(userId),
    paymentRequestService.listReceivedReminders(userId),
    giftCardService.getReceived(userId),
    autoBillService.list(userId),
    autoBillService.getUpcomingRadar(userId, 30),
  ]);

  const transactions = txRes.status === 'fulfilled' && Array.isArray(txRes.value) ? txRes.value : [];
  const luckyMoneys = lmRes.status === 'fulfilled' && Array.isArray(lmRes.value) ? lmRes.value : [];
  const reminders = prRes.status === 'fulfilled' && Array.isArray(prRes.value) ? prRes.value : [];
  const giftCards = gcRes.status === 'fulfilled' && Array.isArray(gcRes.value) ? gcRes.value : [];
  const autoBills = abRes.status === 'fulfilled' && Array.isArray(abRes.value) ? abRes.value : [];
  const upcomingBills = radarRes.status === 'fulfilled' && Array.isArray(radarRes.value?.items) ? radarRes.value.items : [];

  return buildNotifications(transactions, {
    luckyMoneys,
    reminders,
    giftCards,
    autoBills,
    upcomingBills,
  });
}

const KEY_PREFIX = 'ewallet-lab-read-notifications:';

export function loadReadIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + userId);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markRead(userId: string, id: string): void {
  try {
    const ids = loadReadIds(userId);
    ids.add(id);
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify([...ids]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { userId } }));
    }
  } catch {
    // best-effort only
  }
}

export function markAllRead(userId: string, ids: string[]): void {
  try {
    const set = loadReadIds(userId);
    for (const id of ids) {
      set.add(id);
    }
    localStorage.setItem(KEY_PREFIX + userId, JSON.stringify([...set]));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: { userId } }));
    }
  } catch {
    // best-effort only
  }
}
