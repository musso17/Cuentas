import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { parseFinancialCsv, type ParsedRow, type ParsedCsv } from './lib/parse-csv';

type TransactionPayload = {
  couple_id: string;
  user_id: string | null;
  category_id: string | null;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  occurred_on: string;
  note: string | null;
};

type CategoryPayload = {
  couple_id: string;
  name: string;
  type: 'income' | 'expense';
  monthly_budget?: number | null;
};

type MonthlyBalancePayload = {
  couple_id: string;
  month: string;
  total_income: number;
  total_expense: number;
  net_savings: number;
  savings_rate: number;
};

const MONTH_MAP: Record<string, string> = {
  Oct: '2024-10-01',
  Nov: '2024-11-01',
  Dec: '2024-12-01',
  Jan: '2025-01-01',
  Feb: '2025-02-01',
  Mar: '2025-03-01',
  Apr: '2025-04-01',
  May: '2025-05-01',
  Jun: '2025-06-01',
  Jul: '2025-07-01',
  Aug: '2025-08-01',
};

const IGNORED_LABELS = new Set([
  'INGRESOS',
  'EGRESOS',
  'FIJOS (15 c/mes)',
  'DEUDAS (27 C/mes)',
  'OTROS',
  'POSIBLE AHORRO',
]);

const normalizeLabel = (label: string) => label.replace(/\s+/g, ' ').trim();

const deriveCategoryName = (row: ParsedRow) => {
  const base = normalizeLabel(row.label);
  if (/ingresos ana/i.test(row.section)) {
    return `${base} Ana`;
  }
  if (/ingresos marce/i.test(row.section)) {
    return `${base} Marcelo`;
  }
  return base;
};

const classifyRow = (row: ParsedRow): 'income' | 'expense' | null => {
  const section = row.section.toLowerCase();
  const label = row.label.toLowerCase();

  if (IGNORED_LABELS.has(row.label)) return null;
  if (section.includes('ingresos')) return 'income';
  if (label.includes('ingreso')) return 'income';
  if (section.includes('ahorro')) return 'income';
  if (section.includes('egreso')) return 'expense';
  if (section.includes('fijos')) return 'expense';
  if (section.includes('deudas')) return 'expense';
  if (section.includes('otros')) return 'expense';
  if (label.includes('pago') || label.includes('tarjeta')) return 'expense';
  if (label.includes('alquiler') || label.includes('restaurantes') || label.includes('entretenimiento')) {
    return 'expense';
  }

  // Fallback: totals positivos son ingresos, negativos gastos
  if (row.total >= 0) return 'income';
  return 'expense';
};

const derivePerson = (row: ParsedRow): string | null => {
  if (/ana/i.test(row.section)) return 'ana';
  if (/marce/i.test(row.section) || /marcelo/i.test(row.section)) return 'marcelo';
  return null;
};

const monthToDate = (month: string) => {
  const normalized = month.slice(0, 3);
  const entry = MONTH_MAP[normalized as keyof typeof MONTH_MAP];
  if (!entry) {
    throw new Error(`No se pudo mapear el mes ${month} a una fecha YYYY-MM-01`);
  }
  return entry;
};

