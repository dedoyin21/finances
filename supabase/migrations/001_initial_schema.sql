-- Run once in a new Supabase project's SQL Editor, or use Supabase migrations.
-- Money is a positive integer in kobo: NGN 1,250.50 = 125050.
begin;

create type public.transaction_type as enum ('income', 'expense');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  type public.transaction_type not null,
  unique (id, user_id),
  unique (id, user_id, type)
);

create unique index categories_user_name_type_idx
  on public.categories (user_id, lower(btrim(name)), type);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null,
  amount bigint not null check (amount > 0 and amount <= 9007199254740991),
  type public.transaction_type not null,
  note text check (char_length(note) <= 1000),
  date date not null default (now() at time zone 'Africa/Lagos')::date,
  created_at timestamptz not null default now(),
  -- Also enforces ownership and matching income/expense type on the category.
  foreign key (category_id, user_id, type)
    references public.categories (id, user_id, type) on delete no action
);

create index transactions_user_date_idx on public.transactions (user_id, date desc);
create index transactions_category_idx on public.transactions (category_id, user_id, type);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null,
  -- A month is represented by its first day, e.g. 2026-11-01.
  month date not null check (extract(day from month) = 1),
  limit_amount bigint not null check (limit_amount > 0 and limit_amount <= 9007199254740991),
  foreign key (category_id, user_id)
    references public.categories (id, user_id) on delete no action,
  unique (user_id, category_id, month)
);

create index budgets_user_month_idx on public.budgets (user_id, month);
create index budgets_category_idx on public.budgets (category_id, user_id);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Both USING and WITH CHECK are necessary: an UPDATE must not transfer ownership.
create policy categories_select on public.categories for select to authenticated
  using ((select auth.uid()) = user_id);
create policy categories_insert on public.categories for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy categories_update on public.categories for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy categories_delete on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy transactions_select on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy transactions_insert on public.transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy transactions_update on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy transactions_delete on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy budgets_select on public.budgets for select to authenticated
  using ((select auth.uid()) = user_id);
create policy budgets_insert on public.budgets for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy budgets_update on public.budgets for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy budgets_delete on public.budgets for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.categories, public.transactions, public.budgets from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.categories, public.transactions, public.budgets to authenticated;

comment on column public.transactions.amount is 'Positive integer kobo; type determines income or expense.';
comment on column public.budgets.limit_amount is 'Positive integer kobo.';
comment on column public.budgets.month is 'First day of the budget month in the Nigerian calendar.';

commit;
