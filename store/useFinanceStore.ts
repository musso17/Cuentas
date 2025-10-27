import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { mockTransactions, mockSavings, mockUser } from '../services/mockData';
import type { Transaction, Saving, Debt, Budget, UserProfile, TransactionFormData, DebtFormData } from '../types';

const FIXED_MONTHLY_INCOME = 16800;

interface FinanceState {
  user: UserProfile | null;
  transactions: Transaction[];
  savings: Saving[];
  debts: Debt[];
  budgets: Budget[];
  selectedDate: Date;
  loading: boolean;
  error: string | null;
  loadDemoData: () => void;
  resetState: () => void;
  setSelectedDate: (date: Date) => void;
  addTransaction: (data: TransactionFormData) => Promise<void>;
  addDebt: (data: DebtFormData) => void;
  updateDebt: (id: string, data: Partial<DebtFormData>) => void;
  deleteDebt: (id: string) => void;
  distributeMonthlySavings: () => void;
  amortizeDebt: (debtId: string, amount: number) => void;
}

const carDebt: Debt = {
  id: 'car-debt-1',
  household_id: 'household_1',
  created_at: new Date().toISOString(),
  entity: 'Carro',
  amount_initial: 36128,
  balance: 36128,
  status: 'Pendiente',
  start_date: new Date().toISOString(),
  remaining_installments: 33,
};

const newBudgets: Budget[] = [
  { id: 'b1', household_id: 'household_1', category: 'Alquiler', amount: 10567, month: null, created_at: new Date().toISOString() },
  { id: 'b2', household_id: 'household_1', category: 'Compras Casa', amount: 2415, month: null, created_at: new Date().toISOString() },
  { id: 'b3', household_id: 'household_1', category: 'Luz', amount: 1500, month: null, created_at: new Date().toISOString() },
  { id: 'b4', household_id: 'household_1', category: 'Teléfono', amount: 180, month: null, created_at: new Date().toISOString() },
  { id: 'b5', household_id: 'household_1', category: 'Mantenimiento', amount: 165, month: null, created_at: new Date().toISOString() },
  { id: 'b6', household_id: 'household_1', category: 'Internet', amount: 310, month: null, created_at: new Date().toISOString() },
  { id: 'b7', household_id: 'household_1', category: 'Psicólogas', amount: 99, month: null, created_at: new Date().toISOString() },
  { id: 'b8', household_id: 'household_1', category: 'Membresías', amount: 1240, month: null, created_at: new Date().toISOString() },
  { id: 'b9', household_id: 'household_1', category: 'Carro', amount: 193, month: null, created_at: new Date().toISOString() },
  { id: 'b10', household_id: 'household_1', category: 'Gasolina', amount: 2513, month: null, created_at: new Date().toISOString() },
  { id: 'b11', household_id: 'household_1', category: 'Tere', amount: 120, month: null, created_at: new Date().toISOString() },
  { id: 'b12', household_id: 'household_1', category: 'Lavandería', amount: 400, month: null, created_at: new Date().toISOString() },
  { id: 'b13', household_id: 'household_1', category: 'Deporte', amount: 200, month: null, created_at: new Date().toISOString() },
  { id: 'b14', household_id: 'household_1', category: 'Laser', amount: 360, month: null, created_at: new Date().toISOString() },
  { id: 'b15', household_id: 'household_1', category: 'Gatos', amount: 192, month: null, created_at: new Date().toISOString() },
  { id: 'b16', household_id: 'household_1', category: 'Entretenimiento', amount: 1020, month: null, created_at: new Date().toISOString() },
  { id: 'b17', household_id: 'household_1', category: 'Restaurantes', amount: 100, month: null, created_at: new Date().toISOString() },
  { id: 'b18', household_id: 'household_1', category: 'Taxis', amount: 300, month: null, created_at: new Date().toISOString() },
  { id: 'b19', household_id: 'household_1', category: 'Extras', amount: 120, month: null, created_at: new Date().toISOString() },
];

