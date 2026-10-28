-- Public profile icons. Each signed-in user may manage only files in their own UUID folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own profile avatars" on storage.objects;
create policy "Users upload own profile avatars" on storage.objects
for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users update own profile avatars" on storage.objects;
create policy "Users update own profile avatars" on storage.objects
for update to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete own profile avatars" on storage.objects;
create policy "Users delete own profile avatars" on storage.objects
for delete to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
