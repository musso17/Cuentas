import type { UserProfile, Transaction, Debt, Saving, Budget } from '../types';

export const mockUser: UserProfile = {
  id: 'user_1',
  auth_user_id: 'auth_user_1',
  display_name: 'Marce',
  household_id: 'household_1',
  created_at: new Date().toISOString(),
};

const HOUSEHOLD_ID = mockUser.household_id;
const today = new Date();
const getDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(today.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const mockTransactions: Transaction[] = [];

export const mockDebts: Debt[] = [
  { id: 'debt_1', entity: 'Préstamo Auto', amount_initial: 20000, balance: 12500, status: 'Pendiente', start_date: '2023-01-15', remaining_installments: 18, household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'debt_2', entity: 'Tarjeta de Crédito', amount_initial: 3000, balance: 1200, status: 'Pendiente', start_date: '2024-01-01', remaining_installments: 6, household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'debt_3', entity: 'Préstamo Personal', amount_initial: 5000, balance: 0, status: 'Pagado', start_date: '2022-06-01', remaining_installments: 0, household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
];

export const mockSavings: Saving[] = [
  // El objetivo del fondo de emergencia es 6x el ingreso mensual (16800 * 6 = 100800)
  { id: 'sav_1', name: 'Fondo de Emergencia', goal: 100800, current: 0, kind: 'Emergencia', household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'sav_2', name: 'Viaje Londres', goal: 30000, current: 0, kind: 'Viaje', household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'sav_3', name: 'Cumple Ana', goal: 15000, current: 0, kind: 'Ocasión Especial', household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'sav_4', name: 'Amortización carro', goal: 18500, current: 0, kind: 'Auto', household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() }, // Asumiendo 5k USD a ~3.7 PEN
];

export const mockBudgets: Budget[] = [
  { id: 'bud_1', category: 'Comida', month: '2024-07', amount: 800, household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'bud_2', category: 'Ocio', month: '2024-07', amount: 400, household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'bud_3', category: 'Transporte', month: '2024-07', amount: 300, household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
  { id: 'bud_4', category: 'Supermercado', month: '2024-07', amount: 600, household_id: HOUSEHOLD_ID, created_at: new Date().toISOString() },
];
