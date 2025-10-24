-- Balance Compartido Supabase schema
-- Run these statements inside Supabase SQL editor or through migrations.

create extension if not exists "uuid-ossp";

create table if not exists couples (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  display_name text not null,
  email text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Domain categories shared by the couple.
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  description text,
  monthly_budget numeric(12,2),
  icon text,
  created_at timestamptz not null default now(),
  unique (couple_id, name, type)
);

create table if not exists payment_methods (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  name text not null,
  type text not null default 'other'
    check (type in ('cash', 'credit_card', 'debit_card', 'transfer', 'wallet', 'other')),
  unique (couple_id, name)
);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  payment_method_id uuid references payment_methods(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null,
  currency text not null default 'PEN',
  occurred_on date not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists transaction_tags (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  name text not null,
  unique (couple_id, name)
);

create table if not exists transaction_tag_links (
  transaction_id uuid references transactions(id) on delete cascade,
  tag_id uuid references transaction_tags(id) on delete cascade,
  primary key (transaction_id, tag_id)
);

create table if not exists debts (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  name text not null,
  entity text,
  amount_initial numeric(12,2) not null,
  balance numeric(12,2) not null,
  interest_rate numeric(5,2),
  currency text not null default 'PEN',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'closed')),
  start_date date not null,
  next_due_date date,
  total_installments int,
  remaining_installments int,
  created_at timestamptz not null default now()
);

create table if not exists debt_payments (
  id uuid primary key default uuid_generate_v4(),
  debt_id uuid references debts(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete set null,
  amount numeric(12,2) not null,
  paid_on date not null,
  created_at timestamptz not null default now()
);

create table if not exists savings (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  name text not null,
  goal_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  target_date date,
  description text,
  category text check (category in ('short_term', 'long_term', 'investment', 'emergency')),
  created_at timestamptz not null default now()
);

create table if not exists savings_movements (
  id uuid primary key default uuid_generate_v4(),
  savings_id uuid references savings(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete set null,
  amount numeric(12,2) not null,
  occurred_on date not null,
  type text not null check (type in ('deposit', 'withdraw')),
  created_at timestamptz not null default now()
);

create table if not exists investment_positions (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  name text not null,
  broker text,
  currency text not null default 'PEN',
  current_value numeric(12,2) not null default 0,
  contributions numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists monthly_balances (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  month date not null,
  total_income numeric(12,2) not null default 0,
  total_expense numeric(12,2) not null default 0,
  savings_rate numeric(5,2),
  net_savings numeric(12,2),
  constraint month_unique unique (couple_id, month)
);

create view if not exists vw_monthly_flow as
select
  couple_id,
  date_trunc('month', occurred_on) as month,
  sum(case when type = 'income' then amount else 0 end) as total_income,
  sum(case when type = 'expense' then amount else 0 end) as total_expense,
  sum(case when type = 'income' then amount else -amount end) as net_flow
from transactions
group by couple_id, date_trunc('month', occurred_on);

create view if not exists vw_category_distribution as
select
  couple_id,
  date_trunc('month', occurred_on) as month,
  categories.name as category_name,
  categories.type,
  sum(transactions.amount) as total_amount
from transactions
left join categories on categories.id = transactions.category_id
group by couple_id, date_trunc('month', occurred_on), categories.name, categories.type;

-- enable row level security
alter table couples enable row level security;
alter table users enable row level security;
alter table categories enable row level security;
alter table payment_methods enable row level security;
alter table transactions enable row level security;
alter table transaction_tags enable row level security;
alter table transaction_tag_links enable row level security;
alter table debts enable row level security;
alter table debt_payments enable row level security;
alter table savings enable row level security;
alter table savings_movements enable row level security;
alter table investment_positions enable row level security;
alter table monthly_balances enable row level security;

-- minimal policies (adjust with Auth when enabling Supabase Auth)
create policy "Couple members can read" on couples for select
  using (
    exists (
      select 1 from users
      where users.couple_id = couples.id and users.id = auth.uid()
    )
  );

create policy "Couple members can update" on couples for update
  using (
    exists (
      select 1 from users
      where users.couple_id = couples.id and users.id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from users
      where users.couple_id = couples.id and users.id = auth.uid()
    )
  );

create policy "Users manage own profile" on users
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Couple scoped read" on transactions for select
  using (
    couple_id in (
      select couple_id from users where users.id = auth.uid()
    )
  );

create policy "Couple scoped mutation" on transactions for insert
  with check (
    couple_id in (
      select couple_id from users where users.id = auth.uid()
    ) and user_id = auth.uid()
  );

create policy "Couple scoped update" on transactions for update
  using (
    couple_id in (
      select couple_id from users where users.id = auth.uid()
    )
  )
  with check (
    couple_id in (
      select couple_id from users where users.id = auth.uid()
    )
  );

-- Ajustar o ampliar políticas según los requisitos de seguridad finales.