const buildCategories = (data: ParsedCsv, coupleId: string): CategoryPayload[] => {
  const seen = new Map<string, CategoryPayload>();

  data.dataset.forEach((row) => {
    const type = classifyRow(row);
    if (!type) return;

    const name = deriveCategoryName(row);
    const key = `${type}:${name.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, {
        couple_id: coupleId,
        name,
        type,
        monthly_budget: null,
      });
    }
  });

  return Array.from(seen.values());
};

const buildTransactions = (
  data: ParsedCsv,
  coupleId: string,
  categoryMap: Map<string, string | null>,
  userMap: Map<string, string>,
): TransactionPayload[] => {
  const result: TransactionPayload[] = [];

  data.dataset.forEach((row) => {
    const type = classifyRow(row);
    if (!type) return;

    const categoryName = deriveCategoryName(row);
    const categoryKey = `${type}:${categoryName.toLowerCase()}`;
    const categoryId = categoryMap.get(categoryKey) ?? null;
    const person = derivePerson(row);
    const userId = person ? userMap.get(person) ?? null : null;

    Object.entries(row.monthly).forEach(([month, amount]) => {
      if (!amount) return;
      const occurredOn = monthToDate(month);
      result.push({
        couple_id: coupleId,
        user_id: userId ?? null,
        category_id: categoryId,
        type,
        amount,
        currency: 'PEN',
        occurred_on: occurredOn,
        note: row.section === row.label ? null : `${normalizeLabel(row.section)} · ${normalizeLabel(row.label)}`,
      });
    });
  });

  return result;
};

const buildMonthlyBalances = (data: ParsedCsv, coupleId: string): MonthlyBalancePayload[] =>
  data.resumen.map((row) => ({
    couple_id: coupleId,
    month: monthToDate(row.month),
    total_income: row.ingresos,
    total_expense: row.egresos,
    net_savings: row.balance,
    savings_rate: row.tasaAhorro,
  }));

const ensureEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
};

const chunk = <T,>(items: T[], size: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
};

const main = async () => {
  try {
    const supabaseUrl = ensureEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceKey = ensureEnv('SUPABASE_SERVICE_ROLE_KEY');
    const coupleId = ensureEnv('COUPLE_ID');

    const parsed = parseFinancialCsv();
    console.log(`Procesando archivo ${parsed.source} · filas: ${parsed.dataset.length}`);

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name')
      .eq('couple_id', coupleId);
    if (usersError) throw usersError;
    if (!users?.length) {
      throw new Error(`No se encontraron usuarios para la pareja ${coupleId}.`);
    }

    const userMap = new Map<string, string>();
    users.forEach((user) => {
      const key = user.display_name?.toLowerCase();
      if (key) {
        userMap.set(key, user.id);
      }
    });

    if (!userMap.size) {
      throw new Error('No se pudo construir el mapa de usuarios (display_name).');
    }

    const categories = buildCategories(parsed, coupleId);
    console.log(`Insertando/actualizando ${categories.length} categorías…`);

    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'couple_id,name,type' });
    if (categoriesError) throw categoriesError;

    const { data: existingCategories, error: fetchCategoriesError } = await supabase
      .from('categories')
      .select('id, name, type')
      .eq('couple_id', coupleId);
    if (fetchCategoriesError) throw fetchCategoriesError;

    const categoryMap = new Map<string, string | null>();
    existingCategories?.forEach((cat) => {
      const key = `${cat.type}:${cat.name.toLowerCase()}`;
      categoryMap.set(key, cat.id);
    });

    const transactions = buildTransactions(parsed, coupleId, categoryMap, userMap);
    console.log(`Se generaron ${transactions.length} movimientos a sincronizar.`);

    if (process.env.CLEAR_EXISTING === 'true') {
      console.log('Eliminando transacciones existentes de la pareja antes de importar…');
      const { error: deleteError } = await supabase.from('transactions').delete().eq('couple_id', coupleId);
      if (deleteError) throw deleteError;
    }

    console.log('Insertando transacciones en lotes…');
    for (const batch of chunk(transactions, 200)) {
      const { error: batchError } = await supabase.from('transactions').insert(batch);
      if (batchError) throw batchError;
    }

    console.log('Actualizando balances mensuales…');
    const monthlyBalances = buildMonthlyBalances(parsed, coupleId);
    const { error: balancesError } = await supabase
      .from('monthly_balances')
      .upsert(monthlyBalances, { onConflict: 'couple_id,month' });
    if (balancesError) throw balancesError;

    console.log('¡Sincronización completada!');
  } catch (error) {
    console.error('[import-csv-to-supabase] Error:', error);
    process.exit(1);
  }
};

main();
