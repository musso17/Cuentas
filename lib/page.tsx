'use client';

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import Sidebar from '../components/layout/Sidebar';
import HomePage from '../components/pages/HomePage';
import BudgetsPage from '../components/pages/BudgetsPage';
import SavingsPage from '../components/pages/SavingsPage';
import DebtsPage from '../components/pages/DebtsPage';
import NewTransactionPage from '../components/pages/NewTransactionPage';
import LoginPage from '../components/pages/LoginPage';
import { Page } from '../types';

export default function Home() {
  const { user, loadDemoData } = useFinanceStore();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Cargar datos de demostración si no hay usuario
    if (!user) {
      loadDemoData();
    }
  }, [user, loadDemoData]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNewTransaction={() => setIsModalOpen(true)} />;
      case 'budgets':
        return <BudgetsPage />;
      case 'savings':
        return <SavingsPage />;
      case 'debts':
        return <DebtsPage />;
      default:
        return <HomePage onNewTransaction={() => setIsModalOpen(true)} />;
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onNewTransaction={() => setIsModalOpen(true)}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderPage()}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-foreground hover:text-gray-400"
            >
              &times;
            </button>
            <NewTransactionPage onTransactionAdded={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}