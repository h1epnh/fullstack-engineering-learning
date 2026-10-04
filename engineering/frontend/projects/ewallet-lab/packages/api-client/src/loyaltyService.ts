import { API_BASE, http } from './http';

/**
 * Issue #19 — "Điểm thưởng" (loyalty-service). A mock in-house program: no real partner, brand or
 * voucher catalog behind it; the only reward is cashback into the user's own main wallet.
 */
export type LoyaltyEntry = {
  id: string;
  kind: 'EARN' | 'REDEEM';
  points: number;
  amountVnd: number;
  tier: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
};

export type LoyaltyTier = { name: string; minSpend: number; multiplier: number };

export type Loyalty = {
  pointsBalance: number;
  lifetimeEarned: number;
  pointsValueVnd: number;
  tier: string;
  tierMultiplier: number;
  qualifyingSpend: number;
  tierWindowMonths: number;
  nextTier: string | null;
  nextTierMinSpend: number | null;
  spendPerPoint: number;
  pointValueVnd: number;
  minRedeemPoints: number;
  enrolledAt: string;
  synced: boolean;
  tiers: LoyaltyTier[];
  history: LoyaltyEntry[];
};

export const loyaltyService = {
  get: (userId: string) => http.get<Loyalty>(`${API_BASE.loyalty}/loyalty/${userId}`),

  redeem: (userId: string, points: number) =>
    http.post<Loyalty>(`${API_BASE.loyalty}/loyalty/${userId}/redemptions`, { points }),
};
