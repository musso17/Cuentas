import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const resolveCsvPath = () => {
  const explicitPath = process.env.CSV_SEED_PATH;
  if (explicitPath) {
    return path.resolve(process.cwd(), explicitPath);
  }
  return path.resolve(process.cwd(), '../Cuentas 2026 - Draft.xlsx - Simulación Año.csv');
};

const parseCurrency = (rawValue: string | number | null | undefined) => {
  if (rawValue === null || rawValue === undefined) return 0;
  if (typeof rawValue === 'number') return rawValue;
  const digits = rawValue.replace(/[^\d-]/g, '');
  return digits ? Number(digits) : 0;
};

const readCsv = (csvPath: string) => {
  const contents = fs.readFileSync(csvPath, 'utf8');
  return parse(contents, {
    relaxColumnCount: true,
    skipEmptyLines: true,
  }) as string[][];
};

const findMonthRow = (records: string[][]) =>
  records.findIndex((row) => {
    const normalized = row.map((cell) => cell?.trim().toLowerCase());
    const hasOct = normalized.includes('oct');
    const hasNov = normalized.includes('nov');
    const hasDec = normalized.includes('dec') || normalized.includes('dic');
    return hasOct && hasNov && hasDec;
  });

const main = () => {
  const csvPath = resolveCsvPath();
  if (!fs.existsSync(csvPath)) {
    console.error(`No se encontró el archivo CSV en ${csvPath}`);
    process.exit(1);
  }

  const records = readCsv(csvPath);
  const monthRowIndex = findMonthRow(records);

  if (monthRowIndex === -1) {
    console.error('No se pudo detectar la fila con nombres de meses.');
    process.exit(1);
  }

  const monthRow = records[monthRowIndex];
  const totalIndex = monthRow.findIndex((cell) => cell?.trim().toLowerCase() === 'total');
  const months = monthRow
    .slice(1, totalIndex)
    .map((month, idx) => month?.trim() || `Mes ${idx + 1}`);

  const dataset: {
    section: string;
    label: string;
    monthly: Record<string, number>;
    total: number;
  }[] = [];

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

  const monthlySummary = months.map((month) => {
    const incomes = incomeTotals?.monthly[month] ?? 0;
    const expenses = expenseTotals?.monthly[month] ?? 0;
    const balance = incomes - expenses;
    return {
      month,
      ingresos: incomes,
      egresos: expenses,
      balance,
      tasaAhorro: incomes > 0 ? Number((balance / incomes).toFixed(3)) : 0,
    };
  });

  const payload = {
    source: path.basename(csvPath),
    months,
    dataset,
    resumen: monthlySummary,
  };

  console.log(JSON.stringify(payload, null, 2));
};

main();
