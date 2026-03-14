-- Repair seeded auth rows to align with current GoTrue expectations.
-- This targets only local seed users created by the MVP seed migration.

do $$
begin
  update auth.users
  set
    raw_app_meta_data = case
      when raw_app_meta_data is null then jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'))
      else raw_app_meta_data
    end,
    raw_user_meta_data = case
      when raw_user_meta_data is null then '{}'::jsonb
      else raw_user_meta_data
    end,
    is_super_admin = coalesce(is_super_admin, false),
    is_sso_user = coalesce(is_sso_user, false),
    is_anonymous = coalesce(is_anonymous, false),
    email_confirmed_at = coalesce(email_confirmed_at, timezone('utc', now())),
    aud = coalesce(nullif(aud, ''), 'authenticated'),
    role = coalesce(nullif(role, ''), 'authenticated'),
    updated_at = timezone('utc', now())
  where email in (
    'staff.admin@platform.local',
    'ops@abcbank.local',
    'ops@xyzfinance.local',
    'maria.johnson@debtor.local',
    'liam.carter@debtor.local',
    'priya.patel@debtor.local',
    'sofia.nguyen@debtor.local',
    'ethan.smith@debtor.local',
    'olivia.wright@debtor.local'
  );

  update auth.identities i
  set
    identity_data = jsonb_build_object(
      'sub', i.user_id::text,
      'email', u.email,
      'email_verified', true
    ),
    provider = 'email',
    provider_id = i.user_id::text,
    updated_at = timezone('utc', now())
  from auth.users u
  where i.user_id = u.id
    and u.email in (
      'staff.admin@platform.local',
      'ops@abcbank.local',
      'ops@xyzfinance.local',
      'maria.johnson@debtor.local',
      'liam.carter@debtor.local',
      'priya.patel@debtor.local',
      'sofia.nguyen@debtor.local',
      'ethan.smith@debtor.local',
      'olivia.wright@debtor.local'
    );
end $$;
