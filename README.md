# Balance Compartido (Next.js + Supabase)

App base para llevar finanzas en pareja: ingresos, gastos, deudas y metas compartidas.
- Frontend: Next.js (App Router) + TypeScript + TailwindCSS
- Estado global: Zustand para sesión/household
- Backend/BBDD: Supabase (Postgres + Auth + RLS)
- Rutas clave: `/` (home), `/login`, `/dashboard`, `/dashboard/new`

## 1) Requisitos
- Node 18+
- Una cuenta de Supabase con un proyecto creado
- Variables de entorno (`.env.local`)

## 2) Configuración
1. Copia `.env.example` a `.env.local` y pega tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
2. En Supabase SQL Editor, ejecuta el contenido de `supabase/001_init.sql`.
3. Crea un `household` manualmente:
   ```sql
   insert into households (name) values ('Hogar Marce');
   ```
4. Crea tu perfil (reemplaza `auth.uid()` por tu UUID si ejecutas desde SQL Runner):
   ```sql
   insert into user_profiles (auth_user_id, display_name, household_id)
   values (auth.uid(), 'Marce', (select id from households limit 1));
   ```

## 3) Ejecutar
```bash
npm install
npm run dev
```

## 4) Deploy
- **Vercel** recomendado. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` como Environment Variables del proyecto.

## 5) Importar datos desde CSV (opcional)
- Exporta tu Excel/Google Sheet a CSV con columnas: type,amount,category,person,method,date,note
- Inserta con un script o desde el editor web de Supabase.
