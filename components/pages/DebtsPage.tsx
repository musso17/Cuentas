'use client';

import React, { useState, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Debt, DebtStatus } from '../../types';
import Button from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';
import { MoreVerticalIcon } from '../ui/Icons';

type DebtFormData = Omit<Debt, 'id' | 'household_id' | 'created_at'>;

const DebtForm: React.FC<{
    debt?: Debt | null;
    onSave: (data: DebtFormData) => void;
    onCancel: () => void;
}> = ({ debt, onSave, onCancel }) => {
    const [formData, setFormData] = useState<DebtFormData>({
        entity: debt?.entity || '',
        amount_initial: debt?.amount_initial || 0,
        balance: debt?.balance || 0,
        status: debt?.status || 'Pendiente',
        start_date: debt?.start_date ? debt.start_date.split('T')[0] : '',
        remaining_installments: debt?.remaining_installments || null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount_initial' || name === 'balance' || name === 'remaining_installments' ? (value === '' ? null : Number(value)) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="entity">Entidad / Persona</Label>
                <Input id="entity" name="entity" value={formData.entity} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="amount_initial">Monto Inicial</Label>
                    <Input id="amount_initial" name="amount_initial" type="number" value={formData.amount_initial} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="balance">Saldo Pendiente</Label>
                    <Input id="balance" name="balance" type="number" value={formData.balance} onChange={handleChange} required />
                </div>
            </div>
            <div>
                <Label htmlFor="start_date">Fecha de Inicio</Label>
                <Input id="start_date" name="start_date" type="date" value={formData.start_date || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="remaining_installments">Cuotas Restantes</Label>
                    <Input id="remaining_installments" name="remaining_installments" type="number" value={formData.remaining_installments || ''} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="status">Estado</Label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-input">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    );
};

const DebtModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    debt: Debt | null;
}> = ({ isOpen, onClose, debt }) => {
    const { addDebt, updateDebt } = useFinanceStore();

    const handleSave = (data: DebtFormData) => {
        if (debt) {
            // Editing existing debt
            updateDebt(debt.id, data);
        } else {
            // Creating new debt
            addDebt(data);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{debt ? 'Editar Deuda' : 'Añadir Nueva Deuda'}</DialogTitle>
                    <DialogDescription>
                        {debt ? 'Actualiza los detalles de la deuda.' : 'Ingresa los detalles de la nueva deuda.'}
                    </DialogDescription>
                </DialogHeader>
                <DebtForm debt={debt} onSave={handleSave} onCancel={onClose} />
            </DialogContent>
        </Dialog>
    );
};

const AmortizeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    debt: Debt;
}> = ({ isOpen, onClose, debt }) => {
    const { amortizeDebt } = useFinanceStore();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleAmortize = () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Por favor, ingresa un monto válido.');
            return;
        }
        if (parsedAmount > debt.balance) {
            setError('El monto a amortizar no puede ser mayor al saldo pendiente.');
            return;
        }
        amortizeDebt(debt.id, parsedAmount);
        onClose();
        setAmount('');
        setError('');
    };

    const handleClose = () => {
        setAmount('');
        setError('');
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Amortizar Deuda: {debt.entity}</DialogTitle>
                    <DialogDescription>
                        Ingresa el monto que deseas pagar de forma extraordinaria. Saldo actual: S/{debt.balance.toLocaleString('es-PE')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Label htmlFor="amortize_amount">Monto a Amortizar</Label>
                    <Input id="amortize_amount" name="amortize_amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleAmortize}>Amortizar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const DebtCard: React.FC<{ debt: Debt; onEdit: () => void; onDelete: () => void; onAmortize: () => void; }> = ({ debt, onEdit, onDelete, onAmortize }) => {
    const progress = ( (debt.amount_initial - debt.balance) / debt.amount_initial ) * 100;
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{debt.entity}</CardTitle>
                        <CardDescription>Monto inicial: S/{debt.amount_initial.toLocaleString('es-PE')}</CardDescription>
                    </div>
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${debt.status === 'Pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {debt.status}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onAmortize}>Amortizar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-500">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">S/{debt.balance.toLocaleString('es-PE')}</p>
                <p className="text-sm text-muted-foreground mb-4">Saldo pendiente</p>

                <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
                 <div className="text-xs mt-1 flex justify-between">
                    <span className="text-muted-foreground">{debt.remaining_installments} cuotas restantes</span>
                    <span className="font-medium">{progress.toFixed(1)}% pagado</span>
                 </div>
            </CardContent>
        </Card>
    );
}

const DebtsPage: React.FC = () => {
    const debts = useFinanceStore(state => state.debts);
    const deleteDebt = useFinanceStore(state => state.deleteDebt);
    const loading = useFinanceStore(state => state.loading);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAmortizeModalOpen, setIsAmortizeModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
    const debtToAmortize = useRef<Debt | null>(null);

    const handleAddNew = () => {
        setEditingDebt(null);
        setIsModalOpen(true);
    };

    const handleEdit = (debt: Debt) => {
        setEditingDebt(debt);
        setIsModalOpen(true);
    };

    const handleDelete = (debtId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta deuda?')) {
            deleteDebt(debtId);
        }
    };

    const handleAmortize = (debt: Debt) => {
        debtToAmortize.current = debt;
        setIsAmortizeModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDebt(null);
    };

    const closeAmortizeModal = () => {
        setIsAmortizeModalOpen(false);
        debtToAmortize.current = null;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Deudas</h1>
                <Button onClick={handleAddNew}>Añadir Deuda</Button>
            </div>
            {debts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {debts.map(debt => (
                        <DebtCard key={debt.id} debt={debt} onEdit={() => handleEdit(debt)} onDelete={() => handleDelete(debt.id)} onAmortize={() => handleAmortize(debt)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-lg border">
                    <p className="text-lg text-muted-foreground">¡Felicidades! No tienes deudas registradas.</p>
                    <p className="text-sm text-muted-foreground mt-1">Usa el botón "Añadir Deuda" para registrar una nueva.</p>
                </div>
            )}

            <DebtModal isOpen={isModalOpen} onClose={closeModal} debt={editingDebt} />
            {debtToAmortize.current && <AmortizeModal isOpen={isAmortizeModalOpen} onClose={closeAmortizeModal} debt={debtToAmortize.current} />}
        </div>
    );
};

export default DebtsPage;
