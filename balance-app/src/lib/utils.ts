import { type ClassValue, clsx } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatCurrency = (value: number, currency: string = 'PEN') =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number) =>
  new Intl.NumberFormat('es-PE', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
