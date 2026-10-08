import { autoBillService, type AutoBillRegistration, type BillCategory } from '@ewallet-lab/api-client';

/** Issue #26 — Auto-debit Mandates. Thin wrappers around `autoBillService`
 * (bill-payment-service's real `/bills/auto-pay/*` endpoints) — mandates are server-side state
 * (processed later by the backend's daily scheduler / trigger-run), NOT browser localStorage.
 * An earlier version of this file stored mandates in localStorage only, which meant a mandate
 * "registered" from the UI never reached the backend and was silently never auto-paid. */
export type { AutoBillRegistration };

/** Register (or renew) an auto-debit mandate for userId+category+customerCode.
 * autoPayDay defaults to today's day-of-month (clamped to 1-28, the backend's valid range) —
 * the scheduler re-runs the same day every month going forward. */
export function registerMandate(
  userId: string,
  category: BillCategory,
  customerCode: string,
  maxAmount: number,
): Promise<AutoBillRegistration> {
  const autoPayDay = Math.min(28, Math.max(1, new Date().getDate()));
  return autoBillService.register(userId, category, customerCode, maxAmount, autoPayDay);
}

export function loadMandates(userId: string): Promise<AutoBillRegistration[]> {
  return autoBillService.list(userId);
}

export function cancelMandate(mandateId: string): Promise<AutoBillRegistration> {
  return autoBillService.updateStatus(mandateId, 'CANCELLED');
}
