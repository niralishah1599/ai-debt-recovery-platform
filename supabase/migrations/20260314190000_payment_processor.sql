-- Atomic payment processor callable by authenticated debtors.
-- Security definer allows the function to update account balances
-- (which debtors cannot do directly via RLS) while still verifying
-- ownership through current_portal_debtor_id().

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
  v_account    public.accounts%rowtype;
  v_payment_id uuid;
  v_new_balance numeric;
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

  -- Insert payment record as succeeded
  insert into public.payments (account_id, amount, payment_status, payment_reference)
  values (p_account_id, p_amount, 'succeeded', p_payment_reference)
  returning id into v_payment_id;

  -- Deduct balance and mark paid if cleared
  v_new_balance := v_account.balance - p_amount;

  update public.accounts
  set
    balance = v_new_balance,
    status  = case when v_new_balance <= 0 then 'paid' else 'active' end
  where id = p_account_id;

  return v_payment_id;
end;
$$;

grant execute on function public.process_debtor_payment(uuid, numeric, text) to authenticated;
