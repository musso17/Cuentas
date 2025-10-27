import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { Saving } from '../../types';

const SavingGoalCard: React.FC<{ saving: Saving }> = ({ saving }) => {
    const progress = saving.goal ? (saving.current / saving.goal) * 100 : 0;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{saving.name}</CardTitle>
                <CardDescription>{saving.kind || 'Ahorro General'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-2 flex justify-between items-baseline">
                    <p className="text-2xl font-bold">S/{saving.current.toLocaleString('es-PE')}</p>
                    {saving.goal && (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">de S/{saving.goal.toLocaleString('es-PE')}</p>
                            <p className="text-xs text-muted-foreground">Faltan S/{(saving.goal - saving.current).toLocaleString('es-PE')}</p>
                        </div>
                    )}
                </div>
                {saving.goal && (
                    <div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                            <div className="bg-accent h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <p className="text-right text-xs mt-1 text-muted-foreground">{progress.toFixed(1)}% completado</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const SavingsPage: React.FC = () => {
    // Selecciona cada pieza del estado por separado para evitar re-renders infinitos.
    const savings = useFinanceStore(state => state.savings);
    const distributeMonthlySavings = useFinanceStore(state => state.distributeMonthlySavings);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Metas de Ahorro</h1>
                <Button onClick={distributeMonthlySavings}>Distribuir Ahorro del Mes</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {savings.map(saving => (
                    <SavingGoalCard key={saving.id} saving={saving} />
                ))}
            </div>
        </div>
    );
};

export default SavingsPage;
