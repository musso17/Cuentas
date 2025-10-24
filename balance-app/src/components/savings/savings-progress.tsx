import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { SavingGoal } from '@/lib/types';

type SavingsProgressProps = {
  goals: SavingGoal[];
  performance: { month: string; contributions: number; value: number }[];
};

export const SavingsProgress = ({ goals, performance }: SavingsProgressProps) => {
  const totalGoal = goals.reduce((acc, goal) => acc + goal.goalAmount, 0);
  const aggregated = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const completion = totalGoal ? Math.round((aggregated / totalGoal) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Metas de ahorro">
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.goalAmount) * 100));
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-zinc-900">{goal.name}</p>
                  <p className="text-zinc-500">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.goalAmount)}</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Avance consolidado: <span className="font-semibold text-zinc-900">{completion}%</span>
        </p>
      </Card>

      <Card title="Performance de inversiones">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performance}>
              <XAxis dataKey="month" tickFormatter={(value) => new Date(value).toLocaleDateString('es-PE', { month: 'short' })} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
                }
              />
              <Line type="monotone" dataKey="contributions" name="Aportes acumulados" stroke="#6366f1" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="value" name="Valor actual" stroke="#22c55e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
