-- LMS kit: buckets + policies de storage.
-- Requiere 01_schema (profiles) para las policies que checan role = 'admin'.

insert into storage.buckets (id, name, public)
values
  ('docs', 'docs', true),
  ('thumbnails', 'thumbnails', true),
  ('question_images', 'question_images', true),
  ('certificates', 'certificates', true),
  ('certificate-assets', 'certificate-assets', true),
  ('assignment-submissions', 'assignment-submissions', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- docs
drop policy if exists "Public Access for docs" on storage.objects;
create policy "Public Access for docs" on storage.objects
  for select using (bucket_id = 'docs');
drop policy if exists "Authenticated users can upload to docs" on storage.objects;
create policy "Authenticated users can upload to docs" on storage.objects
  for insert to authenticated with check (bucket_id = 'docs');
drop policy if exists "Authenticated users can update docs" on storage.objects;
create policy "Authenticated users can update docs" on storage.objects
  for update to authenticated using (bucket_id = 'docs');
drop policy if exists "Authenticated users can delete from docs" on storage.objects;
create policy "Authenticated users can delete from docs" on storage.objects
  for delete to authenticated using (bucket_id = 'docs');

-- thumbnails
drop policy if exists "Public Access for thumbnails" on storage.objects;
create policy "Public Access for thumbnails" on storage.objects
  for select using (bucket_id = 'thumbnails');
drop policy if exists "Authenticated users can upload to thumbnails" on storage.objects;
create policy "Authenticated users can upload to thumbnails" on storage.objects
  for insert to authenticated with check (bucket_id = 'thumbnails');
drop policy if exists "Authenticated users can update thumbnails" on storage.objects;
create policy "Authenticated users can update thumbnails" on storage.objects
  for update to authenticated using (bucket_id = 'thumbnails');
drop policy if exists "Authenticated users can delete from thumbnails" on storage.objects;
create policy "Authenticated users can delete from thumbnails" on storage.objects
  for delete to authenticated using (bucket_id = 'thumbnails');

-- question_images
drop policy if exists "Public Access for Question Images" on storage.objects;
create policy "Public Access for Question Images" on storage.objects
  for select using (bucket_id = 'question_images');
drop policy if exists "Admins can upload Question Images" on storage.objects;
create policy "Admins can upload Question Images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'question_images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Admins can delete Question Images" on storage.objects;
create policy "Admins can delete Question Images" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'question_images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- certificates PDFs
drop policy if exists "Public Access for certificates" on storage.objects;
create policy "Public Access for certificates" on storage.objects
  for select using (bucket_id = 'certificates');
drop policy if exists "Admins can upload certificates" on storage.objects;
create policy "Admins can upload certificates" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'certificates'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
drop policy if exists "Admins can delete certificates" on storage.objects;
create policy "Admins can delete certificates" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'certificates'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- certificate-assets (fondos / firmas)
drop policy if exists "Public Access for certificate-assets" on storage.objects;
create policy "Public Access for certificate-assets" on storage.objects
  for select using (bucket_id = 'certificate-assets');
drop policy if exists "Authenticated users can upload certificate-assets" on storage.objects;
create policy "Authenticated users can upload certificate-assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'certificate-assets');
drop policy if exists "Authenticated users can update certificate-assets" on storage.objects;
create policy "Authenticated users can update certificate-assets" on storage.objects
  for update to authenticated using (bucket_id = 'certificate-assets');
drop policy if exists "Authenticated users can delete certificate-assets" on storage.objects;
create policy "Authenticated users can delete certificate-assets" on storage.objects
  for delete to authenticated using (bucket_id = 'certificate-assets');

-- assignment-submissions
drop policy if exists "assignments_public_access" on storage.objects;
create policy "assignments_public_access" on storage.objects
  for select using (bucket_id = 'assignment-submissions');
drop policy if exists "assignments_insert" on storage.objects;
create policy "assignments_insert" on storage.objects
  for insert with check (bucket_id = 'assignment-submissions' and auth.role() = 'authenticated');
drop policy if exists "assignments_update" on storage.objects;
create policy "assignments_update" on storage.objects
  for update using (bucket_id = 'assignment-submissions' and auth.role() = 'authenticated');
drop policy if exists "assignments_delete" on storage.objects;
create policy "assignments_delete" on storage.objects
  for delete using (bucket_id = 'assignment-submissions' and auth.role() = 'authenticated');

-- avatars
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "Users can upload their own avatars" on storage.objects;
create policy "Users can upload their own avatars" on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');
drop policy if exists "Users can update their own avatars" on storage.objects;
create policy "Users can update their own avatars" on storage.objects
  for update to authenticated using (bucket_id = 'avatars');
drop policy if exists "Users can delete their own avatars" on storage.objects;
create policy "Users can delete their own avatars" on storage.objects
  for delete to authenticated using (bucket_id = 'avatars');
