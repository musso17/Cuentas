import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const coupleId = process.env.COUPLE_ID;

const ensureEnv = () => {
  if (!supabaseUrl || !serviceRoleKey || !coupleId) {
    throw new Error('Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and COUPLE_ID.');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};

const parseAmount = (value: unknown): number => {
  if (value === null || value === undefined) {
    throw new Error('El monto es obligatorio.');
  }
  const normalized = String(value).replace(',', '.');
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('El monto debe ser un número positivo.');
  }
  return Number(parsed.toFixed(2));
};

type BodyPayload = {
  categoryName?: string;
  amount?: number | string;
  detail?: string | null;
  paymentMethod?: string | null;
  date?: string | null;
  person?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = ensureEnv();
    const payload = (await request.json()) as BodyPayload;

    const categoryName = payload.categoryName?.trim();
    if (!categoryName) {
      return NextResponse.json({ error: 'La descripción es obligatoria.' }, { status: 400 });
    }

    const amount = parseAmount(payload.amount);
    const occurredOn =
      payload.date && !Number.isNaN(Date.parse(payload.date)) ? payload.date : new Date().toISOString().slice(0, 10);
    const detail = payload.detail?.trim() || null;
    const paymentMethodName = payload.paymentMethod?.trim() || null;
    const personName = payload.person?.trim() || null;

    let categoryId: string | null = null;
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('couple_id', coupleId)
      .eq('name', categoryName)
      .eq('type', 'expense')
      .maybeSingle();
    if (categoryError) throw categoryError;

    if (category) {
      categoryId = category.id;
    } else {
      const { data: newCategory, error: newCategoryError } = await supabase
        .from('categories')
        .insert({
          couple_id: coupleId,
          name: categoryName,
          type: 'expense',
        })
        .select('id')
        .single();
      if (newCategoryError) throw newCategoryError;
      categoryId = newCategory.id;
    }

    let paymentMethodId: string | null = null;
    if (paymentMethodName) {
      const { data: existingMethod, error: methodError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('couple_id', coupleId)
        .eq('name', paymentMethodName)
        .maybeSingle();
      if (methodError) throw methodError;

      if (existingMethod) {
        paymentMethodId = existingMethod.id;
      } else {
        const { data: newMethod, error: newMethodError } = await supabase
          .from('payment_methods')
          .insert({
            couple_id: coupleId,
            name: paymentMethodName,
            type: 'other',
          })
          .select('id')
          .single();
        if (newMethodError) throw newMethodError;
        paymentMethodId = newMethod.id;
      }
    }

    let userId: string | null = null;
    if (personName) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('couple_id', coupleId)
        .ilike('display_name', personName)
        .maybeSingle();
      if (userError) throw userError;
      userId = user?.id ?? null;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('transactions')
      .insert({
        couple_id: coupleId,
        category_id: categoryId,
        payment_method_id: paymentMethodId,
        user_id: userId,
        type: 'expense',
        amount,
        currency: 'PEN',
        occurred_on: occurredOn,
        note: detail,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (error) {
    console.error('[transactions POST]', error);
    const message = error instanceof Error ? error.message : 'Error inesperado al crear el gasto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
