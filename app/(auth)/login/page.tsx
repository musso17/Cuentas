'use client'

import { useState } from 'react'

import { getSupabaseBrowserClient } from '@/lib/supabaseClient'

const supabase = getSupabaseBrowserClient()

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Revisa tu correo para continuar.')
    }

    setIsSubmitting(false)
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Inicia sesión</h1>
      <form onSubmit={handleLogin} className="card space-y-3">
        <label className="label">Correo</label>
        <input
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@dominio.com"
        />
        <button className="btn disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar magic link'}
        </button>
        {message && <p className="text-sm text-neutral-600">{message}</p>}
      </form>
    </main>
  )
}
