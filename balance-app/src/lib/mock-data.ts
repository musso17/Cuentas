import type {
  Category,
  Debt,
  MonthlyBalance,
  PaymentMethod,
  SavingGoal,
  Transaction,
} from './types';

export const monthOrder = [
  '2024-10-01',
  '2024-11-01',
  '2024-12-01',
  '2025-01-01',
  '2025-02-01',
  '2025-03-01',
  '2025-04-01',
  '2025-05-01',
  '2025-06-01',
  '2025-07-01',
  '2025-08-01',
] as const;

export const monthlyBalances: MonthlyBalance[] = [
  { month: '2024-10-01', totalIncome: 31102, totalExpense: 19250, netSavings: 11852, savingsRate: 0.38 },
  { month: '2024-11-01', totalIncome: 17750, totalExpense: 16580, netSavings: 1170, savingsRate: 0.07 },
  { month: '2024-12-01', totalIncome: 31000, totalExpense: 21840, netSavings: 9160, savingsRate: 0.30 },
  { month: '2025-01-01', totalIncome: 17750, totalExpense: 15840, netSavings: 1910, savingsRate: 0.11 },
  { month: '2025-02-01', totalIncome: 17750, totalExpense: 16120, netSavings: 1630, savingsRate: 0.09 },
  { month: '2025-03-01', totalIncome: 27750, totalExpense: 20230, netSavings: 7520, savingsRate: 0.27 },
  { month: '2025-04-01', totalIncome: 17750, totalExpense: 16890, netSavings: 860, savingsRate: 0.05 },
  { month: '2025-05-01', totalIncome: 17750, totalExpense: 17240, netSavings: 510, savingsRate: 0.03 },
  { month: '2025-06-01', totalIncome: 17750, totalExpense: 16690, netSavings: 1060, savingsRate: 0.06 },
  { month: '2025-07-01', totalIncome: 31000, totalExpense: 21520, netSavings: 9480, savingsRate: 0.31 },
  { month: '2025-08-01', totalIncome: 31000, totalExpense: 20560, netSavings: 10440, savingsRate: 0.34 },
];

export const categories: Category[] = [
  { id: 'cat-housing', name: 'Mantenimiento', type: 'expense', monthlyBudget: 2500 },
  { id: 'cat-debt', name: 'Deudas', type: 'expense', monthlyBudget: 4200 },
  { id: 'cat-entertainment', name: 'Entretenimiento', type: 'expense', monthlyBudget: 1200 },
  { id: 'cat-pets', name: 'Gatos', type: 'expense', monthlyBudget: 900 },
  { id: 'cat-extra', name: 'Extras', type: 'expense', monthlyBudget: 600 },
  { id: 'cat-income-salary-ana', name: 'Sueldo Ana', type: 'income' },
  { id: 'cat-income-salary-marcelo', name: 'Sueldo Marcelo', type: 'income' },
  { id: 'cat-income-bonus', name: 'Gratificaciones', type: 'income' },
  { id: 'cat-income-savings', name: 'Ahorros', type: 'income' },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm-amex', name: 'Amex', type: 'credit_card' },
  { id: 'pm-cash', name: 'Cash', type: 'cash' },
  { id: 'pm-banca', name: 'Cuenta conjunta', type: 'transfer' },
];

