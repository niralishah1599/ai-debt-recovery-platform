create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.portal_users
  add column if not exists client_id uuid,
  add column if not exists debtor_id uuid;

alter table public.portal_users
  drop constraint if exists portal_users_role_check;

alter table public.portal_users
  add constraint portal_users_role_check check (role in ('staff', 'client', 'debtor'));

create table if not exists public.debtors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  client_id uuid not null references public.clients (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid not null references public.debtors (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  balance numeric(12, 2) not null check (balance >= 0),
  status text not null check (status in ('active', 'paid', 'suppressed', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null check (channel in ('email', 'sms')),
  message_template text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  status text not null check (status in ('queued', 'sent', 'delivered', 'failed', 'blocked')),
  sent_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payment_status text not null check (payment_status in ('pending', 'succeeded', 'failed', 'canceled')),
  payment_reference text unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.compliance_rules (
  id uuid primary key default gen_random_uuid(),
  rule_name text not null unique,
  rule_type text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.compliance_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  rule_id uuid not null references public.compliance_rules (id) on delete cascade,
  result text not null check (result in ('allowed', 'blocked', 'flagged')),
  created_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'portal_users_client_id_fkey'
      and conrelid = 'public.portal_users'::regclass
  ) then
    alter table public.portal_users
      add constraint portal_users_client_id_fkey
      foreign key (client_id) references public.clients (id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'portal_users_debtor_id_fkey'
      and conrelid = 'public.portal_users'::regclass
  ) then
    alter table public.portal_users
      add constraint portal_users_debtor_id_fkey
      foreign key (debtor_id) references public.debtors (id) on delete set null;
  end if;
end $$;

create index if not exists portal_users_auth_user_id_idx on public.portal_users (auth_user_id);
create index if not exists portal_users_client_id_idx on public.portal_users (client_id);
create index if not exists portal_users_debtor_id_idx on public.portal_users (debtor_id);
create index if not exists debtors_client_id_idx on public.debtors (client_id);
create index if not exists accounts_client_id_idx on public.accounts (client_id);
create index if not exists accounts_debtor_id_idx on public.accounts (debtor_id);
create index if not exists accounts_status_idx on public.accounts (status);
create index if not exists messages_account_id_idx on public.messages (account_id);
create index if not exists messages_campaign_id_idx on public.messages (campaign_id);
create index if not exists messages_sent_at_idx on public.messages (sent_at desc);
create index if not exists payments_account_id_idx on public.payments (account_id);
create index if not exists payments_created_at_idx on public.payments (created_at desc);
create index if not exists compliance_events_account_id_idx on public.compliance_events (account_id);
create index if not exists compliance_events_rule_id_idx on public.compliance_events (rule_id);

create or replace function public.current_portal_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select pu.role
  from public.portal_users pu
  where pu.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_portal_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pu.client_id
  from public.portal_users pu
  where pu.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_portal_debtor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pu.debtor_id
  from public.portal_users pu
  where pu.auth_user_id = auth.uid()
  limit 1
$$;

grant execute on function public.current_portal_role() to authenticated;
grant execute on function public.current_portal_client_id() to authenticated;
grant execute on function public.current_portal_debtor_id() to authenticated;

alter table public.clients enable row level security;
alter table public.debtors enable row level security;
alter table public.accounts enable row level security;
alter table public.campaigns enable row level security;
alter table public.messages enable row level security;
alter table public.payments enable row level security;
alter table public.compliance_rules enable row level security;
alter table public.compliance_events enable row level security;
alter table public.portal_users enable row level security;

drop policy if exists portal_users_staff_all on public.portal_users;
create policy portal_users_staff_all
on public.portal_users
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists portal_users_self_select on public.portal_users;
create policy portal_users_self_select
on public.portal_users
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists portal_users_self_insert on public.portal_users;
create policy portal_users_self_insert
on public.portal_users
for insert
to authenticated
with check (auth.uid() = auth_user_id);

drop policy if exists clients_staff_all on public.clients;
create policy clients_staff_all
on public.clients
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists clients_client_select_own on public.clients;
create policy clients_client_select_own
on public.clients
for select
to authenticated
using (
  public.current_portal_role() = 'client'
  and id = public.current_portal_client_id()
);

drop policy if exists debtors_staff_all on public.debtors;
create policy debtors_staff_all
on public.debtors
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists debtors_client_crud_own on public.debtors;
create policy debtors_client_crud_own
on public.debtors
for all
to authenticated
using (
  public.current_portal_role() = 'client'
  and client_id = public.current_portal_client_id()
)
with check (
  public.current_portal_role() = 'client'
  and client_id = public.current_portal_client_id()
);

drop policy if exists debtors_debtor_select_self on public.debtors;
create policy debtors_debtor_select_self
on public.debtors
for select
to authenticated
using (
  public.current_portal_role() = 'debtor'
  and id = public.current_portal_debtor_id()
);

drop policy if exists accounts_staff_all on public.accounts;
create policy accounts_staff_all
on public.accounts
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists accounts_client_crud_own on public.accounts;
create policy accounts_client_crud_own
on public.accounts
for all
to authenticated
using (
  public.current_portal_role() = 'client'
  and client_id = public.current_portal_client_id()
)
with check (
  public.current_portal_role() = 'client'
  and client_id = public.current_portal_client_id()
);

drop policy if exists accounts_debtor_select_self on public.accounts;
create policy accounts_debtor_select_self
on public.accounts
for select
to authenticated
using (
  public.current_portal_role() = 'debtor'
  and debtor_id = public.current_portal_debtor_id()
);

drop policy if exists campaigns_staff_all on public.campaigns;
create policy campaigns_staff_all
on public.campaigns
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists campaigns_client_select_visible on public.campaigns;
create policy campaigns_client_select_visible
on public.campaigns
for select
to authenticated
using (
  public.current_portal_role() = 'client'
  and exists (
    select 1
    from public.messages m
    join public.accounts a on a.id = m.account_id
    where m.campaign_id = campaigns.id
      and a.client_id = public.current_portal_client_id()
  )
);

drop policy if exists messages_staff_all on public.messages;
create policy messages_staff_all
on public.messages
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists messages_client_select_own on public.messages;
create policy messages_client_select_own
on public.messages
for select
to authenticated
using (
  public.current_portal_role() = 'client'
  and exists (
    select 1
    from public.accounts a
    where a.id = messages.account_id
      and a.client_id = public.current_portal_client_id()
  )
);

drop policy if exists messages_debtor_select_own on public.messages;
create policy messages_debtor_select_own
on public.messages
for select
to authenticated
using (
  public.current_portal_role() = 'debtor'
  and exists (
    select 1
    from public.accounts a
    where a.id = messages.account_id
      and a.debtor_id = public.current_portal_debtor_id()
  )
);

drop policy if exists payments_staff_all on public.payments;
create policy payments_staff_all
on public.payments
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists payments_client_select_own on public.payments;
create policy payments_client_select_own
on public.payments
for select
to authenticated
using (
  public.current_portal_role() = 'client'
  and exists (
    select 1
    from public.accounts a
    where a.id = payments.account_id
      and a.client_id = public.current_portal_client_id()
  )
);

drop policy if exists payments_debtor_select_own on public.payments;
create policy payments_debtor_select_own
on public.payments
for select
to authenticated
using (
  public.current_portal_role() = 'debtor'
  and exists (
    select 1
    from public.accounts a
    where a.id = payments.account_id
      and a.debtor_id = public.current_portal_debtor_id()
  )
);

drop policy if exists payments_debtor_insert_own on public.payments;
create policy payments_debtor_insert_own
on public.payments
for insert
to authenticated
with check (
  public.current_portal_role() = 'debtor'
  and exists (
    select 1
    from public.accounts a
    where a.id = payments.account_id
      and a.debtor_id = public.current_portal_debtor_id()
  )
);

drop policy if exists compliance_rules_staff_all on public.compliance_rules;
create policy compliance_rules_staff_all
on public.compliance_rules
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists compliance_rules_client_select on public.compliance_rules;
create policy compliance_rules_client_select
on public.compliance_rules
for select
to authenticated
using (public.current_portal_role() = 'client');

drop policy if exists compliance_events_staff_all on public.compliance_events;
create policy compliance_events_staff_all
on public.compliance_events
for all
to authenticated
using (public.current_portal_role() = 'staff')
with check (public.current_portal_role() = 'staff');

drop policy if exists compliance_events_client_select_own on public.compliance_events;
create policy compliance_events_client_select_own
on public.compliance_events
for select
to authenticated
using (
  public.current_portal_role() = 'client'
  and exists (
    select 1
    from public.accounts a
    where a.id = compliance_events.account_id
      and a.client_id = public.current_portal_client_id()
  )
);
