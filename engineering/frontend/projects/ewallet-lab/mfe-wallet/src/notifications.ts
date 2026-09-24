import type { Transaction } from '@ewallet-lab/api-client';

export type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  body: string;
  createdAt: string;
};

/**
 * Notifications are derived from real transaction history, not a fabricated feed — wallet-service
 * already has the data (a TOPUP transaction only exists once topup-service's IPN handler confirms
 * the deposit, see topup-service/web/IpnController.java), so this reuses it rather than standing
 * up a separate notification store for a lab. Read/unread state is per-viewer localStorage only
 * (see loadReadIds/markRead below) — it does not sync across devices or reach the backend, same
 * "best-effort, per-viewer convenience" pattern as packages/session/src/session.ts.
 */
export function buildNotifications(transactions: Transaction[]): NotificationItem[] {
  return transactions
    .filter((tx) => tx.type === 'TOPUP')
    .map((tx) => ({
      id: tx.id,
      icon: 'check_circle',
      title: 'Nạp tiền thành công',
      body: `+${tx.amount.toLocaleString('vi-VN')} đ đã được cộng vào ví${tx.reference ? ` · Mã GD ${tx.reference}` : ''}`,
      createdAt: tx.createdAt,
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  } catch {
    // best-effort only, same reasoning as packages/session/src/session.ts
  }
}
