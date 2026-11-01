-- Allow signed-in Pinfolio users to improve shared catalog records.
-- Personal collection data remains protected by collection_items RLS.
drop policy if exists "Creators update their pins" on public.pins;
create policy "Creators and users update shared catalog pins"
on public.pins
for update
to authenticated
using (created_by = auth.uid() or is_catalog = true)
with check (created_by = auth.uid() or is_catalog = true);

grant select, insert, update on public.pins to authenticated;
