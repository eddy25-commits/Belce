-- Belce e-commerce database schema for Supabase.
-- Run this once in your Supabase project's SQL Editor:
-- Dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
--
-- All application reads/writes go through the backend using the
-- service_role key, which bypasses RLS entirely. The RLS policies below
-- are a safety net in case anything ever queries these tables directly
-- from the browser with the anon key (e.g. future features), and they
-- also make the "my orders" pattern possible if you extend the frontend
-- to query Supabase directly using a customer's session.

-- ============================================================
-- PROFILES
-- One row per Supabase Auth user. Created automatically by the
-- trigger below whenever someone signs up. Admin status lives on
-- auth.users.raw_app_meta_data (set via the seed script / Supabase
-- dashboard), NOT here, since app_metadata can't be edited by the
-- user themselves — this table is just display info.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null default 'Other'
    check (category in ('Watches', 'Sneakers', 'Bracelets', 'Clothes', 'Accessories', 'Other')),
  brand text default '',
  stock integer not null default 0 check (stock >= 0),
  images jsonb not null default '[]'::jsonb, -- [{ url, path }]
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_is_active_idx on public.products (is_active);

alter table public.products enable row level security;

drop policy if exists "Active products are publicly viewable" on public.products;
create policy "Active products are publicly viewable"
  on public.products for select
  using (is_active = true);

-- Writes are done by the backend with the service_role key (which bypasses
-- RLS), so no insert/update/delete policy is needed for normal operation.

-- ============================================================
-- DELIVERY ZONES
-- ============================================================
create table if not exists public.delivery_zones (
  id bigint generated always as identity primary key,
  name text not null,
  scope text not null default 'ghana' check (scope in ('ghana', 'international')),
  fee numeric(10, 2) not null default 0 check (fee >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.delivery_zones enable row level security;

drop policy if exists "Active delivery zones are publicly viewable" on public.delivery_zones;
create policy "Active delivery zones are publicly viewable"
  on public.delivery_zones for select
  using (is_active = true);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null, -- null = guest order
  customer jsonb not null, -- { name, email, phone, address, notes }
  items jsonb not null, -- [{ productId, name, price, quantity, image }]
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  delivery_zone_id bigint,
  delivery_zone_name text,
  total numeric(10, 2) not null,
  paystack_reference text not null unique,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_paystack_reference_idx on public.orders (paystack_reference);

alter table public.orders enable row level security;

drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Order creation, guest lookups, admin listing, and status updates all go
-- through the backend with the service_role key, so no public insert
-- policy is needed (and shouldn't be added — prices/stock must always be
-- re-validated server-side, never trusted from the client).

-- ============================================================
-- updated_at helper trigger, applied to all three tables above
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_delivery_zones_updated_at on public.delivery_zones;
create trigger set_delivery_zones_updated_at
  before update on public.delivery_zones
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Atomically decrements stock for every item in a paid order in a single
-- statement (replaces the old Sequelize transaction). items is a jsonb
-- array of { productId, quantity }.
-- ============================================================
create or replace function public.decrement_stock_bulk(items jsonb)
returns void as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(items)
  loop
    update public.products
    set stock = greatest(stock - (item ->> 'quantity')::int, 0)
    where id = (item ->> 'productId')::bigint;
  end loop;
end;
$$ language plpgsql;

-- ============================================================
-- STORAGE
-- Create the product-images bucket (public read) if it doesn't exist.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Uploads/deletes to storage are done by the backend with the service_role
-- key, so no public write policy is needed.

-- ============================================================
-- SEED starter delivery zones (safe to skip/edit — admin can manage
-- these later from /admin/delivery-zones)
-- ============================================================
insert into public.delivery_zones (name, scope, fee, sort_order)
select 'Kumasi', 'ghana', 0, 0
where not exists (select 1 from public.delivery_zones where name = 'Kumasi');

insert into public.delivery_zones (name, scope, fee, sort_order)
select 'Greater Accra', 'ghana', 35, 1
where not exists (select 1 from public.delivery_zones where name = 'Greater Accra');

insert into public.delivery_zones (name, scope, fee, sort_order)
select 'Rest of Ghana', 'ghana', 35, 2
where not exists (select 1 from public.delivery_zones where name = 'Rest of Ghana');
