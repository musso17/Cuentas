-- Habilitar UUID y extensiones útiles
create extension if not exists "uuid-ossp";

-- Perfil de usuario vinculado a auth.users
create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null,
  display_name text,
  household_id uuid,
  created_at timestamptz default now()
);

create table if not exists households (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  type text check (type in ('ingreso','gasto')) not null,
  amount numeric(12,2) not null,
  category text not null,
  person text check (person in ('marce','pareja')) not null,
  method text,
  date date not null default now(),
  note text,
  household_id uuid references households(id) on delete cascade,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists debts (
  id uuid primary key default uuid_generate_v4(),
  entity text not null,
  amount_initial numeric(12,2) not null,
  balance numeric(12,2) not null,
  status text check (status in ('Pendiente','Pagado')) not null default 'Pendiente',
  start_date date,
  remaining_installments int,
  household_id uuid references households(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists savings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  goal numeric(12,2),
  current numeric(12,2) default 0,
  kind text, -- Vida, Viaje, Inversion, etc.
  household_id uuid references households(id) on delete cascade,
  created_at timestamptz default now()
);

-- RLS
alter table user_profiles enable row level security;
alter table households enable row level security;
alter table transactions enable row level security;
alter table debts enable row level security;
alter table savings enable row level security;

-- Policies básicas: cada usuario solo ve su household
create policy if not exists "profiles_own" on user_profiles
  for select using ( auth_user_id = auth.uid() );

create policy if not exists "profiles_insert" on user_profiles
  for insert with check ( auth_user_id = auth.uid() );

create policy if not exists "households_read" on households
  for select using ( id in (select household_id from user_profiles where auth_user_id = auth.uid()) );

create policy if not exists "households_write" on households
  for insert with check ( true );

create policy if not exists "txns_read" on transactions
  for select using ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) );

create policy if not exists "txns_write" on transactions
  for insert with check ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) );

create policy if not exists "txns_modify" on transactions
  for update using ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) )
  with check ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) );

create policy if not exists "txns_delete" on transactions
  for delete using ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) );

create policy if not exists "debts_rw" on debts
  for all using ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) )
  with check ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) );

create policy if not exists "savings_rw" on savings
  for all using ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) )
  with check ( household_id in (select household_id from user_profiles where auth_user_id = auth.uid()) );
