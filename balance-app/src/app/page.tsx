'use client';

import { useMemo, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { MonthlyFlowChart } from '@/components/dashboard/monthly-flow-chart';
import { CategoryDistributionChart } from '@/components/dashboard/category-distribution-chart';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { AddExpenseForm } from '@/components/transactions/add-expense-form';
import { DebtsOverview } from '@/components/debts/debts-overview';
import { SavingsProgress } from '@/components/savings/savings-progress';
import { BudgetStatus } from '@/components/reports/budget-status';
import { CoupleTeam } from '@/components/users/couple-team';
import { Card } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/use-financial-data';
import { investmentPerformance } from '@/lib/mock-data';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

const monthLabel = (month: string) =>
  new Date(month).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });

const getMonthKey = (value: string) => value.slice(0, 7);

const ModuleWrapper = ({ children }: { children: React.ReactNode }) => (
  <section className="space-y-6">{children}</section>
);

export default function HomePage() {
  const {
    monthlyBalances,
    transactions,
    debts,
    savingsGoals,
    categories,
    paymentMethods,
    status,
    source,
    error,
    refresh,
  } = useFinancialData();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [userSelectedMonth, setUserSelectedMonth] = useState<string | null>(null);

  const latestMonth = monthlyBalances[monthlyBalances.length - 1]?.month ?? '';

  const selectedMonth = useMemo(() => {
    if (userSelectedMonth && monthlyBalances.some((item) => item.month === userSelectedMonth)) {
      return userSelectedMonth;
    }
    return latestMonth;
  }, [userSelectedMonth, monthlyBalances, latestMonth]);

  const currentBalance = useMemo(() => {
    if (!monthlyBalances.length) {
      const fallbackMonth = selectedMonth || new Date().toISOString().slice(0, 10);
      return {
        month: fallbackMonth,
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        savingsRate: 0,
      };
    }
    const fallback = monthlyBalances[monthlyBalances.length - 1];
    return monthlyBalances.find((item) => item.month === selectedMonth) ?? fallback;
  }, [monthlyBalances, selectedMonth]);

  const previousBalance = useMemo(() => {
    if (!monthlyBalances.length) return undefined;
    const index = monthlyBalances.findIndex((item) => item.month === currentBalance.month);
    return index > 0 ? monthlyBalances[index - 1] : undefined;
  }, [monthlyBalances, currentBalance]);

  const monthKey = useMemo(() => getMonthKey(currentBalance.month), [currentBalance.month]);

  const monthlyTransactions = useMemo(
    () => transactions.filter((tx) => getMonthKey(tx.occurredOn) === monthKey),
    [transactions, monthKey],
  );

  const incomes = useMemo(
    () => monthlyTransactions.filter((tx) => tx.type === 'income'),
    [monthlyTransactions],
  );

  const expenses = useMemo(
    () => monthlyTransactions.filter((tx) => tx.type === 'expense'),
    [monthlyTransactions],
  );

  const expenseDistribution = useMemo(() => {
    const mapping = new Map<string, number>();
    expenses.forEach((tx) => {
      const categoryName = tx.category?.name ?? 'Otros';
      mapping.set(categoryName, (mapping.get(categoryName) ?? 0) + tx.amount);
    });
    return Array.from(mapping.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const incomeByPerson = useMemo(() => {
    const mapping = new Map<string, number>();
    incomes.forEach((tx) => {
      const key = tx.person ?? 'Compartido';
      mapping.set(key, (mapping.get(key) ?? 0) + tx.amount);
    });
    return Array.from(mapping.entries()).map(([person, amount]) => ({ person, amount }));
  }, [incomes]);

  const expenseByCategory = useMemo(() => {
    const totals = new Map<string, { categoryName: string; amount: number }>();
    expenses.forEach((tx) => {
      const name = tx.category?.name ?? 'Otros';
      const entry = totals.get(name) ?? { categoryName: name, amount: 0 };
      entry.amount += tx.amount;
      totals.set(name, entry);
    });
    return Array.from(totals.values()).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const budgetRows = useMemo(() => {
    const totals = new Map<string, { category: string; planned: number; actual: number }>();

    categories
      .filter((cat) => cat.type === 'expense')
      .forEach((cat) => {
        totals.set(cat.id, {
          category: cat.name,
          planned: cat.monthlyBudget ?? 0,
          actual: 0,
        });
      });

    expenses.forEach((tx) => {
      const key = tx.category?.id ?? `otros-${tx.category?.name ?? 'Otros'}`;
      const entry = totals.get(key) ?? {
        category: tx.category?.name ?? 'Otros',
        planned: 0,
        actual: 0,
      };
      entry.actual += tx.amount;
      totals.set(key, entry);
    });

    return Array.from(totals.values()).sort((a, b) => b.actual - a.actual);
  }, [categories, expenses]);

  const renderDashboard = () => (
    <ModuleWrapper>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Balance compartido</h1>
          <p className="text-sm text-zinc-500">
            Periodo seleccionado: {monthLabel(currentBalance.month)} · Monto disponible{' '}
            {formatCurrency(currentBalance.netSavings)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Fuente: {source === 'supabase' ? 'Supabase (datos en vivo)' : 'Dataset local de ejemplo'}
            {status === 'loading' ? ' · sincronizando…' : null}
            {status === 'error' && error ? ` · ${error}` : null}
          </p>
        </div>
        <select
          value={userSelectedMonth ?? selectedMonth}
          onChange={(event) => setUserSelectedMonth(event.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm md:w-56"
          disabled={!monthlyBalances.length}
        >
          {monthlyBalances
            .slice()
            .reverse()
            .map((item) => (
              <option key={item.month} value={item.month}>
                {monthLabel(item.month)}
              </option>
            ))}
        </select>
      </div>

      <OverviewCards current={currentBalance} previous={previousBalance} />
      <MonthlyFlowChart data={monthlyBalances} />
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <TransactionsTable transactions={monthlyTransactions.slice(0, 10)} />
        <CategoryDistributionChart data={expenseDistribution} />
      </div>
    </ModuleWrapper>
  );

  const renderTransactions = () => (
    <ModuleWrapper>
      <h2 className="text-2xl font-semibold text-zinc-900">Gastos del mes</h2>
      <AddExpenseForm
        categories={categories}
        paymentMethods={paymentMethods}
        onCreated={async () => {
          await refresh();
        }}
      />
      <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <TransactionsTable transactions={expenses} variant="expenses-simple" />
        <Card title="Distribución por categoría">
          <ul className="space-y-3 text-sm">
            {expenseByCategory.map((item) => (
              <li
                key={item.categoryName}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"
              >
                <span className="font-medium text-zinc-700">{item.categoryName}</span>
                <span className="text-zinc-500">{formatCurrency(item.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </ModuleWrapper>
  );

  const renderIncomes = () => (
    <ModuleWrapper>
      <h2 className="text-2xl font-semibold text-zinc-900">Ingresos del mes</h2>
      <div className="grid gap-4 xl:grid-cols-[1.5fr,1fr]">
        <TransactionsTable transactions={incomes} />
        <Card title="Aportes por persona">
          <ul className="space-y-3 text-sm">
            {incomeByPerson.map((item) => (
              <li
                key={item.person}
                className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3"
              >
                <span className="font-medium text-emerald-700">{item.person}</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(item.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </ModuleWrapper>
  );

  const renderDebts = () => (
    <ModuleWrapper>
      <h2 className="text-2xl font-semibold text-zinc-900">Deudas y amortizaciones</h2>
      <DebtsOverview debts={debts} />
    </ModuleWrapper>
  );

  const renderSavings = () => (
    <ModuleWrapper>
      <h2 className="text-2xl font-semibold text-zinc-900">Ahorros e inversiones</h2>
      <SavingsProgress goals={savingsGoals} performance={investmentPerformance} />
    </ModuleWrapper>
  );

  const renderReports = () => (
    <ModuleWrapper>
      <h2 className="text-2xl font-semibold text-zinc-900">Reportes y alertas</h2>
      <BudgetStatus data={budgetRows} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Ahorro proyectado">
          <p className="text-2xl font-semibold text-zinc-900">
            {formatCurrency(currentBalance.netSavings * 6)}
          </p>
          <p className="text-sm text-zinc-500">Si mantienen la tasa actual durante los próximos seis meses.</p>
        </Card>
        <Card title="Capacidad de deuda">
          <p className="text-2xl font-semibold text-zinc-900">
            {formatCurrency(currentBalance.totalIncome * 0.3)}
          </p>
          <p className="text-sm text-zinc-500">Máximo recomendado para nuevas cuotas (30 % de ingresos).</p>
        </Card>
        <Card title="Alerta de presupuesto">
          <p className="text-2xl font-semibold text-rose-500">
            {formatPercent(
              Math.max(0, (currentBalance.totalExpense - currentBalance.totalIncome) / currentBalance.totalIncome),
            )}
          </p>
          <p className="text-sm text-zinc-500">
            Ajuste sugerido si el gasto supera los ingresos del periodo seleccionado.
          </p>
        </Card>
      </div>
    </ModuleWrapper>
  );

  const renderUsers = () => (
    <ModuleWrapper>
      <h2 className="text-2xl font-semibold text-zinc-900">Usuarios y bitácora</h2>
      <CoupleTeam />
      <Card title="Bitácora reciente">
        <ul className="space-y-3 text-sm">
          {monthlyTransactions.map((tx: Transaction) => (
            <li
              key={tx.id}
              className="flex flex-col gap-1 rounded-xl bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-zinc-900">{tx.category?.name ?? 'Movimiento'}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(tx.occurredOn).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} ·{' '}
                  {tx.person ?? 'Compartido'} · {tx.note ?? 'Sin nota'}
                </p>
              </div>
              <span
                className={
                  tx.type === 'income'
                    ? 'text-sm font-semibold text-emerald-600'
                    : 'text-sm font-semibold text-rose-500'
                }
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </ModuleWrapper>
  );

  const getModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return renderDashboard();
      case 'transactions':
        return renderTransactions();
      case 'incomes':
        return renderIncomes();
      case 'debts':
        return renderDebts();
      case 'savings':
        return renderSavings();
      case 'reports':
        return renderReports();
      case 'users':
        return renderUsers();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 via-white to-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl gap-10 px-6 py-10 lg:px-12">
        <aside className="hidden w-64 shrink-0 lg:block">
          <Navigation active={activeModule} onChange={setActiveModule} />
        </aside>
        <div className="w-full space-y-8">
          <div className="lg:hidden">
            <Navigation active={activeModule} onChange={setActiveModule} />
          </div>
          {getModuleContent()}
        </div>
      </main>
    </div>
  );
}
