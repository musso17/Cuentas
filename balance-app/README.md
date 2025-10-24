## Balance compartido

Plataforma web para administrar finanzas en pareja, construida con Next.js 16 (App Router), Tailwind CSS v4 y Supabase. El objetivo es centralizar ingresos, egresos, deudas, ahorros e historial de gastos en tiempo real, tomando como referencia el CSV incluido en la carpeta raíz.

### Stack principal

- Next.js 16 + React 19 (App Router, componentes cliente)
- Tailwind CSS v4 (modo `@import "tailwindcss"`)
- Supabase (base de datos Postgres, Auth, almacenamiento)
- Recharts para visualizaciones, lucide-react para iconografía
- Scripts utilitarios con `tsx` y `csv-parse`

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copiar el archivo de ejemplo y completar los valores reales del proyecto Supabase.

```bash
cp .env.local.example .env.local
```

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio para tareas administrativas (solo backend) |
| `CSV_SEED_PATH` | Ruta opcional al CSV original para el script de ingestión |
| `COUPLE_ID` | UUID de la pareja en la tabla `couples` (usado para sincronizar el CSV) |

### Conexión con Supabase

- La app crea el cliente desde `src/lib/supabaseClient.ts` usando las variables públicas.
- `src/hooks/use-financial-data.ts` consulta `monthly_balances`, `transactions`, `debts`, `savings` y `categories`. Si la instancia está vacía conserva el dataset de ejemplo.
- El dashboard muestra un indicador de origen de datos (Supabase vs dataset local).
- Puedes extender la consulta para traer `investment_positions`, `savings_movements` u otras tablas agregando los `select` correspondientes.

## Esquema de base de datos

El directorio `supabase/schema.sql` contiene la propuesta de modelo relacional con tablas para usuarios, transacciones, categorías, deudas, ahorros, inversiones y vistas agregadas (`vw_monthly_flow`, `vw_category_distribution`). Ejecutar el archivo dentro de Supabase SQL Editor o administrarlo como migración.

## Script de ingestión desde el CSV

El archivo `scripts/seed-from-csv.ts` transforma el CSV `"Cuentas 2026 - Draft.xlsx - Simulación Año.csv"` en una estructura utilizable por el dashboard (series mensuales, totales por sección, balances).

```bash
npm run parse:csv
```

- Lee la ruta indicada en `CSV_SEED_PATH` o usa el CSV de la carpeta raíz.
- Normaliza importes (`S/.31.102` → `31102`).
- Agrupa filas por sección (`INGRESOS`, `EGRESOS`, `DEUDAS`, etc.).
- Devuelve un JSON con meses, dataset detallado y resumen mensual: ingresos, egresos, balance y tasa de ahorro.

La salida se puede importar a Supabase (`COPY`), insertar vía API o alimentar `fixtures` en el cliente.

### Sincronización directa a Supabase

Usa el script `scripts/import-csv-to-supabase.ts` para poblar las tablas `categories`, `transactions` y `monthly_balances` con los datos reales del CSV.

```bash
COUPLE_ID=<uuid-de-la-pareja> CLEAR_EXISTING=true npm run sync:csv
```

- Requiere `SUPABASE_SERVICE_ROLE_KEY` (el script corre lado servidor).
- Crea/actualiza categorías según cada fila y registra las transacciones por mes.
- Si defines `CLEAR_EXISTING=true`, borra las transacciones anteriores de la pareja antes de insertar las nuevas.
- Actualiza `monthly_balances` con los totales calculados.

## Organización del código

- `src/app/page.tsx`: interfaz principal con módulos (dashboard, ingresos, gastos, deudas, ahorros, reportes, usuarios) y selector de periodo.
- `src/components/**`: componentes reutilizables (tarjetas, gráficos, tablas).
- `src/lib/mock-data.ts`: dataset de ejemplo construido a partir de los datos del CSV 2025.
- `src/lib/supabaseClient.ts`: cliente listo para hidratar la sesión en browser o server components.

## Próximos pasos sugeridos

1. Conectar el cliente a Supabase Auth y generar invitaciones para cada miembro de la pareja.
2. Crear API Routes o acciones Server Actions para CRUD de `transactions`, `debts`, `savings`.
3. Sustituir `mock-data` por queries en tiempo real (`supabase.channel`) y parametrizar el dashboard por pareja.
4. Añadir pruebas de integración con Playwright y validar cálculos de balance mensuales.
5. Desplegar en Vercel y configurar webhooks de Supabase para enviar notificaciones (sobrepresupuesto, metas alcanzadas).
