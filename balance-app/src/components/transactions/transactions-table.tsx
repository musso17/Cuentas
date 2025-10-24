import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type TransactionsTableProps = {
  transactions: Transaction[];
};

export const TransactionsTable = ({ transactions }: TransactionsTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-zinc-200 text-sm">
      <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
        <tr>
          <th className="px-4 py-3">Fecha</th>
          <th className="px-4 py-3">Categoría</th>
          <th className="px-4 py-3">Persona</th>
          <th className="px-4 py-3 text-right">Monto</th>
          <th className="px-4 py-3">Nota</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {transactions.map((tx) => (
          <tr key={tx.id} className="hover:bg-zinc-50/80">
            <td className="px-4 py-3 text-zinc-600">
              {new Date(tx.occurredOn).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
            </td>
            <td className="px-4 py-3 font-medium text-zinc-900">{tx.category?.name ?? 'Sin categoría'}</td>
            <td className="px-4 py-3 text-zinc-600 capitalize">{tx.person ?? 'Compartido'}</td>
            <td className="px-4 py-3 text-right font-semibold text-zinc-900">
              {tx.type === 'expense' ? '-' : '+'}
              {formatCurrency(tx.amount)}
            </td>
            <td className="px-4 py-3 text-zinc-500">{tx.note ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
