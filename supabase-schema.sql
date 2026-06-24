-- Run this in Supabase SQL Editor to create all tables
-- Go to: Supabase Dashboard > SQL Editor > New Query

create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  supabase_id text unique not null,
  email text unique not null,
  name text,
  monthly_budget numeric(12,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  is_default boolean default false,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create type transaction_type as enum ('INCOME', 'EXPENSE');

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type transaction_type not null,
  amount numeric(12,2) not null,
  description text not null,
  note text,
  date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ai_insights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  prompt text not null,
  response text not null,
  scope text,
  scope_value text,
  created_at timestamptz default now()
);

create index idx_transactions_user_date on transactions(user_id, date);
create index idx_transactions_user_type on transactions(user_id, type);
create index idx_transactions_user_category on transactions(user_id, category_id);
create index idx_ai_insights_user_scope on ai_insights(user_id, scope, scope_value);

-- Enable Row Level Security
alter table users enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table ai_insights enable row level security;

-- RLS policies: users can only access their own data
create policy "Users can view own profile" on users for select using (supabase_id = auth.uid()::text);
create policy "Users can update own profile" on users for update using (supabase_id = auth.uid()::text);
create policy "Service can insert users" on users for insert with check (true);

create policy "Users can view own categories" on categories for select using (user_id in (select id from users where supabase_id = auth.uid()::text));
create policy "Users can insert own categories" on categories for insert with check (user_id in (select id from users where supabase_id = auth.uid()::text));
create policy "Users can delete own categories" on categories for delete using (user_id in (select id from users where supabase_id = auth.uid()::text));

create policy "Users can view own transactions" on transactions for select using (user_id in (select id from users where supabase_id = auth.uid()::text));
create policy "Users can insert own transactions" on transactions for insert with check (user_id in (select id from users where supabase_id = auth.uid()::text));
create policy "Users can update own transactions" on transactions for update using (user_id in (select id from users where supabase_id = auth.uid()::text));
create policy "Users can delete own transactions" on transactions for delete using (user_id in (select id from users where supabase_id = auth.uid()::text));

create policy "Users can view own insights" on ai_insights for select using (user_id in (select id from users where supabase_id = auth.uid()::text));
create policy "Users can insert own insights" on ai_insights for insert with check (user_id in (select id from users where supabase_id = auth.uid()::text));
