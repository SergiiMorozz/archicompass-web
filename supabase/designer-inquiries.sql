-- Saved brief inquiries sent from clients to designers.
-- Run after `supabase/project-briefs.sql`.

begin;

create table if not exists public.designer_inquiries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  designer_id uuid not null references public.profiles(id) on delete cascade,
  brief_id uuid references public.project_briefs(id) on delete set null,
  subject text not null,
  message text,
  status text not null default 'sent'
    check (status in ('sent', 'reviewing', 'accepted', 'declined', 'archived')),
  brief_snapshot jsonb not null default '{}'::jsonb,
  brief_text text not null,
  notification_email_status text not null default 'not_configured'
    check (notification_email_status in ('not_configured', 'sent', 'failed', 'skipped')),
  notification_email_sent_at timestamptz,
  notification_email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.designer_inquiries
add column if not exists notification_email_status text not null default 'not_configured';

alter table public.designer_inquiries
add column if not exists notification_email_sent_at timestamptz;

alter table public.designer_inquiries
add column if not exists notification_email_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'designer_inquiries_notification_email_status_check'
  ) then
    alter table public.designer_inquiries
    add constraint designer_inquiries_notification_email_status_check
    check (notification_email_status in ('not_configured', 'sent', 'failed', 'skipped'));
  end if;
end $$;

create index if not exists designer_inquiries_client_idx
on public.designer_inquiries (client_id, created_at desc);

create index if not exists designer_inquiries_designer_idx
on public.designer_inquiries (designer_id, created_at desc);

create index if not exists designer_inquiries_brief_idx
on public.designer_inquiries (brief_id);

alter table public.designer_inquiries enable row level security;

drop policy if exists "designer_inquiries_select_participants" on public.designer_inquiries;
create policy "designer_inquiries_select_participants"
on public.designer_inquiries
for select
to authenticated
using (
  client_id = auth.uid()
  or designer_id = auth.uid()
);

drop policy if exists "designer_inquiries_insert_client" on public.designer_inquiries;
create policy "designer_inquiries_insert_client"
on public.designer_inquiries
for insert
to authenticated
with check (
  client_id = auth.uid()
  and designer_id <> auth.uid()
  and (
    brief_id is null
    or exists (
      select 1
      from public.project_briefs
      where project_briefs.id = brief_id
        and project_briefs.user_id = auth.uid()
    )
  )
);

drop policy if exists "designer_inquiries_update_participants" on public.designer_inquiries;
drop policy if exists "designer_inquiries_update_designer" on public.designer_inquiries;
create policy "designer_inquiries_update_designer"
on public.designer_inquiries
for update
to authenticated
using (designer_id = auth.uid())
with check (designer_id = auth.uid());

drop policy if exists "designer_inquiries_delete_client" on public.designer_inquiries;
create policy "designer_inquiries_delete_client"
on public.designer_inquiries
for delete
to authenticated
using (client_id = auth.uid());

commit;
