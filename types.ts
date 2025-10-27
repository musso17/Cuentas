
export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  auth_user_id: string;
  display_name: string | null;
  household_id: string;
  created_at: string;
}

export type TransactionType = 'ingreso' | 'gasto';
export type TransactionPerson = 'marcelo' | 'ana';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  person: TransactionPerson;
  method: string | null;
  date: string;
  note: string | null;
  household_id: string;
  created_by: string | null;
  created_at: string;
}

export type DebtStatus = 'Pendiente' | 'Pagado';

export interface Debt {
  id: string;
  entity: string;
  amount_initial: number;
  balance: number;
  status: DebtStatus;
  start_date: string | null;
  remaining_installments: number | null;
  household_id: string;
  created_at: string;
}

export interface Saving {
  id: string;
  name: string;
  goal: number | null;
  current: number;
  kind: string | null;
  household_id: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category: string;
  month: string | null; // Permitir que el mes sea nulo para presupuestos plantilla
  amount: number;
  household_id: string;
  created_at: string;
}

// FIX: Create a single source of truth for the Page type to be used across components.
export type Page = 'home' | 'login' | 'dashboard' | 'new' | 'budgets' | 'savings' | 'debts';
