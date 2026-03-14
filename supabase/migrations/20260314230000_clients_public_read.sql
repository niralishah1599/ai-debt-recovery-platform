-- Allow unauthenticated (anon) users to read client id and name.
-- This is needed to populate the client dropdown on the registration page.
-- Client names are not sensitive — they are creditor organization names.

drop policy if exists clients_anon_select on public.clients;
create policy clients_anon_select
on public.clients
for select
to anon
using (true);
