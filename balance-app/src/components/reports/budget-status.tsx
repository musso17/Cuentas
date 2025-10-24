import { cn, formatCurrency, formatPercent } from '@/lib/utils';

type BudgetDatum = {
  category: string;
  planned: number;
  actual: number;
};

type BudgetStatusProps = {
  data: BudgetDatum[];
};

export const BudgetStatus = ({ data }: BudgetStatusProps) => (
  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-zinc-200 text-sm">
      <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
        <tr>
          <th className="px-4 py-3">Categoría</th>
          <th className="px-4 py-3 text-right">Presupuesto</th>
          <th className="px-4 py-3 text-right">Gastado</th>
          <th className="px-4 py-3 text-right">Variación</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100">
        {data.map((row) => {
          const delta = row.actual - row.planned;
          const percentage = row.planned > 0 ? delta / row.planned : 0;
          return (
            <tr key={row.category} className="hover:bg-zinc-50/80">
              <td className="px-4 py-3 font-medium text-zinc-900">{row.category}</td>
              <td className="px-4 py-3 text-right text-zinc-500">{formatCurrency(row.planned)}</td>
              <td className="px-4 py-3 text-right text-zinc-500">{formatCurrency(row.actual)}</td>
              <td
                className={cn(
                  'px-4 py-3 text-right font-medium',
                  delta <= 0 ? 'text-emerald-600' : 'text-rose-500',
                )}
              >
                {delta > 0 ? '+' : ''}
                {formatCurrency(delta)} ({formatPercent(percentage)})
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
