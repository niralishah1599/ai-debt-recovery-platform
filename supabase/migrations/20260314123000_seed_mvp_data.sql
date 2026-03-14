-- Seed data is included as a migration so `supabase db push` applies it automatically.

create extension if not exists pgcrypto;

create or replace function public.seed_create_auth_user(
  p_user_id uuid,
  p_email text,
  p_password text,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    p_user_id,
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('role', p_role),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update
    set email = excluded.email,
        raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = timezone('utc', now());

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    p_user_id,
    jsonb_build_object('sub', p_user_id::text, 'email', p_email),
    'email',
    p_user_id::text,
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (provider, provider_id) do update
    set identity_data = excluded.identity_data,
        updated_at = timezone('utc', now());
end;
$$;

do $$
declare
  staff_auth_id uuid := '11111111-1111-4111-8111-111111111111';
  client_user_abc_auth_id uuid := '22222222-2222-4222-8222-222222222221';
  client_user_xyz_auth_id uuid := '22222222-2222-4222-8222-222222222222';
  debtor_auth_1 uuid := '33333333-3333-4333-8333-333333333331';
  debtor_auth_2 uuid := '33333333-3333-4333-8333-333333333332';
  debtor_auth_3 uuid := '33333333-3333-4333-8333-333333333333';
  debtor_auth_4 uuid := '33333333-3333-4333-8333-333333333334';
  debtor_auth_5 uuid := '33333333-3333-4333-8333-333333333335';
  debtor_auth_6 uuid := '33333333-3333-4333-8333-333333333336';

  client_abc_id uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  client_xyz_id uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';

  debtor_abc_1_id uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
  debtor_abc_2_id uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';
  debtor_abc_3_id uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3';
  debtor_xyz_1_id uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4';
  debtor_xyz_2_id uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5';
  debtor_xyz_3_id uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6';

  account_1_id uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
  account_2_id uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2';
  account_3_id uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3';
  account_4_id uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc4';
  account_5_id uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc5';
  account_6_id uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc6';

  campaign_id uuid := 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1';
  rule_contact_window_id uuid := 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1';
  rule_consent_id uuid := 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2';
begin
  perform public.seed_create_auth_user(staff_auth_id, 'staff.admin@platform.local', 'TempPass#2026', 'staff');
  perform public.seed_create_auth_user(client_user_abc_auth_id, 'ops@abcbank.local', 'TempPass#2026', 'client');
  perform public.seed_create_auth_user(client_user_xyz_auth_id, 'ops@xyzfinance.local', 'TempPass#2026', 'client');
  perform public.seed_create_auth_user(debtor_auth_1, 'maria.johnson@debtor.local', 'TempPass#2026', 'debtor');
  perform public.seed_create_auth_user(debtor_auth_2, 'liam.carter@debtor.local', 'TempPass#2026', 'debtor');
  perform public.seed_create_auth_user(debtor_auth_3, 'priya.patel@debtor.local', 'TempPass#2026', 'debtor');
  perform public.seed_create_auth_user(debtor_auth_4, 'sofia.nguyen@debtor.local', 'TempPass#2026', 'debtor');
  perform public.seed_create_auth_user(debtor_auth_5, 'ethan.smith@debtor.local', 'TempPass#2026', 'debtor');
  perform public.seed_create_auth_user(debtor_auth_6, 'olivia.wright@debtor.local', 'TempPass#2026', 'debtor');

  insert into public.clients (id, name)
  values
    (client_abc_id, 'ABC Bank'),
    (client_xyz_id, 'XYZ Finance')
  on conflict (id) do update
    set name = excluded.name;

  insert into public.debtors (id, name, email, phone, client_id)
  values
    (debtor_abc_1_id, 'Maria Johnson', 'maria.johnson@debtor.local', '+1-555-100-0001', client_abc_id),
    (debtor_abc_2_id, 'Liam Carter', 'liam.carter@debtor.local', '+1-555-100-0002', client_abc_id),
    (debtor_abc_3_id, 'Priya Patel', 'priya.patel@debtor.local', '+1-555-100-0003', client_abc_id),
    (debtor_xyz_1_id, 'Sofia Nguyen', 'sofia.nguyen@debtor.local', '+1-555-200-0001', client_xyz_id),
    (debtor_xyz_2_id, 'Ethan Smith', 'ethan.smith@debtor.local', '+1-555-200-0002', client_xyz_id),
    (debtor_xyz_3_id, 'Olivia Wright', 'olivia.wright@debtor.local', '+1-555-200-0003', client_xyz_id)
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        client_id = excluded.client_id;

  insert into public.accounts (id, debtor_id, client_id, balance, status)
  values
    (account_1_id, debtor_abc_1_id, client_abc_id, 1240.50, 'active'),
    (account_2_id, debtor_abc_2_id, client_abc_id, 860.00, 'active'),
    (account_3_id, debtor_abc_3_id, client_abc_id, 0.00, 'paid'),
    (account_4_id, debtor_xyz_1_id, client_xyz_id, 2200.00, 'active'),
    (account_5_id, debtor_xyz_2_id, client_xyz_id, 450.25, 'suppressed'),
    (account_6_id, debtor_xyz_3_id, client_xyz_id, 980.75, 'active')
  on conflict (id) do update
    set debtor_id = excluded.debtor_id,
        client_id = excluded.client_id,
        balance = excluded.balance,
        status = excluded.status;

  insert into public.campaigns (id, name, channel, message_template)
  values (
    campaign_id,
    'Payment Reminder Campaign',
    'email',
    'This is a reminder that your account has an outstanding balance. Please complete your one-time payment.'
  )
  on conflict (id) do update
    set name = excluded.name,
        channel = excluded.channel,
        message_template = excluded.message_template;

  insert into public.messages (id, account_id, campaign_id, channel, status, sent_at)
  values
    ('f1111111-1111-4111-8111-111111111111', account_1_id, campaign_id, 'email', 'delivered', timezone('utc', now()) - interval '3 days'),
    ('f1111111-1111-4111-8111-111111111112', account_2_id, campaign_id, 'email', 'sent', timezone('utc', now()) - interval '2 days'),
    ('f1111111-1111-4111-8111-111111111113', account_4_id, campaign_id, 'email', 'blocked', timezone('utc', now()) - interval '1 days')
  on conflict (id) do update
    set account_id = excluded.account_id,
        campaign_id = excluded.campaign_id,
        channel = excluded.channel,
        status = excluded.status,
        sent_at = excluded.sent_at;

  insert into public.payments (id, account_id, amount, payment_status, payment_reference)
  values
    ('f2222222-2222-4222-8222-222222222221', account_3_id, 500.00, 'succeeded', 'pay_ref_abc_0001'),
    ('f2222222-2222-4222-8222-222222222222', account_1_id, 125.00, 'succeeded', 'pay_ref_abc_0002'),
    ('f2222222-2222-4222-8222-222222222223', account_4_id, 100.00, 'pending', 'pay_ref_xyz_0001')
  on conflict (id) do update
    set account_id = excluded.account_id,
        amount = excluded.amount,
        payment_status = excluded.payment_status,
        payment_reference = excluded.payment_reference;

  insert into public.compliance_rules (id, rule_name, rule_type)
  values
    (rule_contact_window_id, 'Quiet Hours Enforcement', 'contact_window'),
    (rule_consent_id, 'Channel Consent Validation', 'consent')
  on conflict (id) do update
    set rule_name = excluded.rule_name,
        rule_type = excluded.rule_type;

  insert into public.compliance_events (id, account_id, rule_id, result)
  values
    ('f3333333-3333-4333-8333-333333333331', account_1_id, rule_contact_window_id, 'allowed'),
    ('f3333333-3333-4333-8333-333333333332', account_4_id, rule_contact_window_id, 'blocked'),
    ('f3333333-3333-4333-8333-333333333333', account_2_id, rule_consent_id, 'allowed')
  on conflict (id) do update
    set account_id = excluded.account_id,
        rule_id = excluded.rule_id,
        result = excluded.result;

  insert into public.portal_users (id, auth_user_id, email, role, client_id, debtor_id)
  values
    ('99999999-9999-4999-8999-999999999991', staff_auth_id, 'staff.admin@platform.local', 'staff', null, null),
    ('99999999-9999-4999-8999-999999999992', client_user_abc_auth_id, 'ops@abcbank.local', 'client', client_abc_id, null),
    ('99999999-9999-4999-8999-999999999993', client_user_xyz_auth_id, 'ops@xyzfinance.local', 'client', client_xyz_id, null),
    ('99999999-9999-4999-8999-999999999994', debtor_auth_1, 'maria.johnson@debtor.local', 'debtor', client_abc_id, debtor_abc_1_id),
    ('99999999-9999-4999-8999-999999999995', debtor_auth_2, 'liam.carter@debtor.local', 'debtor', client_abc_id, debtor_abc_2_id),
    ('99999999-9999-4999-8999-999999999996', debtor_auth_3, 'priya.patel@debtor.local', 'debtor', client_abc_id, debtor_abc_3_id),
    ('99999999-9999-4999-8999-999999999997', debtor_auth_4, 'sofia.nguyen@debtor.local', 'debtor', client_xyz_id, debtor_xyz_1_id),
    ('99999999-9999-4999-8999-999999999998', debtor_auth_5, 'ethan.smith@debtor.local', 'debtor', client_xyz_id, debtor_xyz_2_id),
    ('99999999-9999-4999-8999-999999999999', debtor_auth_6, 'olivia.wright@debtor.local', 'debtor', client_xyz_id, debtor_xyz_3_id)
  on conflict (id) do update
    set auth_user_id = excluded.auth_user_id,
        email = excluded.email,
        role = excluded.role,
        client_id = excluded.client_id,
        debtor_id = excluded.debtor_id;
end $$;

drop function if exists public.seed_create_auth_user(uuid, text, text, text);
