do $$
begin
  if not exists (select 1 from pg_class where relname = 'clients' and relkind = 'r') then
    raise exception 'Missing table: public.clients';
  end if;
  if not exists (select 1 from pg_class where relname = 'portal_users' and relkind = 'r') then
    raise exception 'Missing table: public.portal_users';
  end if;
  if not exists (select 1 from pg_class where relname = 'debtors' and relkind = 'r') then
    raise exception 'Missing table: public.debtors';
  end if;
  if not exists (select 1 from pg_class where relname = 'accounts' and relkind = 'r') then
    raise exception 'Missing table: public.accounts';
  end if;
  if not exists (select 1 from pg_class where relname = 'campaigns' and relkind = 'r') then
    raise exception 'Missing table: public.campaigns';
  end if;
  if not exists (select 1 from pg_class where relname = 'messages' and relkind = 'r') then
    raise exception 'Missing table: public.messages';
  end if;
  if not exists (select 1 from pg_class where relname = 'payments' and relkind = 'r') then
    raise exception 'Missing table: public.payments';
  end if;
  if not exists (select 1 from pg_class where relname = 'compliance_rules' and relkind = 'r') then
    raise exception 'Missing table: public.compliance_rules';
  end if;
  if not exists (select 1 from pg_class where relname = 'compliance_events' and relkind = 'r') then
    raise exception 'Missing table: public.compliance_events';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'accounts'
      and constraint_type = 'FOREIGN KEY'
      and constraint_name = 'accounts_debtor_id_fkey'
  ) then
    raise exception 'Missing FK: accounts.debtor_id';
  end if;

  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'accounts'
      and constraint_type = 'FOREIGN KEY'
      and constraint_name = 'accounts_client_id_fkey'
  ) then
    raise exception 'Missing FK: accounts.client_id';
  end if;

  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'messages'
      and constraint_type = 'FOREIGN KEY'
      and constraint_name = 'messages_campaign_id_fkey'
  ) then
    raise exception 'Missing FK: messages.campaign_id';
  end if;

  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'compliance_events'
      and constraint_type = 'FOREIGN KEY'
      and constraint_name = 'compliance_events_rule_id_fkey'
  ) then
    raise exception 'Missing FK: compliance_events.rule_id';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'accounts_client_id_idx'
      and c.relkind = 'i'
  ) then
    raise exception 'Missing index: accounts_client_id_idx';
  end if;

  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'messages_account_id_idx'
      and c.relkind = 'i'
  ) then
    raise exception 'Missing index: messages_account_id_idx';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'clients',
        'portal_users',
        'debtors',
        'accounts',
        'campaigns',
        'messages',
        'payments',
        'compliance_rules',
        'compliance_events'
      )
      and c.relrowsecurity = false
  ) then
    raise exception 'RLS is not enabled on one or more required tables';
  end if;
end $$;
