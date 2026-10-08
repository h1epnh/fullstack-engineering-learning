import { API_BASE, http } from './http';

export type FundDto = {
  id: string;
  code: string;
  name: string;
  description: string;
  nav: number;
  initialNav: number;
  returnRatePct: number;
  updatedAt: string;
};

export type NavHistoryDto = {
  id: string;
  fundId: string;
  nav: number;
  recordedAt: string;
};

export type FundDetailDto = {
  fund: FundDto;
  history: NavHistoryDto[];
};

export type HoldingDto = {
  fundId: string;
  fundCode: string;
  fundName: string;
  units: number;
  currentNav: number;
  totalInvested: number;
  currentValue: number;
  profitAmount: number;
  profitPct: number;
  updatedAt: string;
};

export type InvestmentOrderType = 'BUY' | 'SELL';

export type InvestmentOrderDto = {
  id: string;
  fundId: string;
  fundCode: string;
  fundName: string;
  type: InvestmentOrderType;
  amount: number;
  units: number;
  nav: number;
  createdAt: string;
};

export type DisclaimerDto = {
  title: string;
  requiredPoints: string[];
  fullNotice: string;
};

export type BuyOrderRequest = {
  userId: string;
  fundId: string;
  amount: number;
  stepUpConfirmed?: boolean;
  disclaimerAccepted: boolean;
};

export type SellOrderRequest = {
  userId: string;
  fundId: string;
  units: number;
  sellAll?: boolean;
};

export const investmentFundService = {
  getDisclaimer: () =>
    http.get<DisclaimerDto>(`${API_BASE.investmentFund}/investments/disclaimer`),

  listFunds: () =>
    http.get<FundDto[]>(`${API_BASE.investmentFund}/investments/funds`),

  getFundDetail: (fundId: string) =>
    http.get<FundDetailDto>(`${API_BASE.investmentFund}/investments/funds/${fundId}`),

  getUserHoldings: (userId: string) =>
    http.get<HoldingDto[]>(`${API_BASE.investmentFund}/investments/holdings?userId=${encodeURIComponent(userId)}`),

  getUserOrders: (userId: string) =>
    http.get<InvestmentOrderDto[]>(`${API_BASE.investmentFund}/investments/orders?userId=${encodeURIComponent(userId)}`),

  buy: (req: BuyOrderRequest) =>
    http.post<InvestmentOrderDto>(`${API_BASE.investmentFund}/investments/orders/buy`, req),

  sell: (req: SellOrderRequest) =>
    http.post<InvestmentOrderDto>(`${API_BASE.investmentFund}/investments/orders/sell`, req),

  tickNav: () =>
    http.post<FundDto[]>(`${API_BASE.investmentFund}/investments/funds/tick-nav`),
};
