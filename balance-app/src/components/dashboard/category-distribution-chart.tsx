import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

type DistributionDatum = {
  name: string;
  value: number;
};

type CategoryDistributionChartProps = {
  data: DistributionDatum[];
};

const palette = ['#6366f1', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#ec4899', '#8b5cf6'];

export const CategoryDistributionChart = ({ data }: CategoryDistributionChartProps) => (
  <Card title="Distribución de gastos">
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value">
            {data.map((entry, idx) => (
              <Cell key={entry.name} fill={palette[idx % palette.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              borderRadius: 12,
              borderColor: '#e5e5e5',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
