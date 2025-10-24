import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyBalance } from '@/lib/types';

type MonthlyFlowChartProps = {
  data: MonthlyBalance[];
};

const monthFormatter = (value: string) =>
  new Date(value).toLocaleDateString('es-PE', { month: 'short' });

const currencyTickFormatter = (value: number) => formatCurrency(value);

export const MonthlyFlowChart = ({ data }: MonthlyFlowChartProps) => (
  <Card title="Flujo mensual consolidado" footer="Valores en soles (PEN)">
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity={0.6} />
              <stop offset="90%" stopColor="#34d399" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
              <stop offset="90%" stopColor="#fb7185" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tickFormatter={monthFormatter} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={currencyTickFormatter} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ label, payload }) => {
              if (!payload?.length) return null;
              const month = new Date(label as string).toLocaleDateString('es-PE', {
                month: 'long',
                year: 'numeric',
              });
              return (
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-lg">
                  <p className="font-semibold capitalize text-zinc-900">{month}</p>
                  {payload.map((entry) => (
                    <p key={entry.dataKey as string} className="text-zinc-500">
                      {entry.name}: <span className="font-medium text-zinc-800">{formatCurrency(entry.value as number)}</span>
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend iconType="circle" />
          <Area type="monotone" dataKey="totalIncome" name="Ingresos" stroke="#047857" fill="url(#incomeColor)" />
          <Area type="monotone" dataKey="totalExpense" name="Gastos" stroke="#dc2626" fill="url(#expenseColor)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
