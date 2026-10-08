import { API_BASE, http } from './http';

export type SavingsGoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type SavingsGoalDto = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: SavingsGoalStatus;
  progressPct: number;
  createdAt: string;
  updatedAt: string;
};

export type SavingsGoalTransactionDto = {
  id: string;
  goalId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  createdAt: string;
};

export type SavingsGoalDetailDto = {
  goal: SavingsGoalDto;
  transactions: SavingsGoalTransactionDto[];
};

export type CreateSavingsGoalRequest = {
  userId: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  initialDepositAmount?: number;
  stepUpConfirmed?: boolean;
};

export type DepositSavingsGoalRequest = {
  amount: number;
  stepUpConfirmed?: boolean;
};

export type WithdrawSavingsGoalRequest = {
  amount: number;
};

export const savingsGoalService = {
  getDisclaimer: () =>
    http.get<{ title: string; disclaimer: string }>(`${API_BASE.wallet}/savings-goals/disclaimer`),

  createGoal: (req: CreateSavingsGoalRequest) =>
    http.post<SavingsGoalDto>(`${API_BASE.wallet}/savings-goals`, req),

  getGoals: (userId: string) =>
    http.get<SavingsGoalDto[]>(`${API_BASE.wallet}/savings-goals?userId=${encodeURIComponent(userId)}`),

  getGoalDetail: (id: string) =>
    http.get<SavingsGoalDetailDto>(`${API_BASE.wallet}/savings-goals/${id}`),

  deposit: (id: string, req: DepositSavingsGoalRequest) =>
    http.post<SavingsGoalDto>(`${API_BASE.wallet}/savings-goals/${id}/deposit`, req),

  withdraw: (id: string, req: WithdrawSavingsGoalRequest) =>
    http.post<SavingsGoalDto>(`${API_BASE.wallet}/savings-goals/${id}/withdraw`, req),
};

