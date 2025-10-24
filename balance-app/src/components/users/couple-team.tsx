import { ShieldCheck, Smartphone, Wallet2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const permissions = [
  { title: 'Registro individual', description: 'Cada uno ve y edita sus movimientos personales sin perder la vista compartida.', icon: Smartphone },
  { title: 'Categorías sincronizadas', description: 'Las categorías, presupuestos y metas se comparten automáticamente.', icon: Wallet2 },
  { title: 'Seguridad', description: 'Autenticación con Supabase Auth, invitaciones y registros auditables.', icon: ShieldCheck },
];

export const CoupleTeam = () => (
  <div className="grid gap-4 lg:grid-cols-3">
    {permissions.map((item) => (
      <Card key={item.title} title={item.title}>
        <item.icon className="h-10 w-10 text-zinc-900" />
        <p className="text-sm text-zinc-600">{item.description}</p>
      </Card>
    ))}
  </div>
);
