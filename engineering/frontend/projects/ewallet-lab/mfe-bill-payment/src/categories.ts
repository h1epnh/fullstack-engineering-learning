import type { BillCategory } from '@ewallet-lab/api-client';

/** Vietnamese labels for the mock biller categories — see bill-payment-service's
 * BillCategory.java for why these are deliberately generic, not a real biller brand. */
export const BILL_CATEGORIES: { key: BillCategory; icon: string; label: string }[] = [
  { key: 'ELECTRICITY', icon: 'bolt', label: 'Tiền điện' },
  { key: 'WATER', icon: 'water_drop', label: 'Tiền nước' },
  { key: 'INTERNET', icon: 'wifi', label: 'Internet' },
  { key: 'TV_CABLE', icon: 'live_tv', label: 'Truyền hình cáp' },
];
