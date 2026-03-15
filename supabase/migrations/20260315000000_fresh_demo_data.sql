-- ============================================================
-- Fresh Demo Data — wipe everything, recreate clean demo state
-- ============================================================

create extension if not exists pgcrypto;

do $$
begin

  -- -------------------------------------------------------
  -- 1. WIPE public tables (dependency order)
  -- -------------------------------------------------------
  delete from public.debtor_milestones;
  delete from public.compliance_events;
  delete from public.payments;
  delete from public.messages;
  delete from public.compliance_rules;
  delete from public.campaigns;
  delete from public.accounts;
  delete from public.debtors;
  delete from public.portal_users;
  delete from public.clients;

  -- -------------------------------------------------------
  -- 2. WIPE auth tables (dependency order)
  -- -------------------------------------------------------
  delete from auth.mfa_amr_claims;
  delete from auth.mfa_challenges;
  delete from auth.mfa_factors;
  delete from auth.refresh_tokens;
  delete from auth.sessions;
  delete from auth.identities;
  delete from auth.users;

end $$;

-- -------------------------------------------------------
-- 3. RE-CREATE DEMO DATA via helper function
-- -------------------------------------------------------

create or replace function public._demo_upsert_auth_user(
  p_id        uuid,
  p_email     text,
  p_password  text,
  p_meta_role text,
  p_meta_extra jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user, is_anonymous,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    p_id, 'authenticated', 'authenticated', p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
    timezone('utc', now()),
    '', '', '', '',
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('role', p_meta_role) || p_meta_extra,
    false, false, false,
    timezone('utc', now()), timezone('utc', now())
  ) on conflict (id) do update
    set email = excluded.email,
        encrypted_password = excluded.encrypted_password,
        raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = timezone('utc', now());

  insert into auth.identities (
    id, user_id,
    identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) values (
    p_id, p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email),
    'email', p_email,
    timezone('utc', now()), timezone('utc', now()), timezone('utc', now())
  ) on conflict (provider, provider_id) do update
    set identity_data = excluded.identity_data,
        updated_at    = timezone('utc', now());
end;
$$;

do $$
declare
  -- ─── Staff ────────────────────────────────────────────
  staff_id      uuid := gen_random_uuid();

  -- ─── Clients ──────────────────────────────────────────
  apex_id       uuid := gen_random_uuid();
  summit_id     uuid := gen_random_uuid();
  metro_id      uuid := gen_random_uuid();

  apex_user_id  uuid := gen_random_uuid();
  summit_user_id uuid := gen_random_uuid();
  metro_user_id  uuid := gen_random_uuid();

  -- ─── Debtors — Apex Financial ─────────────────────────
  d_jp_id       uuid := gen_random_uuid();   -- James Patterson  active
  d_er_id       uuid := gen_random_uuid();   -- Emily Rodriguez  paid
  d_mt_id       uuid := gen_random_uuid();   -- Michael Torres   active
  d_lw_id       uuid := gen_random_uuid();   -- Lisa Wang        suppressed

  d_jp_auth     uuid := gen_random_uuid();
  d_er_auth     uuid := gen_random_uuid();
  d_mt_auth     uuid := gen_random_uuid();
  d_lw_auth     uuid := gen_random_uuid();

  -- ─── Debtors — Summit Credit Union ────────────────────
  d_dn_id       uuid := gen_random_uuid();   -- David Nguyen     paid
  d_af_id       uuid := gen_random_uuid();   -- Amanda Foster    active
  d_rk_id       uuid := gen_random_uuid();   -- Robert Kim       closed

  d_dn_auth     uuid := gen_random_uuid();
  d_af_auth     uuid := gen_random_uuid();
  d_rk_auth     uuid := gen_random_uuid();

  -- ─── Debtors — Metro Collections ──────────────────────
  d_jm_id       uuid := gen_random_uuid();   -- Jennifer Moore   active
  d_cm_id       uuid := gen_random_uuid();   -- Chris Martinez   active

  d_jm_auth     uuid := gen_random_uuid();
  d_cm_auth     uuid := gen_random_uuid();

  -- ─── Accounts ─────────────────────────────────────────
  acc_jp        uuid := gen_random_uuid();
  acc_er        uuid := gen_random_uuid();
  acc_mt        uuid := gen_random_uuid();
  acc_lw        uuid := gen_random_uuid();
  acc_dn        uuid := gen_random_uuid();
  acc_af        uuid := gen_random_uuid();
  acc_rk        uuid := gen_random_uuid();
  acc_jm        uuid := gen_random_uuid();
  acc_cm        uuid := gen_random_uuid();

  -- ─── Campaigns ────────────────────────────────────────
  camp_apex_email uuid := gen_random_uuid();
  camp_apex_sms   uuid := gen_random_uuid();
  camp_summit_email uuid := gen_random_uuid();
  camp_metro_email  uuid := gen_random_uuid();

  -- ─── Compliance Rules ─────────────────────────────────
  rule_hours    uuid := gen_random_uuid();
  rule_freq     uuid := gen_random_uuid();
  rule_optout   uuid := gen_random_uuid();
  rule_sms_consent uuid := gen_random_uuid();
  rule_miranda  uuid := gen_random_uuid();
  rule_cease    uuid := gen_random_uuid();

