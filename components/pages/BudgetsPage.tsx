'use client';

import React, { useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Budget } from '../../types';

const BudgetCard: React.FC<{ budget: Budget, spent: number }> = ({ budget, spent }) => {
    const remaining = budget.amount - spent;
    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    const progressColor = progress > 100 ? 'bg-red-500' : 'bg-primary';

    return (
        <Card>
            <CardHeader>
                <CardTitle>{budget.category}</CardTitle>
                <CardDescription>Presupuesto: S/{budget.amount.toLocaleString('es-PE')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-2">
                    <p className="text-sm">Gastado: <span className="font-semibold">S/{spent.toLocaleString('es-PE')}</span></p>
                    <p className={`text-sm ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {remaining >= 0 ? `Restante: S/${remaining.toLocaleString('es-PE')}` : `Excedido: S/${Math.abs(remaining).toLocaleString('es-PE')}`}
                    </p>
                </div>
                 <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
                {progress > 100 && (
                     <div className="w-full bg-secondary rounded-full h-2.5 mt-1 relative">
                        <div className="bg-red-500 h-2.5 rounded-l-full" style={{ width: '100%' }}></div>
                        <div className="bg-red-700 h-2.5 rounded-r-full absolute left-0 top-0" style={{ width: `${Math.min(progress-100, 100)}%` }}></div>
                     </div>
                )}
            </CardContent>
        </Card>
    );
}

const BudgetsPage: React.FC = () => {
    const { budgets, transactions, selectedDate } = useFinanceStore();
    
    const currentMonthStr = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`; // YYYY-MM
    }, [selectedDate]);

    // Filtra los presupuestos que son plantillas (month: null) o que coinciden con el mes actual.
    // Como ahora todos son plantillas, esto los mostrará correctamente.
    const filteredBudgets = budgets.filter(b => b.month === null || b.month === currentMonthStr);

    const expensesByCat = useMemo(() => {
        return transactions
            .filter(tx => tx.type === 'gasto' && tx.date.startsWith(currentMonthStr))
            .reduce((acc, tx) => {
                if (!acc[tx.category]) {
                    acc[tx.category] = 0;
                }
                acc[tx.category] += tx.amount;
                return acc;
            }, {} as Record<string, number>);
    }, [transactions, currentMonthStr]);


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Presupuestos del Mes</h1>
            </div>
            {filteredBudgets.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBudgets.map(budget => (
                        <BudgetCard key={budget.id} budget={budget} spent={expensesByCat[budget.category] || 0} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-lg border">
                    <p className="text-lg text-muted-foreground">No hay presupuestos definidos para este mes.</p>
                </div>
            )}
        </div>
    );
};

export default BudgetsPage;