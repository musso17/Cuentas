
import React from 'react';
import { HomeIcon, PlusCircleIcon, PieChartIcon, PiggyBankIcon, CreditCardIcon, LogOutIcon } from './ui/Icons';
// FIX: Import the unified Page type to resolve type conflicts.
import type { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout }) => {
  return (
    <aside className="w-64 bg-card border-r border-border p-4 flex flex-col justify-between">
      <div>
        <div className="px-4 mb-8">
          <h2 className="text-xl font-bold font-instrument tracking-tight">Balance Compartido</h2>
        </div>
        <nav className="space-y-2">
          <NavLink
            icon={<HomeIcon className="w-5 h-5" />}
            label="Dashboard"
            isActive={currentPage === 'dashboard'}
            onClick={() => setCurrentPage('dashboard')}
          />
          <NavLink
            icon={<PlusCircleIcon className="w-5 h-5" />}
            label="Nuevo Registro"
            isActive={currentPage === 'new'}
            onClick={() => setCurrentPage('new')}
          />
          <NavLink
            icon={<PieChartIcon className="w-5 h-5" />}
            label="Presupuestos"
            isActive={currentPage === 'budgets'}
            onClick={() => setCurrentPage('budgets')}
          />
          <NavLink
            icon={<PiggyBankIcon className="w-5 h-5" />}
            label="Ahorros"
            isActive={currentPage === 'savings'}
            onClick={() => setCurrentPage('savings')}
          />
           <NavLink
            icon={<CreditCardIcon className="w-5 h-5" />}
            label="Deudas"
            isActive={currentPage === 'debts'}
            onClick={() => setCurrentPage('debts')}
          />
        </nav>
      </div>
      <div>
        <NavLink
            icon={<LogOutIcon className="w-5 h-5" />}
            label="Cerrar Sesión"
            isActive={false}
            onClick={onLogout}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
