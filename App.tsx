import React, { useState, useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/pages/DashboardPage';
import NewTransactionPage from './components/pages/NewTransactionPage';
import BudgetsPage from './components/pages/BudgetsPage';
import SavingsPage from './components/pages/SavingsPage';
import DebtsPage from './components/pages/DebtsPage';
import LoginPage from './components/pages/LoginPage';
import HomePage from './components/pages/HomePage';
import Navbar from './components/Navbar';
import type { Page } from './types';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  // Selecciona cada pieza del estado por separado para evitar re-renders infinitos.
  const loadDemoData = useFinanceStore(state => state.loadDemoData);
  const loading = useFinanceStore(state => state.loading);
  const user = useFinanceStore(state => state.user);

  useEffect(() => {
    // Carga los datos de demostración cuando la aplicación se monta por primera vez.
    loadDemoData();
  }, [loadDemoData]);

  // Muestra un indicador de carga a nivel de aplicación mientras se obtienen los datos iniciales.
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
      Cargando tu espacio financiero...
    </div>
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'new':
        return <NewTransactionPage onTransactionAdded={() => setCurrentPage('dashboard')} />;
      case 'budgets':
        return <BudgetsPage />;
      case 'savings':
        return <SavingsPage />;
      case 'debts':
        return <DebtsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={() => console.log("Logout deshabilitado")} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Navbar />
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;