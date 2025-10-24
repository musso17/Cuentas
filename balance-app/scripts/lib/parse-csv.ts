import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

export type ParsedRow = {
  section: string;
  label: string;
  monthly: Record<string, number>;
  total: number;
};

export type MonthlySummary = {
  month: string;
  ingresos: number;
  egresos: number;
  balance: number;
  tasaAhorro: number;
};

export type ParsedCsv = {
  source: string;
  months: string[];
  dataset: ParsedRow[];
  resumen: MonthlySummary[];
};

const parseCurrency = (rawValue: string | number | null | undefined) => {
  if (rawValue === null || rawValue === undefined) return 0;
  if (typeof rawValue === 'number') return rawValue;
  const digits = rawValue.replace(/[^\d-]/g, '');
  return digits ? Number(digits) : 0;
};

const findMonthRowIndex = (records: string[][]) =>
  records.findIndex((row) => {
    const normalized = row.map((cell) => cell?.trim().toLowerCase());
    const hasOct = normalized.includes('oct');
    const hasNov = normalized.includes('nov');
    const hasDec = normalized.includes('dic') || normalized.includes('dec');
    return hasOct && hasNov && hasDec;
  });

export const resolveCsvPath = () => {
  const explicitPath = process.env.CSV_SEED_PATH;
  if (explicitPath) {
    return path.resolve(process.cwd(), explicitPath);
  }
  return path.resolve(process.cwd(), '../Cuentas 2026 - Draft.xlsx - Simulación Año.csv');
};

export const parseFinancialCsv = (csvPath?: string): ParsedCsv => {
  const targetPath = csvPath ? path.resolve(csvPath) : resolveCsvPath();
  if (!fs.existsSync(targetPath)) {
    throw new Error(`No se encontró el archivo CSV en ${targetPath}`);
  }

  const contents = fs.readFileSync(targetPath, 'utf8');
  const records = parse(contents, {
    relaxColumnCount: true,
    skipEmptyLines: true,
  }) as string[][];

  const monthRowIndex = findMonthRowIndex(records);
  if (monthRowIndex === -1) {
    throw new Error('No se pudo detectar la fila con los nombres de meses.');
  }

  const monthRow = records[monthRowIndex];
  const totalIndex = monthRow.findIndex((cell) => cell?.trim().toLowerCase() === 'total');
  const months = monthRow
    .slice(1, totalIndex)
    .map((month, idx) => month?.trim() || `Mes ${idx + 1}`);

  const dataset: ParsedRow[] = [];

  let currentSection = 'General';
  const dataRows = records.slice(monthRowIndex + 1);

  dataRows.forEach((row) => {
    const labelRaw = row[0]?.trim();
    if (!labelRaw) return;

    if (/ingresos|egresos|deudas|fijos|ahorros|otros/i.test(labelRaw)) {
      currentSection = labelRaw;
    }

    const monthlyValues: Record<string, number> = {};
    months.forEach((month, idx) => {
      const value = parseCurrency(row[idx + 1]);
      if (value !== 0) {
        monthlyValues[month] = value;
      }
    });

    const total = Object.values(monthlyValues).reduce((acc, value) => acc + value, 0);

    if (Object.keys(monthlyValues).length > 0) {
      dataset.push({
        section: currentSection,
        label: labelRaw,
        monthly: monthlyValues,
        total,
      });
    }
  });

  const findRowByLabel = (label: string) =>
    dataset.find((row) => row.label.trim().toLowerCase() === label.trim().toLowerCase());

  const incomeTotals = findRowByLabel('INGRESOS');
  const expenseTotals = findRowByLabel('EGRESOS');

  const resumen: MonthlySummary[] = months.map((month) => {
    const ingresos = incomeTotals?.monthly[month] ?? 0;
    const egresos = expenseTotals?.monthly[month] ?? 0;
    const balance = ingresos - egresos;
    return {
      month,
      ingresos,
      egresos,
      balance,
      tasaAhorro: ingresos > 0 ? Number((balance / ingresos).toFixed(3)) : 0,
    };
  });

  return {
    source: path.basename(targetPath),
    months,
    dataset,
    resumen,
  };
};