begin

  -- =====================================================================
  -- AUTH USERS
  -- =====================================================================

  -- Staff admin
  perform public._demo_upsert_auth_user(
    staff_id, 'admin@recoveryai.com', 'Staff@123', 'staff'
  );

  -- Client portal users
  perform public._demo_upsert_auth_user(
    apex_user_id, 'sarah.chen@apexfinancial.com', 'Client@123', 'client'
  );
  perform public._demo_upsert_auth_user(
    summit_user_id, 'mark.johnson@summitcu.com', 'Client@123', 'client'
  );
  perform public._demo_upsert_auth_user(
    metro_user_id, 'lisa.park@metrocollections.com', 'Client@123', 'client'
  );

  -- Debtor portal users — Apex
  perform public._demo_upsert_auth_user(
    d_jp_auth, 'james.patterson@gmail.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_jp_id::text)
  );
  perform public._demo_upsert_auth_user(
    d_er_auth, 'emily.rodriguez@gmail.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_er_id::text)
  );
  perform public._demo_upsert_auth_user(
    d_mt_auth, 'michael.torres@yahoo.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_mt_id::text)
  );
  perform public._demo_upsert_auth_user(
    d_lw_auth, 'lisa.wang@gmail.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_lw_id::text)
  );

  -- Debtor portal users — Summit
  perform public._demo_upsert_auth_user(
    d_dn_auth, 'david.nguyen@gmail.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_dn_id::text)
  );
  perform public._demo_upsert_auth_user(
    d_af_auth, 'amanda.foster@gmail.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_af_id::text)
  );
  perform public._demo_upsert_auth_user(
    d_rk_auth, 'robert.kim@yahoo.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_rk_id::text)
  );

  -- Debtor portal users — Metro
  perform public._demo_upsert_auth_user(
    d_jm_auth, 'jennifer.moore@gmail.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_jm_id::text)
  );
  perform public._demo_upsert_auth_user(
    d_cm_auth, 'chris.martinez@gmail.com', 'Debtor@123', 'debtor',
    jsonb_build_object('debtor_id', d_cm_id::text)
  );

  -- =====================================================================
  -- CLIENTS (Creditor organisations)
  -- =====================================================================
  insert into public.clients (id, name) values
    (apex_id,   'Apex Financial Services'),
    (summit_id, 'Summit Credit Union'),
    (metro_id,  'Metro Collections Group');

  -- =====================================================================
  -- DEBTORS  (must exist before portal_users debtor_id FK)
  -- =====================================================================
  -- Apex Financial Services
  insert into public.debtors
    (id, name, email, phone, client_id, email_consent, sms_consent, timezone, contact_window_start, contact_window_end)
  values
    (d_jp_id, 'James Patterson',  'james.patterson@gmail.com', '+1-555-210-4401', apex_id, true,  true,  'America/New_York',    8, 20),
    (d_er_id, 'Emily Rodriguez',  'emily.rodriguez@gmail.com', '+1-555-210-4402', apex_id, true,  false, 'America/Chicago',     8, 21),
    (d_mt_id, 'Michael Torres',   'michael.torres@yahoo.com',  '+1-555-210-4403', apex_id, true,  true,  'America/Los_Angeles', 9, 20),
    (d_lw_id, 'Lisa Wang',        'lisa.wang@gmail.com',        '+1-555-210-4404', apex_id, false, false, 'America/New_York',    8, 20);

  -- Summit Credit Union
  insert into public.debtors
    (id, name, email, phone, client_id, email_consent, sms_consent, timezone, contact_window_start, contact_window_end)
  values
    (d_dn_id, 'David Nguyen',   'david.nguyen@gmail.com',  '+1-555-310-5501', summit_id, true, true,  'America/Los_Angeles', 8, 20),
    (d_af_id, 'Amanda Foster',  'amanda.foster@gmail.com', '+1-555-310-5502', summit_id, true, true,  'America/Denver',      9, 21),
    (d_rk_id, 'Robert Kim',     'robert.kim@yahoo.com',    '+1-555-310-5503', summit_id, true, false, 'America/Chicago',     8, 20);

  -- Metro Collections Group
  insert into public.debtors
    (id, name, email, phone, client_id, email_consent, sms_consent, timezone, contact_window_start, contact_window_end)
  values
    (d_jm_id, 'Jennifer Moore',  'jennifer.moore@gmail.com', '+1-555-410-6601', metro_id, true, true, 'America/New_York',    8, 20),
    (d_cm_id, 'Chris Martinez',  'chris.martinez@gmail.com', '+1-555-410-6602', metro_id, true, true, 'America/Phoenix',     8, 20);

  -- =====================================================================
  -- PORTAL USERS
  -- =====================================================================
  -- Staff
  insert into public.portal_users (auth_user_id, email, role)
    values (staff_id, 'admin@recoveryai.com', 'staff');

  -- Clients
  insert into public.portal_users (auth_user_id, email, role, client_id) values
    (apex_user_id,   'sarah.chen@apexfinancial.com',    'client', apex_id),
    (summit_user_id, 'mark.johnson@summitcu.com',        'client', summit_id),
    (metro_user_id,  'lisa.park@metrocollections.com',   'client', metro_id);

  -- Debtors — Apex Financial
  insert into public.portal_users (auth_user_id, email, role, client_id, debtor_id) values
    (d_jp_auth, 'james.patterson@gmail.com', 'debtor', apex_id, d_jp_id),
    (d_er_auth, 'emily.rodriguez@gmail.com', 'debtor', apex_id, d_er_id),
    (d_mt_auth, 'michael.torres@yahoo.com',  'debtor', apex_id, d_mt_id),
    (d_lw_auth, 'lisa.wang@gmail.com',        'debtor', apex_id, d_lw_id);

  -- Debtors — Summit Credit Union
  insert into public.portal_users (auth_user_id, email, role, client_id, debtor_id) values
    (d_dn_auth, 'david.nguyen@gmail.com',   'debtor', summit_id, d_dn_id),
    (d_af_auth, 'amanda.foster@gmail.com',  'debtor', summit_id, d_af_id),
    (d_rk_auth, 'robert.kim@yahoo.com',     'debtor', summit_id, d_rk_id);

  -- Debtors — Metro Collections
  insert into public.portal_users (auth_user_id, email, role, client_id, debtor_id) values
    (d_jm_auth, 'jennifer.moore@gmail.com',  'debtor', metro_id, d_jm_id),
    (d_cm_auth, 'chris.martinez@gmail.com',  'debtor', metro_id, d_cm_id);

  -- =====================================================================
  -- ACCOUNTS
  -- =====================================================================
  insert into public.accounts (id, debtor_id, client_id, balance, original_balance, status) values
    -- Apex Financial
    (acc_jp, d_jp_id, apex_id,    8500.00,  8500.00, 'active'),
    (acc_er, d_er_id, apex_id,       0.00,  3200.00, 'paid'),
    (acc_mt, d_mt_id, apex_id,   12000.00, 12000.00, 'active'),
    (acc_lw, d_lw_id, apex_id,    5750.00,  5750.00, 'suppressed'),
    -- Summit Credit Union
    (acc_dn, d_dn_id, summit_id,     0.00,  2100.00, 'paid'),
    (acc_af, d_af_id, summit_id, 15000.00, 15000.00, 'active'),
    (acc_rk, d_rk_id, summit_id,     0.00,  4500.00, 'closed'),
    -- Metro Collections
    (acc_jm, d_jm_id, metro_id,   8900.00,  8900.00, 'active'),
    (acc_cm, d_cm_id, metro_id,   6300.00,  6300.00, 'active');

  -- =====================================================================
  -- COMPLIANCE RULES
  -- =====================================================================
  insert into public.compliance_rules (id, rule_name, rule_type) values
    (rule_hours,       'FDCPA Contact Hours (8am–9pm)',          'time_restriction'),
    (rule_freq,        '7-Day Contact Frequency Limit',          'frequency_cap'),
    (rule_optout,      'Email Opt-Out Enforcement',              'channel_suppression'),
    (rule_sms_consent, 'SMS Consent Required (TCPA)',            'consent_check'),
    (rule_miranda,     'Mini-Miranda Disclosure Required',       'disclosure'),
    (rule_cease,       'Cease and Desist Compliance',            'suppression');

  -- =====================================================================
  -- CAMPAIGNS
  -- =====================================================================
  insert into public.campaigns (id, name, channel, message_template) values
    (camp_apex_email,
      'Q1 2026 Email Recovery — Apex',
      'email',
      'Dear {{debtor_name}}, your account with Apex Financial Services has an outstanding balance of ${{balance}}. Please contact us to arrange a payment plan. Call 1-800-APX-DEBT or visit our portal. This is an attempt to collect a debt.'
    ),
    (camp_apex_sms,
      'SMS Payment Reminder — Apex',
      'sms',
      'Apex Financial: You have an outstanding balance of ${{balance}}. Reply STOP to opt out. Call 1-800-APX-DEBT.'
    ),
    (camp_summit_email,
      'Spring Recovery Campaign — Summit CU',
      'email',
      'Dear {{debtor_name}}, Summit Credit Union is reaching out regarding your account balance of ${{balance}}. We offer flexible payment arrangements. Log in at summitcu.portal or call 1-888-SMT-HELP.'
    ),
    (camp_metro_email,
      'Priority Email Outreach — Metro Collections',
      'email',
      'Dear {{debtor_name}}, Metro Collections Group is contacting you on behalf of your creditor. Your current balance is ${{balance}}. Please call 1-877-MET-COLL or log in to your debtor portal to resolve this account.'
    );

  -- =====================================================================
  -- MESSAGES (campaign activity)
  -- =====================================================================
  -- Apex email campaign messages
  insert into public.messages (account_id, campaign_id, channel, status, sent_at) values
    (acc_jp, camp_apex_email, 'email', 'delivered', now() - interval '14 days'),
    (acc_jp, camp_apex_email, 'email', 'delivered', now() - interval '7 days'),
    (acc_er, camp_apex_email, 'email', 'delivered', now() - interval '30 days'),
    (acc_mt, camp_apex_email, 'email', 'delivered', now() - interval '10 days'),
    (acc_mt, camp_apex_email, 'email', 'sent',       now() - interval '3 days'),
    (acc_lw, camp_apex_email, 'email', 'blocked',    now() - interval '5 days');

  -- Apex SMS messages
  insert into public.messages (account_id, campaign_id, channel, status, sent_at) values
    (acc_jp, camp_apex_sms, 'sms', 'delivered', now() - interval '12 days'),
    (acc_mt, camp_apex_sms, 'sms', 'delivered', now() - interval '8 days'),
    (acc_lw, camp_apex_sms, 'sms', 'blocked',   now() - interval '4 days');

  -- Summit email campaign messages
  insert into public.messages (account_id, campaign_id, channel, status, sent_at) values
    (acc_dn, camp_summit_email, 'email', 'delivered', now() - interval '25 days'),
    (acc_af, camp_summit_email, 'email', 'delivered', now() - interval '15 days'),
    (acc_af, camp_summit_email, 'email', 'delivered', now() - interval '6 days'),
    (acc_rk, camp_summit_email, 'email', 'delivered', now() - interval '40 days');

  -- Metro email campaign messages
  insert into public.messages (account_id, campaign_id, channel, status, sent_at) values
    (acc_jm, camp_metro_email, 'email', 'delivered', now() - interval '9 days'),
    (acc_jm, camp_metro_email, 'email', 'sent',       now() - interval '2 days'),
    (acc_cm, camp_metro_email, 'email', 'delivered', now() - interval '11 days'),
    (acc_cm, camp_metro_email, 'email', 'queued',     now());

  -- =====================================================================
  -- PAYMENTS
  -- =====================================================================
  -- Emily Rodriguez — fully paid (Apex)
  insert into public.payments (account_id, amount, payment_status, payment_reference, created_at) values
    (acc_er, 1600.00, 'succeeded', 'PAY-APEX-001', now() - interval '45 days'),
    (acc_er, 1600.00, 'succeeded', 'PAY-APEX-002', now() - interval '30 days');

  -- David Nguyen — fully paid (Summit)
  insert into public.payments (account_id, amount, payment_status, payment_reference, created_at) values
    (acc_dn, 2100.00, 'succeeded', 'PAY-SUMM-001', now() - interval '20 days');

  -- Robert Kim — closed with write-off partial payments
  insert into public.payments (account_id, amount, payment_status, payment_reference, created_at) values
    (acc_rk, 1500.00, 'succeeded', 'PAY-SUMM-002', now() - interval '60 days'),
    (acc_rk, 1500.00, 'succeeded', 'PAY-SUMM-003', now() - interval '45 days'),
    (acc_rk, 1500.00, 'succeeded', 'PAY-SUMM-004', now() - interval '35 days');

  -- James Patterson — partial payment (Apex, active)
  insert into public.payments (account_id, amount, payment_status, payment_reference, created_at) values
    (acc_jp, 500.00, 'succeeded', 'PAY-APEX-003', now() - interval '10 days');

  -- Amanda Foster — pending payment attempt (Summit, active)
  insert into public.payments (account_id, amount, payment_status, payment_reference, created_at) values
    (acc_af, 1000.00, 'pending', 'PAY-SUMM-005', now() - interval '1 day');

  -- =====================================================================
  -- COMPLIANCE EVENTS
  -- =====================================================================
  insert into public.compliance_events (account_id, rule_id, result) values
    (acc_jp, rule_hours,       'allowed'),
    (acc_jp, rule_freq,        'allowed'),
    (acc_jp, rule_optout,      'allowed'),
    (acc_mt, rule_hours,       'allowed'),
    (acc_mt, rule_sms_consent, 'allowed'),
    (acc_lw, rule_optout,      'blocked'),
    (acc_lw, rule_sms_consent, 'blocked'),
    (acc_af, rule_hours,       'allowed'),
    (acc_af, rule_freq,        'flagged'),
    (acc_jm, rule_hours,       'allowed'),
    (acc_jm, rule_miranda,     'allowed'),
    (acc_cm, rule_hours,       'allowed');

  -- =====================================================================
  -- DEBTOR MILESTONES (gamification)
  -- milestone_key: 'first_payment' | 'quarter_way' | 'halfway' | 'almost_free' | 'debt_free'
  -- =====================================================================
  insert into public.debtor_milestones (debtor_id, account_id, milestone_key, points) values
    (d_er_id, acc_er, 'first_payment', 100),
    (d_er_id, acc_er, 'quarter_way',   150),
    (d_er_id, acc_er, 'halfway',       200),
    (d_er_id, acc_er, 'almost_free',   300),
    (d_er_id, acc_er, 'debt_free',     500),
    (d_dn_id, acc_dn, 'first_payment', 100),
    (d_dn_id, acc_dn, 'debt_free',     500),
    (d_jp_id, acc_jp, 'first_payment', 100),
    (d_rk_id, acc_rk, 'first_payment', 100),
    (d_rk_id, acc_rk, 'quarter_way',   150),
    (d_rk_id, acc_rk, 'halfway',       200),
    (d_rk_id, acc_rk, 'almost_free',   300),
    (d_rk_id, acc_rk, 'debt_free',     500);

end $$;

-- Clean up helper function
drop function if exists public._demo_upsert_auth_user(uuid, text, text, text, jsonb);