const initialState = {
  user: null,
  transactions: [],
  savings: [],
  debts: [carDebt],
  budgets: newBudgets,
  selectedDate: new Date(),
  loading: true, // Iniciar en `true` para que la app espere la carga inicial
  error: null,
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  ...initialState,
  loadDemoData: () => {
    console.log(`Cargando todos los datos de demostración.`);
    setTimeout(() => {
      // Se cargan todos los datos de demostración de una sola vez para simular un login exitoso.
      set({
        user: mockUser,
        transactions: mockTransactions,
        savings: mockSavings,
        debts: [carDebt], // Se mantiene la deuda del carro
        budgets: newBudgets, // Se cargan los nuevos presupuestos
        loading: false,
      });
    }, 1000);
  },

  resetState: () => set(initialState),

  setSelectedDate: (date: Date) => set({ selectedDate: date }),

  addTransaction: async (data: TransactionFormData) => {
    const newTransaction: Transaction = {
      ...data,
      id: uuidv4(),
      household_id: get().user?.household_id || 'household_1',
      created_by: get().user?.id || 'user_1',
      created_at: new Date().toISOString(),
    };
    set(state => ({ transactions: [...state.transactions, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }));

    // Si el gasto es del carro, actualiza la deuda
    if (data.category === 'Carro' && data.type === 'gasto') {
      set(state => ({
        debts: state.debts.map(d => {
          if (d.entity === 'Carro') {
            const newBalance = Math.max(0, d.balance - data.amount);
            const newInstallments = d.remaining_installments ? d.remaining_installments - 1 : 0;
            return { ...d, balance: newBalance, remaining_installments: newInstallments, status: newBalance === 0 ? 'Pagado' : d.status };
          }
          return d;
        })
      }));
    }
  },

  addDebt: (data) => {
     const newDebt: Debt = {
      ...data,
      id: uuidv4(),
      household_id: get().user?.household_id || 'household_1',
      created_at: new Date().toISOString(),
    };
    set(state => ({ debts: [...state.debts, newDebt] }));
  },

  updateDebt: (id, data) => {
    set(state => ({
      debts: state.debts.map(d => d.id === id ? { ...d, ...data } : d)
    }));
  },

  deleteDebt: (id) => {
    set(state => ({
      debts: state.debts.filter(d => d.id !== id)
    }));
  },

  amortizeDebt: (debtId, amount) => {
    set(state => ({
      debts: state.debts.map(d => {
        if (d.id === debtId) {
          const newBalance = Math.max(0, d.balance - amount);
          return { ...d, balance: newBalance, status: newBalance === 0 ? 'Pagado' : d.status };
        }
        return d;
      })
    }));
  },
  distributeMonthlySavings: () => {
    const { transactions, selectedDate, savings } = get();
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const monthStr = `${year}-${month}`;

    const totalExpense = transactions
        .filter(tx => tx.type === 'gasto' && tx.date.startsWith(monthStr))
        .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = FIXED_MONTHLY_INCOME - totalExpense;
    let savingsContribution = Math.max(0, balance);

    if (savingsContribution <= 0) {
        console.log("No hay balance positivo para ahorrar este mes.");
        return;
    }

    const newSavings = [...savings];

    // 1. Fondo de Emergencia
    const emergencyFund = newSavings.find(s => s.name === 'Fondo de Emergencia');
    if (emergencyFund && emergencyFund.current < emergencyFund.goal) {
        const emergencyContribution = Math.min(savingsContribution, 2000, emergencyFund.goal - emergencyFund.current);
        emergencyFund.current += emergencyContribution;
        savingsContribution -= emergencyContribution;
    }

    // 2. Resto de metas equitativamente
    const otherGoals = newSavings.filter(s => s.name !== 'Fondo de Emergencia' && s.current < s.goal);
    if (otherGoals.length > 0 && savingsContribution > 0) {
        let remainingToDistribute = savingsContribution;
        let activeGoals = [...otherGoals];

        // Distribuir en rondas para no exceder las metas
        while(remainingToDistribute > 0 && activeGoals.length > 0) {
            const amountPerGoal = remainingToDistribute / activeGoals.length;
            remainingToDistribute = 0;

            activeGoals = activeGoals.filter(goal => {
                const spaceLeft = goal.goal - goal.current;
                const contribution = Math.min(amountPerGoal, spaceLeft);
                goal.current += contribution;
                
                const overflow = amountPerGoal - contribution;
                remainingToDistribute += overflow;

                return goal.current < goal.goal; // Keep in next round if not full
            });
        }
    }

    set({ savings: newSavings });
  }
}));