-- Seed Sunrise Bank client, portal user, and sample data.
-- Handles the case where recovery@sunrisebank.com already exists in auth.users.

create extension if not exists pgcrypto;

do $$
declare
  sunrise_auth_id   uuid;
  sunrise_client_id uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00002222';

  debtor_sr_1_id    uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00003331';
  debtor_sr_2_id    uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00003332';
  debtor_sr_3_id    uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00003333';

  debtor_sr_auth_1  uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00004441';
  debtor_sr_auth_2  uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00004442';
  debtor_sr_auth_3  uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00004443';

  account_sr_1_id   uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00005551';
  account_sr_2_id   uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00005552';
  account_sr_3_id   uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00005553';

  campaign_sr_id    uuid := 'aaaabbbb-cccc-4ddd-8eee-ffff00006661';
begin

  -- -------------------------------------------------------
  -- 1. Resolve auth user for recovery@sunrisebank.com
  --    Use existing record if already present, else insert.
  -- -------------------------------------------------------
  select id into sunrise_auth_id
  from auth.users
  where email = 'recovery@sunrisebank.com'
  limit 1;

  if sunrise_auth_id is null then
    sunrise_auth_id := 'aaaabbbb-cccc-4ddd-8eee-ffff00001111';

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, confirmation_token, recovery_token,
      email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, is_sso_user, is_anonymous,
      created_at, updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      sunrise_auth_id,
      'authenticated', 'authenticated',
      'recovery@sunrisebank.com',
      extensions.crypt('Client@123', extensions.gen_salt('bf', 10)),
      timezone('utc', now()),
      '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('role', 'client', 'client_id', sunrise_client_id::text),
      false, false, false,
      timezone('utc', now()), timezone('utc', now())
    );

    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, created_at, updated_at
    )
    values (
      gen_random_uuid(),
      sunrise_auth_id,
      jsonb_build_object('sub', sunrise_auth_id::text, 'email', 'recovery@sunrisebank.com', 'email_verified', true),
      'email', sunrise_auth_id::text,
      timezone('utc', now()), timezone('utc', now())
    )
    on conflict (provider, provider_id) do update
      set identity_data = excluded.identity_data,
          updated_at    = timezone('utc', now());
  else
    -- Update existing user metadata to include client_id so login auto-patches portal_users
    update auth.users
    set
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('role', 'client', 'client_id', sunrise_client_id::text),
      email_confirmed_at = coalesce(email_confirmed_at, timezone('utc', now())),
      updated_at         = timezone('utc', now())
    where id = sunrise_auth_id;
  end if;

  -- -------------------------------------------------------
  -- 2. Auth users for Sunrise Bank debtors
  -- -------------------------------------------------------
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token,
    email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user, is_anonymous,
    created_at, updated_at
  )
  values
    (
      '00000000-0000-0000-0000-000000000000', debtor_sr_auth_1,
      'authenticated', 'authenticated', 'rahul.sharma@debtor.local',
      extensions.crypt('TempPass#2026', extensions.gen_salt('bf', 10)),
      timezone('utc', now()), '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('role', 'debtor'),
      false, false, false, timezone('utc', now()), timezone('utc', now())
    ),
    (
      '00000000-0000-0000-0000-000000000000', debtor_sr_auth_2,
      'authenticated', 'authenticated', 'anjali.mehta@debtor.local',
      extensions.crypt('TempPass#2026', extensions.gen_salt('bf', 10)),
      timezone('utc', now()), '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('role', 'debtor'),
      false, false, false, timezone('utc', now()), timezone('utc', now())
    ),
    (
      '00000000-0000-0000-0000-000000000000', debtor_sr_auth_3,
      'authenticated', 'authenticated', 'vikram.nair@debtor.local',
      extensions.crypt('TempPass#2026', extensions.gen_salt('bf', 10)),
      timezone('utc', now()), '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('role', 'debtor'),
      false, false, false, timezone('utc', now()), timezone('utc', now())
    )
  on conflict (id) do update
    set email              = excluded.email,
        encrypted_password = excluded.encrypted_password,
        updated_at         = timezone('utc', now());

  insert into auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
  values
    (
      gen_random_uuid(), debtor_sr_auth_1,
      jsonb_build_object('sub', debtor_sr_auth_1::text, 'email', 'rahul.sharma@debtor.local', 'email_verified', true),
      'email', debtor_sr_auth_1::text, timezone('utc', now()), timezone('utc', now())
    ),
    (
      gen_random_uuid(), debtor_sr_auth_2,
      jsonb_build_object('sub', debtor_sr_auth_2::text, 'email', 'anjali.mehta@debtor.local', 'email_verified', true),
      'email', debtor_sr_auth_2::text, timezone('utc', now()), timezone('utc', now())
    ),
    (
      gen_random_uuid(), debtor_sr_auth_3,
      jsonb_build_object('sub', debtor_sr_auth_3::text, 'email', 'vikram.nair@debtor.local', 'email_verified', true),
      'email', debtor_sr_auth_3::text, timezone('utc', now()), timezone('utc', now())
    )
  on conflict (provider, provider_id) do update
    set identity_data = excluded.identity_data,
        updated_at    = timezone('utc', now());

  -- -------------------------------------------------------
  -- 3. Sunrise Bank client record
  -- -------------------------------------------------------
  insert into public.clients (id, name)
  values (sunrise_client_id, 'Sunrise Bank')
  on conflict (id) do update set name = excluded.name;

  -- -------------------------------------------------------
  -- 4. Debtors belonging to Sunrise Bank
  -- -------------------------------------------------------
  insert into public.debtors (id, name, email, phone, client_id)
  values
    (debtor_sr_1_id, 'Rahul Sharma', 'rahul.sharma@debtor.local', '+91-9876543210', sunrise_client_id),
    (debtor_sr_2_id, 'Anjali Mehta', 'anjali.mehta@debtor.local', '+91-9876543211', sunrise_client_id),
    (debtor_sr_3_id, 'Vikram Nair',  'vikram.nair@debtor.local',  '+91-9876543212', sunrise_client_id)
  on conflict (id) do update
    set name      = excluded.name,
        email     = excluded.email,
        phone     = excluded.phone,
        client_id = excluded.client_id;

  -- -------------------------------------------------------
  -- 5. Debt accounts for Sunrise Bank debtors
  -- -------------------------------------------------------
  insert into public.accounts (id, debtor_id, client_id, balance, status)
  values
    (account_sr_1_id, debtor_sr_1_id, sunrise_client_id, 3500.00, 'active'),
    (account_sr_2_id, debtor_sr_2_id, sunrise_client_id, 1750.50, 'active'),
    (account_sr_3_id, debtor_sr_3_id, sunrise_client_id,    0.00, 'paid')
  on conflict (id) do update
    set debtor_id = excluded.debtor_id,
        client_id = excluded.client_id,
        balance   = excluded.balance,
        status    = excluded.status;

  -- -------------------------------------------------------
  -- 6. Campaign for Sunrise Bank
  -- -------------------------------------------------------
  insert into public.campaigns (id, name, channel, message_template)
  values (
    campaign_sr_id,
    'Sunrise Bank Payment Reminder',
    'email',
    'Dear customer, your Sunrise Bank account has an outstanding balance. Please log in to your portal to review and make a payment at your earliest convenience.'
  )
  on conflict (id) do update
    set name             = excluded.name,
        channel          = excluded.channel,
        message_template = excluded.message_template;

  -- -------------------------------------------------------
  -- 7. Sample messages
  -- -------------------------------------------------------
  insert into public.messages (id, account_id, campaign_id, channel, status, sent_at)
  values
    ('bbbb1111-1111-4111-8111-111111111101', account_sr_1_id, campaign_sr_id, 'email', 'delivered', timezone('utc', now()) - interval '5 days'),
    ('bbbb1111-1111-4111-8111-111111111102', account_sr_2_id, campaign_sr_id, 'email', 'sent',      timezone('utc', now()) - interval '3 days'),
    ('bbbb1111-1111-4111-8111-111111111103', account_sr_3_id, campaign_sr_id, 'email', 'delivered', timezone('utc', now()) - interval '7 days')
  on conflict (id) do update
    set status  = excluded.status,
        sent_at = excluded.sent_at;

  -- -------------------------------------------------------
  -- 8. Sample payments
  -- -------------------------------------------------------
  insert into public.payments (id, account_id, amount, payment_status, payment_reference)
  values
    ('bbbb2222-2222-4222-8222-222222222201', account_sr_3_id, 1200.00, 'succeeded', 'pay_ref_sr_0001'),
    ('bbbb2222-2222-4222-8222-222222222202', account_sr_1_id,  500.00, 'succeeded', 'pay_ref_sr_0002'),
    ('bbbb2222-2222-4222-8222-222222222203', account_sr_2_id,  250.00, 'pending',   'pay_ref_sr_0003')
  on conflict (id) do update
    set amount            = excluded.amount,
        payment_status    = excluded.payment_status,
        payment_reference = excluded.payment_reference;

  -- -------------------------------------------------------
  -- 9. Portal users — client + debtors
  --    For the client user, use the resolved sunrise_auth_id.
  -- -------------------------------------------------------
  insert into public.portal_users (id, auth_user_id, email, role, client_id, debtor_id)
  values
    ('cccc0001-0000-4000-8000-000000000001', sunrise_auth_id,  'recovery@sunrisebank.com',  'client', sunrise_client_id, null),
    ('cccc0001-0000-4000-8000-000000000002', debtor_sr_auth_1, 'rahul.sharma@debtor.local', 'debtor', sunrise_client_id, debtor_sr_1_id),
    ('cccc0001-0000-4000-8000-000000000003', debtor_sr_auth_2, 'anjali.mehta@debtor.local', 'debtor', sunrise_client_id, debtor_sr_2_id),
    ('cccc0001-0000-4000-8000-000000000004', debtor_sr_auth_3, 'vikram.nair@debtor.local',  'debtor', sunrise_client_id, debtor_sr_3_id)
  on conflict (id) do update
    set auth_user_id = excluded.auth_user_id,
        email        = excluded.email,
        role         = excluded.role,
        client_id    = excluded.client_id,
        debtor_id    = excluded.debtor_id;

  -- Also patch by auth_user_id in case portal_users was already created with null client_id
  update public.portal_users
  set client_id = sunrise_client_id
  where auth_user_id = sunrise_auth_id
    and client_id is null;

end $$;
