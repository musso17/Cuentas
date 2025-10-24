import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Debt } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

type DebtsOverviewProps = {
  debts: Debt[];
};

export const DebtsOverview = ({ debts }: DebtsOverviewProps) => {
  const activeDebts = debts.filter((debt) => debt.status === 'pending');
  const paidDebts = debts.filter((debt) => debt.status !== 'pending');
  const totalBalance = activeDebts.reduce((acc, debt) => acc + debt.balance, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Obligaciones activas" footer={`Saldo total pendiente: ${formatCurrency(totalBalance)}`}>
        <ul className="space-y-3">
          {activeDebts.map((debt) => {
            const nextDue = debt.nextDueDate
              ? formatDistanceToNowStrict(new Date(debt.nextDueDate), { locale: es, addSuffix: true })
              : '—';
            const progress =
              debt.amountInitial > 0 ? Math.round(((debt.amountInitial - debt.balance) / debt.amountInitial) * 100) : 0;
            return (
              <li key={debt.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-zinc-900">{debt.name}</p>
                    <p className="text-zinc-500">{debt.entity ?? '—'} · {debt.remainingInstallments ?? 0} cuotas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900">{formatCurrency(debt.balance)}</p>
                    <p className="text-xs text-zinc-500">Siguiente pago {nextDue}</p>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-zinc-900" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Historial" footer={`${paidDebts.length} deudas cerradas`}>
        <ul className="space-y-3">
          {paidDebts.map((debt) => (
            <li key={debt.id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-700">{debt.name}</p>
                <p className="text-xs text-zinc-500">Monto original {formatCurrency(debt.amountInitial)}</p>
              </div>
              <p className="text-xs uppercase text-emerald-600">Finalizado</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
