-- Storage (handover 6.5): bucket "quiz-media".
-- Public bucket = anyone with a picture URL can read it. There is deliberately NO select policy
-- for anon, so strangers cannot LIST objects. Write access only inside the person's own folder
-- (first folder name = auth.uid()). Path: <owner_id>/<media_id>.<ext>

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quiz-media', 'quiz-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy quiz_media_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'quiz-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy quiz_media_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'quiz-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy quiz_media_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'quiz-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'quiz-media' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy quiz_media_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'quiz-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
