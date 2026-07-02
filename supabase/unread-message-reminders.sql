-- Track one delayed email reminder for unopened requests and messages.
begin;

alter table public.designer_inquiries
  add column if not exists unread_reminder_email_status text not null default 'pending',
  add column if not exists unread_reminder_email_attempts integer not null default 0,
  add column if not exists unread_reminder_email_last_attempt_at timestamptz,
  add column if not exists unread_reminder_email_sent_at timestamptz,
  add column if not exists unread_reminder_email_error text;

alter table public.inquiry_messages
  add column if not exists unread_reminder_email_status text not null default 'pending',
  add column if not exists unread_reminder_email_attempts integer not null default 0,
  add column if not exists unread_reminder_email_last_attempt_at timestamptz,
  add column if not exists unread_reminder_email_sent_at timestamptz,
  add column if not exists unread_reminder_email_error text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'designer_inquiries_unread_reminder_status_check'
  ) then
    alter table public.designer_inquiries
      add constraint designer_inquiries_unread_reminder_status_check
      check (unread_reminder_email_status in ('pending', 'sent', 'failed', 'skipped'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'inquiry_messages_unread_reminder_status_check'
  ) then
    alter table public.inquiry_messages
      add constraint inquiry_messages_unread_reminder_status_check
      check (unread_reminder_email_status in ('pending', 'sent', 'failed', 'skipped'));
  end if;
end;
$$;

create index if not exists designer_inquiries_unread_reminder_idx
on public.designer_inquiries (created_at, unread_reminder_email_status)
where status = 'sent' and unread_reminder_email_attempts < 3;

create index if not exists inquiry_messages_unread_reminder_idx
on public.inquiry_messages (created_at, unread_reminder_email_status)
where read_at is null and unread_reminder_email_attempts < 3;

commit;
