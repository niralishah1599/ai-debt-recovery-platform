create extension if not exists pgcrypto;

create table if not exists public.portal_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('staff', 'client')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists portal_users_role_idx on public.portal_users (role);
create index if not exists portal_users_created_at_idx on public.portal_users (created_at desc);

alter table public.portal_users enable row level security;

drop policy if exists "portal_users_select_own" on public.portal_users;
create policy "portal_users_select_own"
on public.portal_users
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "portal_users_insert_own" on public.portal_users;
create policy "portal_users_insert_own"
on public.portal_users
for insert
to authenticated
with check (auth.uid() = auth_user_id);
