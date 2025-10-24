import Link from 'next/link';
import type { ComponentType } from 'react';
import { BarChart3, CreditCard, Layers, PiggyBank, ReceiptEuro, ShieldCheck, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const modules = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'transactions', label: 'Gastos', icon: ReceiptEuro },
  { id: 'incomes', label: 'Ingresos', icon: Layers },
  { id: 'debts', label: 'Deudas', icon: CreditCard },
  { id: 'savings', label: 'Ahorros e inversiones', icon: PiggyBank },
  { id: 'reports', label: 'Reportes', icon: ShieldCheck },
  { id: 'users', label: 'Usuarios', icon: Users2 },
] as const;

type NavigationProps = {
  active: string;
  onChange: (moduleId: string) => void;
};

type ModuleButtonProps = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
};

const ModuleButton = ({ label, icon: Icon, active, onClick }: ModuleButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
      active
        ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
        : 'bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
    )}
  >
    <Icon className="h-5 w-5" />
    {label}
  </button>
);

export const Navigation = ({ active, onChange }: NavigationProps) => (
  <nav className="sticky top-6 flex flex-col gap-2">
    <Link href="/" className="mb-4 text-2xl font-semibold text-zinc-900">
      Balance compartido
    </Link>
    {modules.map((module) => (
      <ModuleButton
        key={module.id}
        id={module.id}
        label={module.label}
        icon={module.icon}
        active={module.id === active}
        onClick={() => onChange(module.id)}
      />
    ))}
  </nav>
);
