-- Private conversation attachments for plans, PDFs, images, and project documents.
begin;

alter table public.inquiry_messages
  add column if not exists attachment_names text[] not null default '{}',
  add column if not exists attachment_paths text[] not null default '{}',
  add column if not exists attachment_types text[] not null default '{}',
  add column if not exists immediate_email_status text,
  add column if not exists immediate_email_sent_at timestamptz,
  add column if not exists immediate_email_error text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('message-attachments', 'message-attachments', false, 20971520)
on conflict (id) do update
set public = excluded.public, file_size_limit = excluded.file_size_limit;

drop policy if exists "message_attachments_select_participants" on storage.objects;
create policy "message_attachments_select_participants"
on storage.objects for select to authenticated
using (
  bucket_id = 'message-attachments'
  and public.can_access_inquiry(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "message_attachments_insert_participants" on storage.objects;
create policy "message_attachments_insert_participants"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'message-attachments'
  and public.can_access_inquiry(((storage.foldername(name))[1])::uuid)
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "message_attachments_delete_uploader" on storage.objects;
create policy "message_attachments_delete_uploader"
on storage.objects for delete to authenticated
using (
  bucket_id = 'message-attachments'
  and public.can_access_inquiry(((storage.foldername(name))[1])::uuid)
  and (storage.foldername(name))[2] = auth.uid()::text
);

commit;
