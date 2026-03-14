create index if not exists campaigns_created_at_idx on public.campaigns (created_at desc);
create index if not exists campaigns_channel_idx on public.campaigns (channel);
create index if not exists messages_status_idx on public.messages (status);
create index if not exists messages_channel_idx on public.messages (channel);
