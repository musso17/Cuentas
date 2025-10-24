import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { MonthlyBalance } from '@/lib/types';

type OverviewCardsProps = {
  current: MonthlyBalance;
  previous?: MonthlyBalance;
};

export const OverviewCards = ({ current, previous }: OverviewCardsProps) => {
  const incomeDelta = previous ? current.totalIncome - previous.totalIncome : 0;
  const expenseDelta = previous ? current.totalExpense - previous.totalExpense : 0;
  const annualGoal = 50000;
  const amountRemaining = Math.max(0, annualGoal - current.netSavings);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card title="Ingresos del mes">
        <p className="text-2xl font-semibold text-zinc-900">{formatCurrency(current.totalIncome)}</p>
        {previous ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            {incomeDelta >= 0 ? '+' : '-'}
            {formatCurrency(Math.abs(incomeDelta))}
            vs mes anterior
          </p>
        ) : null}
      </Card>

      <Card title="Gastos del mes">
        <p className="text-2xl font-semibold text-zinc-900">{formatCurrency(current.totalExpense)}</p>
        {previous ? (
          <p className="flex items-center gap-2 text-sm text-rose-500">
            <TrendingDown className="h-4 w-4" />
            {expenseDelta <= 0 ? '-' : '+'}
            {formatCurrency(Math.abs(expenseDelta))}
            vs mes anterior
          </p>
        ) : null}
      </Card>

      <Card title="Ahorro neto">
        <p className="text-2xl font-semibold text-zinc-900">{formatCurrency(current.netSavings)}</p>
        <p className="text-sm text-zinc-500">
          Meta anual: {formatCurrency(annualGoal)} · Resta {formatCurrency(amountRemaining)}
        </p>
      </Card>

      <Card title="Tasa de ahorro">
        <p className="text-2xl font-semibold text-zinc-900">{formatPercent(current.savingsRate)}</p>
        <p className="text-sm text-zinc-500">Objetivo mínimo 25 %</p>
      </Card>
    </div>
  );
};
