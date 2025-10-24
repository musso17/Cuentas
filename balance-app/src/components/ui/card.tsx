import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  className?: string;
  footer?: ReactNode;
}>;

export const Card = ({ title, children, footer, className }: CardProps) => (
  <div className={cn('rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur', className)}>
    {title ? <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h3> : null}
    <div className="space-y-2">{children}</div>
    {footer ? <div className="mt-4 border-t border-zinc-100 pt-3 text-sm text-zinc-500">{footer}</div> : null}
  </div>
);
