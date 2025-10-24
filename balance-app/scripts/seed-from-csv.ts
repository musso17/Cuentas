import { parseFinancialCsv } from './lib/parse-csv';

const main = () => {
  try {
    const result = parseFinancialCsv();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('[seed-from-csv] Error leyendo el CSV:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

main();