export const transactions: Transaction[] = [
  { id: 'tx-1', type: 'income', amount: 13250, currency: 'PEN', occurredOn: '2025-03-01', category: categories[6], person: 'Marcelo', note: 'Sueldo mensual', paymentMethod: paymentMethods[2] },
  { id: 'tx-2', type: 'income', amount: 13250, currency: 'PEN', occurredOn: '2025-03-01', category: categories[5], person: 'Ana', note: 'Sueldo mensual', paymentMethod: paymentMethods[2] },
  { id: 'tx-3', type: 'expense', amount: 2800, currency: 'PEN', occurredOn: '2025-03-02', category: categories[0], person: 'Marcelo', note: 'Alquiler y mantenimiento', paymentMethod: paymentMethods[2] },
  { id: 'tx-4', type: 'expense', amount: 980, currency: 'PEN', occurredOn: '2025-03-05', category: categories[2], person: 'Ana', note: 'Cena aniversario', paymentMethod: paymentMethods[0] },
  { id: 'tx-5', type: 'expense', amount: 450, currency: 'PEN', occurredOn: '2025-03-07', category: categories[3], person: 'Marcelo', note: 'Control veterinario', paymentMethod: paymentMethods[1] },
  { id: 'tx-6', type: 'expense', amount: 1900, currency: 'PEN', occurredOn: '2025-03-10', category: categories[1], person: 'Ana', note: 'Pago tarjeta crédito' },
  { id: 'tx-7', type: 'income', amount: 7500, currency: 'PEN', occurredOn: '2025-07-15', category: categories[7], person: 'Marcelo', note: 'Gratificación Fiestas Patrias' },
  { id: 'tx-8', type: 'income', amount: 5000, currency: 'PEN', occurredOn: '2024-12-20', category: categories[7], person: 'Ana', note: 'Bono de fin de año' },
  { id: 'tx-9', type: 'expense', amount: 1300, currency: 'PEN', occurredOn: '2025-07-18', category: categories[2], person: 'Ana', note: 'Concierto' },
  { id: 'tx-10', type: 'expense', amount: 600, currency: 'PEN', occurredOn: '2025-08-03', category: categories[4], person: 'Marcelo', note: 'Regalo cumpleaños' },
];

export const debts: Debt[] = [
  {
    id: 'debt-1',
    name: 'Préstamo auto',
    entity: 'BCP',
    balance: 18500,
    amountInitial: 32000,
    interestRate: 12.5,
    remainingInstallments: 18,
    nextDueDate: '2025-03-25',
    startDate: '2023-10-01',
    status: 'pending',
  },
  {
    id: 'debt-2',
    name: 'Tarjeta viajes',
    entity: 'BBVA',
    balance: 4200,
    amountInitial: 9500,
    interestRate: 0,
    remainingInstallments: 6,
    nextDueDate: '2025-03-10',
    startDate: '2024-11-01',
    status: 'pending',
  },
  {
    id: 'debt-3',
    name: 'Laptop trabajo',
    entity: 'Interbank',
    balance: 0,
    amountInitial: 5200,
    interestRate: 0,
    remainingInstallments: 0,
    startDate: '2024-01-01',
    status: 'paid',
  },
];

export const savingsGoals: SavingGoal[] = [
  { id: 'saving-1', name: 'Fondo emergencia', goalAmount: 30000, currentAmount: 21400, targetDate: '2025-12-31', category: 'emergency' },
  { id: 'saving-2', name: 'Viaje Cusco', goalAmount: 12000, currentAmount: 8400, targetDate: '2025-07-30', category: 'short_term' },
  { id: 'saving-3', name: 'Inversión ETF', goalAmount: 20000, currentAmount: 15800, category: 'investment' },
];

export const investmentPerformance = [
  { month: '2024-10-01', contributions: 2000, value: 2100 },
  { month: '2024-12-01', contributions: 4200, value: 4500 },
  { month: '2025-03-01', contributions: 8200, value: 8850 },
  { month: '2025-05-01', contributions: 12800, value: 14150 },
  { month: '2025-08-01', contributions: 15800, value: 17650 },
];

export const coupleBudget = [
  { category: 'Mantenimiento', planned: 2500, actual: 2380 },
  { category: 'Deudas', planned: 4200, actual: 4100 },
  { category: 'Entretenimiento', planned: 1200, actual: 1420 },
  { category: 'Gatos', planned: 900, actual: 780 },
  { category: 'Extras', planned: 600, actual: 610 },
];
