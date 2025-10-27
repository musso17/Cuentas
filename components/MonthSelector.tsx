import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { ChevronLeftIcon, ChevronRightIcon } from './ui/Icons';

const MonthSelector: React.FC = () => {
  const { selectedDate, setSelectedDate } = useFinanceStore();

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const monthName = selectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={handlePrevMonth} 
        className="p-1.5 border rounded-md hover:bg-secondary disabled:opacity-50" 
        aria-label="Mes anterior"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <span className="w-36 text-center font-medium capitalize">{monthName}</span>
      <button 
        onClick={handleNextMonth} 
        className="p-1.5 border rounded-md hover:bg-secondary disabled:opacity-50" 
        aria-label="Mes siguiente"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MonthSelector;