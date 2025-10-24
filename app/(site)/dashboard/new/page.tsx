'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { fetchCurrentProfile, getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { useSessionStore } from '@/store/useSessionStore'

type FormState = {
  type: 'ingreso' | 'gasto'
  amount: string
  category: string
  person: 'marce' | 'pareja'
  method: string
  date: string
  note: string
}

const buildDefaultValues = (): FormState => ({
  type: 'gasto',
  amount: '',
  category: '',
  person: 'marce',
  method: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
})

export default function NewTransactionPage() {
  const router = useRouter()
  const { householdId, profileId, setSession } = useSessionStore((state) => ({
    householdId: state.householdId,
    profileId: state.profileId,
    setSession: state.setSession,
  }))

  const [form, setForm] = useState<FormState>(() => buildDefaultValues())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    const ensureSession = async () => {
      if (householdId) {
        setReady(true)
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { user, profile, error: profileError } = await fetchCurrentProfile(supabase)

      if (!active) return

      if (profileError) {
        setError(profileError)
      }

      if (!user) {
        setError('Necesitas iniciar sesión para crear movimientos.')
        return
      }

      setSession({
        householdId: profile?.household_id ?? null,
        profileId: profile?.id ?? null,
        profileName: profile?.display_name ?? null,
      })

      if (!profile?.household_id) {
        setError('Asocia tu cuenta a un household antes de registrar movimientos.')
        return
      }

      setReady(true)
    }

    ensureSession()

    return () => {
      active = false
    }
  }, [householdId, setSession])

  const isValid = useMemo(() => {
    return Boolean(form.amount && form.category && form.date)
  }, [form.amount, form.category, form.date])

  const handleChange = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!householdId) {
      setError('Necesitas un household asignado para registrar movimientos.')
      return
    }

    const amountValue = parseFloat(form.amount)

    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setError('Ingresa un monto válido mayor a 0.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    const supabase = getSupabaseBrowserClient()
    const { error: insertError } = await supabase.from('transactions').insert({
      type: form.type,
      amount: amountValue,
      category: form.category,
      person: form.person,
      method: form.method || null,
      date: form.date,
      note: form.note || null,
      household_id: householdId,
      created_by: profileId ?? null,
    })

    setIsSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setForm(buildDefaultValues())
    router.push('/dashboard')
  }

  return (
    <main className="mx-auto grid max-w-md gap-4 p-6">
      <h1 className="text-xl font-semibold">Nuevo movimiento</h1>
      <form onSubmit={handleSubmit} className="card space-y-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!ready && !error ? <p>Cargando sesión…</p> : null}

        <div>
          <label className="label">Tipo</label>
          <select
            className="input"
            value={form.type}
            onChange={(event) => handleChange('type', event.target.value as FormState['type'])}
          >
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>

        <div>
          <label className="label">Monto (S/.)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(event) => handleChange('amount', event.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="label">Categoría</label>
          <input
            className="input"
            value={form.category}
            onChange={(event) => handleChange('category', event.target.value)}
            placeholder="Restaurantes, Alquiler, Deudas…"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Persona</label>
            <select
              className="input"
              value={form.person}
              onChange={(event) => handleChange('person', event.target.value as FormState['person'])}
            >
              <option value="marce">Marce</option>
              <option value="pareja">Pareja</option>
            </select>
          </div>
          <div>
            <label className="label">Método</label>
            <input
              className="input"
              value={form.method}
              onChange={(event) => handleChange('method', event.target.value)}
              placeholder="Amex, Visa, Efectivo…"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Fecha</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(event) => handleChange('date', event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Nota</label>
            <input
              className="input"
              value={form.note}
              onChange={(event) => handleChange('note', event.target.value)}
              placeholder="Detalle opcional"
            />
          </div>
        </div>

        <button
          className="btn disabled:opacity-60"
          type="submit"
          disabled={!ready || !isValid || isSubmitting}
        >
          {isSubmitting ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </main>
  )
}
