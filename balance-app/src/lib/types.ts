export type Couple = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
};

export type CategoryType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  monthlyBudget?: number | null;
};

export type PaymentMethod = {
  id: string;
  name: string;
  type: 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'wallet' | 'other';
};

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  occurredOn: string;
  category?: Category | null;
  paymentMethod?: PaymentMethod | null;
  person?: 'tu' | 'ella' | string;
  note?: string | null;
};

export type Debt = {
  id: string;
  name: string;
  entity?: string | null;
  balance: number;
  amountInitial: number;
  interestRate?: number | null;
  remainingInstallments?: number | null;
  nextDueDate?: string | null;
  startDate?: string | null;
  status: 'pending' | 'paid' | 'closed';
};

export type SavingGoal = {
  id: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  category?: string | null;
};

export type MonthlyBalance = {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
};
