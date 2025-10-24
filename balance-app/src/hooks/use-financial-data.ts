import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import type { Category, Debt, MonthlyBalance, SavingGoal, Transaction } from '@/lib/types';
import {
  categories as mockCategories,
  debts as mockDebts,
  monthlyBalances as mockMonthlyBalances,
  savingsGoals as mockSavings,
  transactions as mockTransactions,
} from '@/lib/mock-data';

type MonthlyBalanceRow = {
  month: string;
  total_income: number | null;
  total_expense: number | null;
  net_savings: number | null;
  savings_rate: number | null;
};

type CategoryRow = {
  id: string;
  name: string;
  type: Category['type'];
  monthly_budget: number | null;
};

type PaymentMethodRow = {
  id: string;
  name: string;
  type: NonNullable<Transaction['paymentMethod']>['type'];
};

type TransactionRow = {
  id: string;
  type: Transaction['type'];
  amount: number | null;
  currency: string | null;
  occurred_on: string;
  note: string | null;
  categories: CategoryRow | null;
  payment_methods: PaymentMethodRow | null;
  users: { display_name: string | null } | null;
};

type DebtRow = {
  id: string;
  name: string;
  entity: string | null;
  balance: number | null;
  amount_initial: number | null;
  interest_rate: number | null;
  remaining_installments: number | null;
  next_due_date: string | null;
  start_date: string | null;
  status: Debt['status'] | null;
};

type SavingRow = {
  id: string;
  name: string;
  goal_amount: number | null;
  current_amount: number | null;
  target_date: string | null;
  category: string | null;
};

const mapMonthlyBalance = (row: MonthlyBalanceRow): MonthlyBalance => {
  const totalIncome = Number(row.total_income ?? 0);
  const totalExpense = Number(row.total_expense ?? 0);
  const netSavings = Number(row.net_savings ?? totalIncome - totalExpense);
  const savingsRate = Number(
    row.savings_rate ?? (totalIncome > 0 ? netSavings / totalIncome : 0),
  );

  return {
    month: row.month,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
  };
};

const mapTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  type: row.type,
  amount: Number(row.amount ?? 0),
  currency: row.currency ?? 'PEN',
  occurredOn: row.occurred_on,
  category: row.categories
    ? {
        id: row.categories.id,
        name: row.categories.name,
        type: row.categories.type,
        monthlyBudget: row.categories.monthly_budget
          ? Number(row.categories.monthly_budget)
          : undefined,
      }
    : undefined,
  paymentMethod: row.payment_methods
    ? {
        id: row.payment_methods.id,
        name: row.payment_methods.name,
        type: row.payment_methods.type,
      }
    : undefined,
  person: row.users?.display_name ?? undefined,
  note: row.note ?? undefined,
});

const mapDebt = (row: DebtRow): Debt => ({
  id: row.id,
  name: row.name,
  entity: row.entity,
  balance: Number(row.balance ?? 0),
  amountInitial: Number(row.amount_initial ?? 0),
  interestRate: row.interest_rate ? Number(row.interest_rate) : undefined,
  remainingInstallments: row.remaining_installments
    ? Number(row.remaining_installments)
    : undefined,
  nextDueDate: row.next_due_date ?? undefined,
  startDate: row.start_date ?? undefined,
  status: row.status ?? 'pending',
});

const mapSaving = (row: SavingRow): SavingGoal => ({
  id: row.id,
  name: row.name,
  goalAmount: Number(row.goal_amount ?? 0),
  currentAmount: Number(row.current_amount ?? 0),
  targetDate: row.target_date ?? undefined,
  category: row.category ?? undefined,
});

const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  type: row.type,
  monthlyBudget: row.monthly_budget ? Number(row.monthly_budget) : undefined,
});

type FinancialData = {
  monthlyBalances: MonthlyBalance[];
  transactions: Transaction[];
  debts: Debt[];
  savingsGoals: SavingGoal[];
  categories: Category[];
  status: 'loading' | 'ready' | 'error';
  source: 'supabase' | 'mock';
  error?: string;
};

const initialState: FinancialData = {
  monthlyBalances: mockMonthlyBalances,
  transactions: mockTransactions,
  debts: mockDebts,
  savingsGoals: mockSavings,
  categories: mockCategories,
  status: 'loading',
  source: 'mock',
};

export const useFinancialData = () => {
  const [state, setState] = useState<FinancialData>(initialState);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const supabase = createClient();

        const [
          balancesRes,
          transactionsRes,
          debtsRes,
          savingsRes,
          categoriesRes,
        ] = await Promise.all([
          supabase.from('monthly_balances').select('*').order('month'),
          supabase
            .from('transactions')
            .select('*, categories(*), payment_methods(*), users(display_name)')
            .order('occurred_on', { ascending: false })
            .limit(200),
          supabase.from('debts').select('*').order('created_at', { ascending: false }),
          supabase.from('savings').select('*').order('created_at', { ascending: false }),
          supabase.from('categories').select('*').order('name'),
        ]);

        const errors = [
          balancesRes.error,
          transactionsRes.error,
          debtsRes.error,
          savingsRes.error,
          categoriesRes.error,
        ].filter(Boolean);

        if (errors.length) {
          throw errors[0];
        }

        const balances = (balancesRes.data ?? []).map((row) => mapMonthlyBalance(row as MonthlyBalanceRow));
        const transactions = (transactionsRes.data ?? []).map((row) => mapTransaction(row as TransactionRow));
        const debts = (debtsRes.data ?? []).map((row) => mapDebt(row as DebtRow));
        const savingsGoals = (savingsRes.data ?? []).map((row) => mapSaving(row as SavingRow));
        const categories = (categoriesRes.data ?? []).map((row) => mapCategory(row as CategoryRow));

        if (cancelled) return;

        // Use Supabase data only if there is meaningful content, otherwise keep mock
        const hasAnyData =
          balances.length ||
          transactions.length ||
          debts.length ||
          savingsGoals.length ||
          categories.length;

        if (hasAnyData) {
          setState({
            monthlyBalances: balances.length ? balances : mockMonthlyBalances,
            transactions: transactions.length ? transactions : mockTransactions,
            debts: debts.length ? debts : mockDebts,
            savingsGoals: savingsGoals.length ? savingsGoals : mockSavings,
            categories: categories.length ? categories : mockCategories,
            status: 'ready',
            source: 'supabase',
          });
        } else {
          setState((prev) => ({
            ...prev,
            status: 'ready',
            source: 'mock',
          }));
        }
      } catch (error) {
        if (cancelled) return;
        console.error('[useFinancialData] Error fetching Supabase data', error);
        setState((prev) => ({
          ...prev,
          status: 'error',
          source: 'mock',
          error: error instanceof Error ? error.message : 'Error desconocido al conectar con Supabase',
        }));
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
