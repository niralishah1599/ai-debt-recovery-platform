-- ─────────────────────────────────────────────────────────────
-- Gamified debt repayment: milestones, points, progress tracking
-- ─────────────────────────────────────────────────────────────

-- 1. Add original_balance to accounts
--    For existing rows: reconstruct from balance + sum of successful payments.
--    For new rows: a trigger copies balance on INSERT.

alter table public.accounts
  add column if not exists original_balance numeric(12, 2);

update public.accounts a
set original_balance = a.balance + coalesce((
  select sum(p.amount)
  from public.payments p
  where p.account_id = a.id
    and p.payment_status = 'succeeded'
), 0)
where a.original_balance is null;

alter table public.accounts
  alter column original_balance set not null;

create or replace function public.accounts_set_original_balance()
returns trigger
language plpgsql
as $$
begin
  if new.original_balance is null then
    new.original_balance := new.balance;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_accounts_set_original_balance on public.accounts;
create trigger trg_accounts_set_original_balance
  before insert on public.accounts
  for each row execute function public.accounts_set_original_balance();

-- 2. Milestones table

create table if not exists public.debtor_milestones (
  id           uuid        primary key default gen_random_uuid(),
  debtor_id    uuid        not null references public.debtors (id)  on delete cascade,
  account_id   uuid        not null references public.accounts (id) on delete cascade,
  milestone_key text       not null check (milestone_key in (
                             'first_payment', 'quarter_way', 'halfway',
                             'almost_free', 'debt_free')),
  points       integer     not null,
  awarded_at   timestamptz not null default timezone('utc', now()),
  unique (account_id, milestone_key)
);

create index if not exists debtor_milestones_debtor_id_idx  on public.debtor_milestones (debtor_id);
create index if not exists debtor_milestones_account_id_idx on public.debtor_milestones (account_id);

-- 3. RLS for debtor_milestones

alter table public.debtor_milestones enable row level security;

drop policy if exists milestones_staff_all on public.debtor_milestones;
create policy milestones_staff_all
  on public.debtor_milestones
  for all to authenticated
  using  (public.current_portal_role() = 'staff')
  with check (public.current_portal_role() = 'staff');

drop policy if exists milestones_debtor_select_own on public.debtor_milestones;
create policy milestones_debtor_select_own
  on public.debtor_milestones
  for select to authenticated
  using (
    public.current_portal_role() = 'debtor'
    and debtor_id = public.current_portal_debtor_id()
  );

-- 4. Replace process_debtor_payment — now awards milestones atomically

create or replace function public.process_debtor_payment(
  p_account_id        uuid,
  p_amount            numeric,
  p_payment_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account     public.accounts%rowtype;
  v_payment_id  uuid;
  v_new_balance numeric;
  v_debtor_id   uuid;
  v_pct_paid    numeric;
begin
  -- Verify debtor owns this account
  select * into v_account
  from public.accounts
  where id = p_account_id
    and debtor_id = public.current_portal_debtor_id();

  if not found then
    raise exception 'Account not found or not accessible.';
  end if;

  if v_account.status != 'active' then
    raise exception 'Account is not active and cannot accept payments.';
  end if;

  if p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero.';
  end if;

  if p_amount > v_account.balance then
    raise exception 'Payment amount exceeds outstanding balance of %.', v_account.balance;
  end if;

  v_debtor_id := v_account.debtor_id;

  -- Insert payment record
  insert into public.payments (account_id, amount, payment_status, payment_reference)
  values (p_account_id, p_amount, 'succeeded', p_payment_reference)
  returning id into v_payment_id;

  -- Update balance
  v_new_balance := v_account.balance - p_amount;

  update public.accounts
  set
    balance = v_new_balance,
    status  = case when v_new_balance <= 0 then 'paid' else 'active' end
  where id = p_account_id;

  -- ── Award milestones ──────────────────────────────────────────

  -- First payment on this account
  insert into public.debtor_milestones (debtor_id, account_id, milestone_key, points)
  values (v_debtor_id, p_account_id, 'first_payment', 10)
  on conflict (account_id, milestone_key) do nothing;

  if v_account.original_balance > 0 then
    v_pct_paid := (v_account.original_balance - v_new_balance)
                  / v_account.original_balance * 100;

    if v_pct_paid >= 25 then
      insert into public.debtor_milestones (debtor_id, account_id, milestone_key, points)
      values (v_debtor_id, p_account_id, 'quarter_way', 25)
      on conflict (account_id, milestone_key) do nothing;
    end if;

    if v_pct_paid >= 50 then
      insert into public.debtor_milestones (debtor_id, account_id, milestone_key, points)
      values (v_debtor_id, p_account_id, 'halfway', 50)
      on conflict (account_id, milestone_key) do nothing;
    end if;

    if v_pct_paid >= 75 then
      insert into public.debtor_milestones (debtor_id, account_id, milestone_key, points)
      values (v_debtor_id, p_account_id, 'almost_free', 75)
      on conflict (account_id, milestone_key) do nothing;
    end if;

    if v_new_balance <= 0 then
      insert into public.debtor_milestones (debtor_id, account_id, milestone_key, points)
      values (v_debtor_id, p_account_id, 'debt_free', 100)
      on conflict (account_id, milestone_key) do nothing;
    end if;
  end if;

  return v_payment_id;
end;
$$;

grant execute on function public.process_debtor_payment(uuid, numeric, text) to authenticated;
