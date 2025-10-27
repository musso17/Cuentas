import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, Transaction, Debt, Saving, Budget } from '../types';

const createInitialProfile = async (user: User): Promise<UserProfile> => {
    // 1. Create a new household for the user
    const { data: newHousehold, error: householdError } = await supabase
      .from('households')
      .insert({ name: `${user.email?.split('@')[0]}'s Household` })
      .select()
      .single();

    if (householdError) {
      console.error('Error creating household:', householdError);
      throw householdError;
    }

    // 2. Create the user profile linked to the new household
    const { data: newProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        auth_user_id: user.id,
        display_name: user.email?.split('@')[0] || 'Nuevo Usuario',
        household_id: newHousehold.id,
      })
      .select()
      .single();
      
    if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
    }

    return newProfile;
};


export const api = {
  getOrCreateUserProfile: async (): Promise<UserProfile | null> => {
    // Bypassing auth and returning a hardcoded demo user profile.
    // This assumes a "demo" household exists in your Supabase `households` table.
    // You might need to create one manually with this ID.
    const DEMO_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001';
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
    const DEMO_AUTH_USER_ID = 'demo-user-auth-id';
    
    return {
        id: DEMO_USER_ID,
        auth_user_id: DEMO_AUTH_USER_ID,
        display_name: 'Usuario Demo',
        household_id: DEMO_HOUSEHOLD_ID,
        created_at: new Date().toISOString(),
    };
    // NOTE: The original logic for creating a profile is kept below in case you want to restore it.
    // It's currently unreachable.
  },

  // --- DATA ---
  fetchData: async (householdId: string): Promise<{
    transactions: Transaction[];
    debts: Debt[];
    savings: Saving[];
    budgets: Budget[];
  }> => {
    const [transactions, debts, savings, budgets] = await Promise.all([
      supabase.from('transactions').select('*').eq('household_id', householdId).order('date', { ascending: false }),
      supabase.from('debts').select('*').eq('household_id', householdId),
      supabase.from('savings').select('*').eq('household_id', householdId),
      supabase.from('budgets').select('*').eq('household_id', householdId),
    ]);

    if (transactions.error || debts.error || savings.error || budgets.error) {
        console.error("Error fetching data:", {
            transactionsError: transactions.error,
            debtsError: debts.error,
            savingsError: savings.error,
            budgetsError: budgets.error,
        });
        throw new Error('Failed to fetch data from Supabase.');
    }

    return {
      transactions: transactions.data || [],
      debts: debts.data || [],
      savings: savings.data || [],
      budgets: budgets.data || [],
    };
  },

  addTransaction: async (
    newTxData: Omit<Transaction, 'id' | 'household_id' | 'created_at' | 'created_by'>,
    household_id: string,
    created_by: string,
  ): Promise<Transaction> => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...newTxData, household_id, created_by }])
      .select()
      .single();
      
    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
    return data;
  },

  addDebt: async (
    newDebtData: Omit<Debt, 'id' | 'household_id' | 'created_at'>,
    household_id: string,
  ): Promise<Debt> => {
    const { data, error } = await supabase
      .from('debts')
      .insert([{ ...newDebtData, household_id }])
      .select()
      .single();
      
    if (error) {
      console.error('Error adding debt:', error);
      throw error;
    }
    return data;
  },

  updateDebt: async (
    debtId: string,
    updatedDebtData: Partial<Omit<Debt, 'id' | 'household_id' | 'created_at'>>,
  ): Promise<Debt> => {
    const { data, error } = await supabase
      .from('debts')
      .update(updatedDebtData)
      .eq('id', debtId)
      .select()
      .single();

    if (error) {
      console.error('Error updating debt:', error);
      throw error;
    }
    return data;
  },

  deleteDebt: async (debtId: string): Promise<void> => {
    const { error } = await supabase.from('debts').delete().eq('id', debtId);
    if (error) {
      console.error('Error deleting debt:', error);
      throw error;
    }
  },
  
  updateSavings: async (updatedSavings: Saving[]): Promise<Saving[]> => {
    const { data, error } = await supabase
      .from('savings')
      .upsert(updatedSavings)
      .select();
      
    if (error) {
      console.error('Error updating savings:', error);
      throw error;
    }
    return data;
  },
};