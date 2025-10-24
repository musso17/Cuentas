import Link from 'next/link'

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Balance Compartido</h1>
        <p className="text-neutral-600">Una app para llevar sus finanzas en pareja: gastos, ingresos, deudas y metas.</p>
      </header>
      <div className="card space-y-3">
        <p>Comienza iniciando sesión y crea tu primer hogar financiero.</p>
        <div className="flex gap-3">
          <Link className="btn" href="/login">Iniciar sesión</Link>
          <Link className="btn" href="/dashboard">Ver demo</Link>
        </div>
      </div>
      <footer className="text-sm text-neutral-500">Hecho con Next.js + Supabase</footer>
    </main>
  )
}
