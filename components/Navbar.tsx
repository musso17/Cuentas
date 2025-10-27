import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import MonthSelector from './MonthSelector';

const Navbar: React.FC = () => {
  const user = useFinanceStore((state) => state.user);

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 h-auto sm:h-16 mb-6">
      <div>
        <MonthSelector />
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">
          Hola, <span className="font-semibold text-foreground">{user?.display_name || 'Usuario'}</span>
        </p>
      </div>
    </header>
  );
};

export default Navbar;