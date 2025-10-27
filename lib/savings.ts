
import type { Transaction, Saving } from '../types';

// Define the hardcoded savings goals based on user request
const SAVING_GOALS_CONFIG = [
  { id: 'sav_emergency', name: 'Fondo de Emergencia', goalMultiplier: 6, kind: 'Emergencia', contributionRule: 2000, priority: 1 },
  { id: 'sav_london', name: 'Viaje Londres', goal: 30000, kind: 'Viaje', priority: 2 },
  { id: 'sav_ana', name: 'Cumple Ana', goal: 15000, kind: 'Hogar', priority: 2 },
  { id: 'sav_car', name: 'Amortización carro', goal: 5000, kind: 'Deuda', priority: 2 }, // Interpreted as 5000 in local currency
];

export const calculateProjectedSavings = (transactions: Transaction[]): Saving[] => {
  const initialGoals: Saving[] = SAVING_GOALS_CONFIG.map(g => ({
    id: g.id,
    name: g.name,
    // Goal for emergency fund is dynamic, others are fixed
    goal: g.goal || 0,
    current: 0,
    kind: g.kind,
    household_id: 'projected',
    created_at: new Date().toISOString(),
  }));
  
  if (transactions.length === 0) {
    return initialGoals;
  }

  // 1. Group transactions by month (YYYY-MM)
  const monthlyData: Record<string, { income: number, expense: number }> = {};
  transactions.forEach(tx => {
    const month = tx.date.substring(0, 7); // '2024-07'
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    if (tx.type === 'ingreso') {
      monthlyData[month].income += tx.amount;
    } else { // 'gasto'
      monthlyData[month].expense += tx.amount;
    }
  });

  // Sort months chronologically to process in order
  const sortedMonths = Object.keys(monthlyData).sort();

  // 2. Calculate average monthly income for Emergency Fund goal
  const incomeMonths = Object.values(monthlyData).filter(m => m.income > 0);
  const totalIncome = incomeMonths.reduce((sum, m) => sum + m.income, 0);
  const avgMonthlyIncome = incomeMonths.length > 0 ? totalIncome / incomeMonths.length : 0;
  const emergencyFundGoal = avgMonthlyIncome * (SAVING_GOALS_CONFIG.find(g => g.id === 'sav_emergency')?.goalMultiplier || 6);

  // 3. Initialize savings accumulation tracking
  const savingsAccumulation: Record<string, number> = {
    sav_emergency: 0,
    sav_london: 0,
    sav_ana: 0,
    sav_car: 0,
  };

  // 4. Iterate through each month and distribute the balance
  for (const month of sortedMonths) {
    let balance = monthlyData[month].income - monthlyData[month].expense;
    if (balance <= 0) continue;

    // a. Emergency Fund (Priority 1)
    const emergencyFundConfig = SAVING_GOALS_CONFIG.find(g => g.id === 'sav_emergency')!;
    const emergencySpace = emergencyFundGoal - savingsAccumulation.sav_emergency;
    if (emergencySpace > 0) {
      const contribution = Math.min(balance, emergencyFundConfig.contributionRule, emergencySpace);
      savingsAccumulation.sav_emergency += contribution;
      balance -= contribution;
    }

    if (balance <= 0) continue;

    // b. Other goals (Priority 2) - distribute remaining balance equitably
    const otherGoals = SAVING_GOALS_CONFIG.filter(g => g.priority === 2);
    let remainingBalanceForDistribution = balance;

    // Loop to handle redistribution if one goal fills up
    while (remainingBalanceForDistribution > 0.01) {
        const activeGoals = otherGoals.filter(g => savingsAccumulation[g.id] < g.goal!);
        if (activeGoals.length === 0) break;

        const share = remainingBalanceForDistribution / activeGoals.length;
        let undistributedAmount = 0;

        for (const goal of activeGoals) {
            const spaceLeft = goal.goal! - savingsAccumulation[goal.id];
            const contribution = Math.min(share, spaceLeft);
            savingsAccumulation[goal.id] += contribution;
            
            if (share > contribution) {
                undistributedAmount += (share - contribution);
            }
        }
        
        if (undistributedAmount < 0.01) break; // Avoid infinite loops with tiny amounts
        remainingBalanceForDistribution = undistributedAmount;
    }
  }

  // 5. Format final output to match Saving[] type
  const finalSavings: Saving[] = SAVING_GOALS_CONFIG.map(goalConfig => ({
    id: goalConfig.id,
    name: goalConfig.name,
    goal: goalConfig.id === 'sav_emergency' ? emergencyFundGoal : (goalConfig.goal || 0),
    current: savingsAccumulation[goalConfig.id] || 0,
    kind: goalConfig.kind,
    household_id: 'projected', // Not a real DB record
    created_at: new Date().toISOString(),
  }));

  return finalSavings;
};
