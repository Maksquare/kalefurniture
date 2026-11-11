-- ====================================================================
-- Kal Furniture - Database Setup & RLS Policies
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ====================================================================

-- 1. Ensure the orders table exists
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  total_etb numeric not null default 0,
  item_count integer not null default 1,
  items jsonb default '[]'::jsonb,
  status text default 'completed'
);

-- 2. Enable Row Level Security (RLS)
alter table if exists public.site_settings enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.packages enable row level security;
alter table if exists public.orders enable row level security;

-- 3. Site Settings Policies
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings
  for select
  using (true);

drop policy if exists "site_settings_authenticated_write" on public.site_settings;
create policy "site_settings_authenticated_write"
  on public.site_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- 4. Products Policies
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  using (true);

drop policy if exists "products_authenticated_write" on public.products;
create policy "products_authenticated_write"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

-- Allow incrementing sales_count on checkout
drop policy if exists "products_public_update_sales" on public.products;
create policy "products_public_update_sales"
  on public.products
  for update
  using (true)
  with check (true);

-- 5. Packages Policies
drop policy if exists "packages_public_read" on public.packages;
create policy "packages_public_read"
  on public.packages
  for select
  using (true);

drop policy if exists "packages_authenticated_write" on public.packages;
create policy "packages_authenticated_write"
  on public.packages
  for all
  to authenticated
  using (true)
  with check (true);

-- 6. Orders Policies
drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert"
  on public.orders
  for insert
  with check (true);

drop policy if exists "orders_authenticated_read" on public.orders;
create policy "orders_authenticated_read"
  on public.orders
  for select
  to authenticated
  using (true);

drop policy if exists "orders_public_read" on public.orders;
create policy "orders_public_read"
  on public.orders
  for select
  using (true);

