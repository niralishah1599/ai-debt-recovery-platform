-- Seed gamification data for maria.johnson@debtor.local
-- Account: cccccccc-cccc-4ccc-8ccc-ccccccccccc1
-- Debtor:  bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1
--
-- Goal: show a realistic mid-journey state
--   Original balance : $2,000.00
--   Total paid       : $1,050.00  (52.5%)
--   Remaining        :   $950.00
--   Milestones earned: first_payment, quarter_way, halfway
--   Total points     : 85

do $$
declare
  v_account_id uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
  v_debtor_id  uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
begin

  -- 1. Set the true original balance on the account
  update public.accounts
  set original_balance = 2000.00
  where id = v_account_id;

  -- 2. Add payment history (the $125 seed payment already exists as pay_ref_abc_0002)
  insert into public.payments (id, account_id, amount, payment_status, payment_reference, created_at)
  values
    ('f2222222-2222-4222-8222-222222222231', v_account_id, 300.00, 'succeeded', 'pay_ref_maria_002',
     timezone('utc', now()) - interval '28 days'),
    ('f2222222-2222-4222-8222-222222222232', v_account_id, 275.00, 'succeeded', 'pay_ref_maria_003',
     timezone('utc', now()) - interval '18 days'),
    ('f2222222-2222-4222-8222-222222222233', v_account_id, 200.00, 'succeeded', 'pay_ref_maria_004',
     timezone('utc', now()) - interval '10 days'),
    ('f2222222-2222-4222-8222-222222222234', v_account_id, 150.00, 'succeeded', 'pay_ref_maria_005',
     timezone('utc', now()) - interval '3 days')
  on conflict (id) do nothing;

  -- 3. Sync account balance to reflect all payments
  --    $2,000 - $125 - $300 - $275 - $200 - $150 = $950.00
  update public.accounts
  set balance = 950.00,
      status  = 'active'
  where id = v_account_id;

  -- 4. Award earned milestones
  --    52.5% paid → first_payment (10), quarter_way (25), halfway (50) = 85 pts
  insert into public.debtor_milestones (id, debtor_id, account_id, milestone_key, points, awarded_at)
  values
    ('a1111111-1111-4111-8111-111111111111', v_debtor_id, v_account_id, 'first_payment', 10,
     timezone('utc', now()) - interval '60 days'),
    ('a1111111-1111-4111-8111-111111111112', v_debtor_id, v_account_id, 'quarter_way',   25,
     timezone('utc', now()) - interval '18 days'),
    ('a1111111-1111-4111-8111-111111111113', v_debtor_id, v_account_id, 'halfway',       50,
     timezone('utc', now()) - interval '3 days')
  on conflict (account_id, milestone_key) do nothing;

end $$;
