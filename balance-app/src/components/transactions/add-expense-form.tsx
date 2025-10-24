'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import type { Category, PaymentMethod } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';

type AddExpenseFormProps = {
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onCreated: () => Promise<void> | void;
};

type FormState = {
  categoryName: string;
  amount: string;
  detail: string;
  paymentMethod: string;
  person: string;
  date: string;
};

const defaultState = (defaultCategory?: string): FormState => ({
  categoryName: defaultCategory ?? '',
  amount: '',
  detail: '',
  paymentMethod: '',
  person: '',
  date: new Date().toISOString().slice(0, 10),
});

export const AddExpenseForm = ({ categories, paymentMethods, onCreated }: AddExpenseFormProps) => {
  const [form, setForm] = useState<FormState>(defaultState());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const expenseCategories = useMemo(() => {
    const allowedOrder = [
      'Alquiler',
      'Compras Casa',
      'Luz',
      'Teléfono',
      'Mantenimiento',
      'Internet',
      'Psicólogas',
      'Membresías',
      'Carro',
      'Gasolina',
      'Tere',
      'Lavandería',
      'Deporte',
      'Laser',
      'Gatos',
      'Entretenimiento',
      'Restaurantes',
      'Taxis',
      'Extras',
      'Estacionalidad',
      'Mantenimiento Carro',
    ];

    const expenses = categories.filter((category) => category.type === 'expense');
    const lookup = new Map(expenses.map((category) => [category.name, category]));
    const ordered = allowedOrder
      .map((name) => lookup.get(name))
      .filter((category): category is Category => Boolean(category));
    const remaining = expenses.filter((category) => !allowedOrder.includes(category.name));

    return [...ordered, ...remaining];
  }, [categories]);

  useEffect(() => {
    if (!form.categoryName && expenseCategories[0]) {
      setForm(defaultState(expenseCategories[0].name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseCategories]);

  const handleChange = (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryName: form.categoryName,
            amount: form.amount,
            detail: form.detail,
            paymentMethod: form.paymentMethod,
            person: form.person,
            date: form.date,
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? 'No se pudo registrar el gasto.');
        }
        setMessage({
          type: 'success',
          text: `Gasto registrado: ${formatCurrency(Number(form.amount || 0))}`,
        });
        setForm(defaultState(expenseCategories[0]?.name));
        await onCreated();
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Error inesperado al guardar el gasto.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Agregar gasto</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase text-zinc-500">Descripción</label>
          <select
            required
            value={form.categoryName}
            onChange={handleChange('categoryName')}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          >
            {expenseCategories.length === 0 ? (
              <option value="" disabled>
                Sin categorías disponibles
              </option>
            ) : null}
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase text-zinc-500">Monto (S/.)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange('amount')}
            placeholder="0.00"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-medium uppercase text-zinc-500">Detalle</label>
          <textarea
            value={form.detail}
            onChange={handleChange('detail')}
            placeholder="Ej. Comida gatos, medicinas…"
            rows={2}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase text-zinc-500">Tipo de pago</label>
          <input
            list="payment-method-options"
            value={form.paymentMethod}
            onChange={handleChange('paymentMethod')}
            placeholder="Amex, Cash…"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
          <datalist id="payment-method-options">
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.name} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase text-zinc-500">Persona</label>
          <input
            value={form.person}
            onChange={handleChange('person')}
            placeholder="Ana, Marcelo…"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase text-zinc-500">Fecha</label>
          <input
            type="date"
            value={form.date}
            onChange={handleChange('date')}
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>

      {message ? (
        <p
          className={cn(
            'mt-4 rounded-xl px-3 py-2 text-sm',
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600',
          )}
        >
          {message.text}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Registrar gasto'}
        </button>
      </div>
    </form>
  );
};
