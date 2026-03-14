alter table public.debtors
  add column if not exists email_consent boolean not null default true,
  add column if not exists sms_consent boolean not null default true,
  add column if not exists timezone text not null default 'UTC',
  add column if not exists contact_window_start smallint not null default 8,
  add column if not exists contact_window_end smallint not null default 20;

alter table public.debtors
  drop constraint if exists debtors_contact_window_start_check;

alter table public.debtors
  add constraint debtors_contact_window_start_check
  check (contact_window_start between 0 and 23);

alter table public.debtors
  drop constraint if exists debtors_contact_window_end_check;

alter table public.debtors
  add constraint debtors_contact_window_end_check
  check (contact_window_end between 1 and 24);

alter table public.debtors
  drop constraint if exists debtors_contact_window_bounds_check;

alter table public.debtors
  add constraint debtors_contact_window_bounds_check
  check (contact_window_end > contact_window_start);

alter table public.compliance_rules
  add column if not exists is_active boolean not null default true;

alter table public.compliance_events
  add column if not exists campaign_id uuid references public.campaigns (id) on delete set null,
  add column if not exists message_id uuid references public.messages (id) on delete set null,
  add column if not exists channel text,
  add column if not exists detail text not null default '';

alter table public.compliance_events
  drop constraint if exists compliance_events_channel_check;

alter table public.compliance_events
  add constraint compliance_events_channel_check
  check (channel is null or channel in ('email', 'sms'));

create index if not exists compliance_rules_is_active_idx on public.compliance_rules (is_active);
create index if not exists compliance_events_campaign_id_idx on public.compliance_events (campaign_id);
create index if not exists compliance_events_message_id_idx on public.compliance_events (message_id);
create index if not exists compliance_events_created_at_idx on public.compliance_events (created_at desc);

insert into public.compliance_rules (rule_name, rule_type, is_active)
values
  ('Quiet Hours Enforcement', 'contact_window', true),
  ('Channel Consent Validation', 'consent', true),
  ('Account Status Eligibility', 'account_status', true)
on conflict (rule_name)
do update set
  rule_type = excluded.rule_type,
  is_active = excluded.is_active;
