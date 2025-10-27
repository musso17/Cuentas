'use client';
import React, { useState, useEffect, Fragment } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { TransactionType, TransactionPerson } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card, { CardHeader, CardContent, CardTitle } from '../ui/Card';

interface NewTransactionPageProps {
  onTransactionAdded: () => void;
}

const GASTOS_FIJOS = {
  'Alquiler': 2500,
  'Inversiones': 100, // Agregado como gasto fijo mensual de 100
  'Luz': 50,
  'Teléfono': 40,
  'Mantenimiento': 30,
  'Internet': 30,
  'Psicólogas': 200,
  'Membresías': 50,
  'Tere': 150,
  'Lavandería': 50,
};

const GASTOS_VARIABLES = [
  'Compras Casa', 'Carro', 'Gasolina', 'Deporte', 'Laser', 'Gatos',
  'Entretenimiento', 'Restaurantes', 'Taxis', 'Extras', 'Estacionalidad',
  'Mantenimiento Carro'
];

const CATEGORIES = [...Object.keys(GASTOS_FIJOS), ...GASTOS_VARIABLES].sort();

const PAYMENT_METHODS = ['Efectivo', 'Visa', 'Amex'];
const DESTINATIONS = ['Efectivo', 'Cuenta'];
const BANKS = ['BCP', 'Interbank'];

const NewTransactionPage: React.FC<NewTransactionPageProps> = ({ onTransactionAdded }) => {
  const { addTransaction, loading } = useFinanceStore();
  const [type, setType] = useState<TransactionType>('gasto');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [person, setPerson] = useState<TransactionPerson>('marcelo');
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [bank, setBank] = useState(BANKS[0]);

  useEffect(() => {
    if (category === 'Carro') {
      setAmount('718');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) {
      alert('Por favor completa los campos requeridos.');
      return;
    }
    await addTransaction({
      type, // 'ingreso' o 'gasto'
      amount: parseFloat(amount),
      // Para ingresos, la categoría no es relevante en el formulario, pero la guardamos internamente.
      category: type === 'ingreso' ? 'Ingreso' : category,
      person,
      // Para ingresos, el método de pago se construye a partir del destino y el banco.
      method,
      date,
      note,
    });
    onTransactionAdded();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Nuevo Movimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="type">Tipo</label>
                <Select id="type" value={type} onChange={e => setType(e.target.value as TransactionType)}>
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </Select>
             </div>
             <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="amount">Monto</label>
                <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {type === 'gasto' ? (
              <div>
                  <label className="text-sm font-medium mb-1 block" htmlFor="category">Categoría</label>
                  <Select id="category" value={category} onChange={e => setCategory(e.target.value)} required>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
              </div>
            ) : <div />}
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="person">Persona</label>
                <Select id="person" value={person} onChange={e => setPerson(e.target.value as TransactionPerson)}>
                  <option value="marcelo">Marcelo</option>
                  <option value="ana">Ana</option>
                </Select>
              </div>
          </div>
           {type === 'gasto' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="method">Método de Pago</label>
                <Select id="method" value={method} onChange={e => setMethod(e.target.value)} required>
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="date">Fecha</label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
            </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="destination">Destino</label>
                <Select id="destination" value={destination} onChange={e => setDestination(e.target.value)} required>
                  {DESTINATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
             </div>
             <div>
                <label className="text-sm font-medium mb-1 block" htmlFor="date">Fecha</label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
             </div>
            </div>
           )}
          {type === 'ingreso' && destination === 'Cuenta' && (
            <div>
              <label className="text-sm font-medium mb-1 block" htmlFor="bank">Banco</label>
              <Select id="bank" value={bank} onChange={e => setBank(e.target.value)} required>
                {BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block" htmlFor="note">Nota (Opcional)</label>
            <Input id="note" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Detalles adicionales" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Transacción'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewTransactionPage;
