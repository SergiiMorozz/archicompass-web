-- Launch security and operational metrics hardening for ArchiCompass.
-- Applied to production on 2026-07-20.

begin;

-- Legacy tables remain locked until they are deliberately reintroduced.
revoke all on table public.companies, public.reviews, public.saved_designers, public.saved_projects from anon, authenticated;

-- Mutating helpers require a signed-in account. The server-only quota helper is
-- intentionally not callable from browser clients.
revoke all on function public.consume_style_analysis_quota(text, integer) from public, anon, authenticated;
revoke all on function public.can_access_inquiry(uuid) from public, anon;
grant execute on function public.can_access_inquiry(uuid) to authenticated;
revoke all on function public.can_manage_inquiry(uuid) from public, anon;
grant execute on function public.can_manage_inquiry(uuid) to authenticated;
revoke all on function public.current_account_role() from public, anon;
grant execute on function public.current_account_role() to authenticated;
revoke all on function public.delete_my_professional_profile() from public, anon;
grant execute on function public.delete_my_professional_profile() to authenticated;
revoke all on function public.invite_studio_member(uuid, text, text) from public, anon;
grant execute on function public.invite_studio_member(uuid, text, text) to authenticated;
revoke all on function public.record_my_inquiry_email_delivery(uuid, text, timestamptz, text) from public, anon;
grant execute on function public.record_my_inquiry_email_delivery(uuid, text, timestamptz, text) to authenticated;
revoke all on function public.remove_studio_member(uuid, uuid) from public, anon;
grant execute on function public.remove_studio_member(uuid, uuid) to authenticated;
revoke all on function public.respond_studio_invitation(uuid, boolean) from public, anon;
grant execute on function public.respond_studio_invitation(uuid, boolean) to authenticated;
revoke all on function public.set_my_account_role(text) from public, anon;
grant execute on function public.set_my_account_role(text) to authenticated;
revoke all on function public.update_inquiry_status_with_message(uuid, text) from public, anon;
grant execute on function public.update_inquiry_status_with_message(uuid, text) to authenticated;

-- Public Storage buckets serve known direct image URLs without API listing.
drop policy if exists "project_images_select_public" on storage.objects;
drop policy if exists "Public profile media is readable" on storage.objects;

-- Public profile-view writes go through the server endpoint, rather than direct REST.
drop policy if exists "profile_views_insert_public" on public.profile_views;
revoke insert on table public.profile_views from anon, authenticated;
revoke usage, select on sequence public.profile_views_id_seq from anon;

create table if not exists public.product_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in (
    'account_registered',
    'ai_analysis_completed',
    'brief_saved',
    'inquiry_sent',
    'message_sent',
    'portfolio_project_added'
  )),
  actor_id uuid references auth.users(id) on delete set null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_events_type_created_idx
  on public.product_events (event_type, created_at desc);
create index if not exists product_events_actor_created_idx
  on public.product_events (actor_id, created_at desc);

alter table public.product_events enable row level security;
revoke all on table public.product_events from anon, authenticated;
grant select, insert on table public.product_events to service_role;
grant usage, select on sequence public.product_events_id_seq to service_role;

create or replace function public.track_product_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  tracked_event text;
  tracked_actor uuid;
  tracked_entity uuid;
  tracked_metadata jsonb := '{}'::jsonb;
begin
  case tg_table_name
    when 'account_roles' then
      tracked_event := 'account_registered';
      tracked_actor := new.user_id;
      tracked_entity := new.user_id;
      tracked_metadata := jsonb_build_object('role', new.role);
    when 'project_briefs' then
      tracked_event := 'brief_saved';
      tracked_actor := new.user_id;
      tracked_entity := new.id;
    when 'designer_inquiries' then
      tracked_event := 'inquiry_sent';
      tracked_actor := new.client_id;
      tracked_entity := new.id;
    when 'inquiry_messages' then
      tracked_event := 'message_sent';
      tracked_actor := new.sender_id;
      tracked_entity := new.id;
    when 'projects' then
      tracked_event := 'portfolio_project_added';
      tracked_actor := new.profile_id;
      tracked_entity := new.id;
    else
      return new;
  end case;

  insert into public.product_events (event_type, actor_id, entity_id, metadata)
  values (tracked_event, tracked_actor, tracked_entity, tracked_metadata);
  return new;
exception
  when others then
    raise warning 'Product event tracking failed for %: %', tg_table_name, sqlerrm;
    return new;
end;
$$;

revoke all on function public.track_product_event() from public, anon, authenticated;

drop trigger if exists account_roles_track_product_event on public.account_roles;
create trigger account_roles_track_product_event
after insert on public.account_roles
for each row execute function public.track_product_event();
drop trigger if exists project_briefs_track_product_event on public.project_briefs;
create trigger project_briefs_track_product_event
after insert on public.project_briefs
for each row execute function public.track_product_event();
drop trigger if exists designer_inquiries_track_product_event on public.designer_inquiries;
create trigger designer_inquiries_track_product_event
after insert on public.designer_inquiries
for each row execute function public.track_product_event();
drop trigger if exists inquiry_messages_track_product_event on public.inquiry_messages;
create trigger inquiry_messages_track_product_event
after insert on public.inquiry_messages
for each row execute function public.track_product_event();
drop trigger if exists projects_track_product_event on public.projects;
create trigger projects_track_product_event
after insert on public.projects
for each row execute function public.track_product_event();

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'profiles', (select count(*) from public.profiles),
    'professionals', (
      select count(*) from public.profiles profile_record
      where profile_record.user_type = 'professional'
        or nullif(trim(profile_record.profession_type), '') is not null
    ),
    'clients', (
      select count(*) from auth.users user_record
      left join public.profiles profile_record on profile_record.id = user_record.id
      where coalesce(profile_record.user_type, 'client') <> 'professional'
        and nullif(trim(profile_record.profession_type), '') is null
    ),
    'projects', (select count(*) from public.projects),
    'briefs', (select count(*) from public.project_briefs),
    'inquiries', (select count(*) from public.designer_inquiries),
    'favorites', (select count(*) from public.favorites),
    'signups_30', (select count(*) from auth.users where created_at >= now() - interval '30 days'),
    'active_30', (select count(*) from auth.users where last_sign_in_at >= now() - interval '30 days'),
    'profile_views_30', (select count(*) from public.profile_views where created_at >= now() - interval '30 days'),
    'registrations_30', (select count(*) from public.product_events where event_type = 'account_registered' and created_at >= now() - interval '30 days'),
    'ai_analyses_30', (select count(*) from public.product_events where event_type = 'ai_analysis_completed' and created_at >= now() - interval '30 days'),
    'briefs_saved_30', (select count(*) from public.product_events where event_type = 'brief_saved' and created_at >= now() - interval '30 days'),
    'inquiries_sent_30', (select count(*) from public.product_events where event_type = 'inquiry_sent' and created_at >= now() - interval '30 days'),
    'messages_sent_30', (select count(*) from public.product_events where event_type = 'message_sent' and created_at >= now() - interval '30 days'),
    'hidden_profiles', (select count(*) from public.content_moderation where entity_type = 'profile' and visibility = 'hidden'),
    'hidden_projects', (select count(*) from public.content_moderation where entity_type = 'project' and visibility = 'hidden')
  );
end;
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to authenticated;

commit;
