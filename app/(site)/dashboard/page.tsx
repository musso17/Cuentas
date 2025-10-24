'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { fetchCurrentProfile, getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { useSessionStore } from '@/store/useSessionStore'

type Transaction = {
  id: string
  type: 'ingreso' | 'gasto'
  amount: number
  category: string
  person: 'marce' | 'pareja'
  method: string | null
  date: string
  note: string | null
}

type ViewState = 'loading' | 'ready' | 'noSession' | 'missingHousehold'

export default function Dashboard() {
  const { profileName, setSession } = useSessionStore((state) => ({
    profileName: state.profileName,
    setSession: state.setSession,
  }))
  const [status, setStatus] = useState<ViewState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      setStatus('loading')
      setError(null)

      const supabase = getSupabaseBrowserClient()
      const { user, profile, error: profileError } = await fetchCurrentProfile(supabase)

      if (!active) return

      if (profileError) {
        setError(profileError)
      }

      if (!user) {
        setSession({ householdId: null, profileId: null, profileName: null })
        setTransactions([])
        setStatus('noSession')
        return
      }

      const householdId = profile?.household_id ?? null

      setSession({
        householdId,
        profileId: profile?.id ?? null,
        profileName: profile?.display_name ?? null,
      })

      if (!householdId) {
        setTransactions([])
        setStatus('missingHousehold')
        return
      }

      const { data, error: txError } = await supabase
        .from('transactions')
        .select('id, type, amount, category, person, method, date, note')
        .eq('household_id', householdId)
        .order('date', { ascending: false })
        .limit(20)

      if (!active) return

      if (txError) {
        setError(txError.message)
        setTransactions([])
      } else {
        const normalized = (data ?? []).map((item) => ({
          ...item,
          amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount ?? 0,
          method: item.method ?? null,
          note: item.note ?? null,
        })) as Transaction[]
        setTransactions(normalized)
      }

      setStatus('ready')
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [setSession])

  const totals = useMemo(() => {
    const ingresos = transactions
      .filter((txn) => txn.type === 'ingreso')
      .reduce((acc, txn) => acc + txn.amount, 0)
    const gastos = transactions
      .filter((txn) => txn.type === 'gasto')
      .reduce((acc, txn) => acc + txn.amount, 0)
    return {
      ingresos,
      gastos,
      balance: ingresos - gastos,
    }
  }, [transactions])

  const renderContent = () => {
    if (status === 'loading') {
      return <p>Cargando tu información…</p>
    }

    if (status === 'noSession') {
      return <p>Inicia sesión para ver tu dashboard.</p>
    }

    if (status === 'missingHousehold') {
      return (
        <p>
          Necesitas asociar un hogar financiero. Crea uno desde Supabase o actualiza tu perfil
          antes de continuar.
        </p>
      )
    }

    if (!transactions.length) {
      return <p>No encontramos movimientos aún. Registra el primero para empezar.</p>
    }

    return (
      <ul className="divide-y">
        {transactions.map((txn) => (
          <li key={txn.id} className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="font-medium">{txn.category}</span>
              <span className="text-sm text-neutral-500">
                {new Date(txn.date).toLocaleDateString('es-PE')} • {txn.person}
              </span>
              {txn.note ? <span className="text-xs text-neutral-500">{txn.note}</span> : null}
            </div>
            <span className={txn.type === 'gasto' ? 'text-red-600' : 'text-green-700'}>
              {txn.type === 'gasto' ? '-' : '+'} S/ {txn.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-neutral-600">
            {profileName ? `Hola, ${profileName}` : 'Resumen financiero compartido'}
          </p>
        </div>
        <Link className="btn" href="/dashboard/new">
          Añadir movimiento
        </Link>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {status === 'ready' ? (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card">
            <p className="text-sm text-neutral-500">Ingresos</p>
            <p className="text-2xl font-semibold">S/ {totals.ingresos.toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Gastos</p>
            <p className="text-2xl font-semibold">S/ {totals.gastos.toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-neutral-500">Balance</p>
            <p className="text-2xl font-semibold">S/ {totals.balance.toFixed(2)}</p>
          </div>
        </section>
      ) : null}

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Últimos movimientos</h2>
          {status === 'ready' && transactions.length ? (
            <span className="text-xs text-neutral-500">Mostrando los últimos 20</span>
          ) : null}
        </div>
        {renderContent()}
      </section>
    </main>
  )
}
