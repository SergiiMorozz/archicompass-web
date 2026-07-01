-- ArchiCompass account roles, collaborative studio profiles, and team inboxes.
-- Run after `supabase/admin-workspace.sql` and `supabase/designer-studio.sql`.

begin;

-- One account has one operating role. Existing professional profiles are
-- migrated to designer accounts; every other existing account starts as a client.
create table if not exists public.account_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client', 'designer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.account_roles (user_id, role)
select
  user_record.id,
  case
    when profile_record.user_type = 'professional'
      or nullif(trim(profile_record.profession_type), '') is not null
      then 'designer'
    else 'client'
  end
from auth.users user_record
left join public.profiles profile_record on profile_record.id = user_record.id
on conflict (user_id) do nothing;

alter table public.account_roles enable row level security;
revoke all on public.account_roles from anon, authenticated;
grant select on public.account_roles to authenticated;

drop policy if exists "account_roles_select_own_or_admin" on public.account_roles;
create policy "account_roles_select_own_or_admin"
on public.account_roles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create or replace function public.current_account_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select role_record.role from public.account_roles role_record where role_record.user_id = auth.uid()),
    'client'
  );
$$;

revoke all on function public.current_account_role() from public;
grant execute on function public.current_account_role() to authenticated;

drop policy if exists "project_briefs_insert_owner" on public.project_briefs;
create policy "project_briefs_insert_owner"
on public.project_briefs
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.current_account_role() = 'client'
);

drop policy if exists "project_briefs_update_owner" on public.project_briefs;
create policy "project_briefs_update_owner"
on public.project_briefs
for update
to authenticated
using (user_id = auth.uid() and public.current_account_role() = 'client')
with check (user_id = auth.uid() and public.current_account_role() = 'client');

create or replace function public.is_designer_account(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select role_record.role = 'designer' from public.account_roles role_record where role_record.user_id = target_user_id),
    false
  );
$$;

revoke all on function public.is_designer_account(uuid) from public;
grant execute on function public.is_designer_account(uuid) to anon, authenticated;

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 160),
  bio text check (bio is null or char_length(bio) <= 5000),
  location text check (location is null or char_length(location) <= 200),
  specialties text[] not null default '{}',
  service_capabilities text[] not null default '{}',
  pricing_model text,
  price_from numeric check (price_from is null or price_from >= 0),
  price_to numeric check (price_to is null or price_to >= 0),
  minimum_project_budget numeric check (minimum_project_budget is null or minimum_project_budget >= 0),
  work_modes text[] not null default '{}',
  availability_status text,
  cooperation_terms text,
  website text check (website is null or char_length(website) <= 500),
  phone text check (phone is null or char_length(phone) <= 100),
  email text check (email is null or char_length(email) <= 320),
  hourly_rate numeric check (hourly_rate is null or hourly_rate >= 0),
  years_experience integer check (years_experience is null or years_experience >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists service_capabilities text[] not null default '{}';

alter table public.profiles
  add column if not exists pricing_model text,
  add column if not exists price_from numeric,
  add column if not exists price_to numeric,
  add column if not exists minimum_project_budget numeric,
  add column if not exists work_modes text[] not null default '{}',
  add column if not exists availability_status text,
  add column if not exists cooperation_terms text;

alter table public.studios
add column if not exists service_capabilities text[] not null default '{}';

alter table public.studios
  add column if not exists pricing_model text,
  add column if not exists price_from numeric,
  add column if not exists price_to numeric,
  add column if not exists minimum_project_budget numeric,
  add column if not exists work_modes text[] not null default '{}',
  add column if not exists availability_status text,
  add column if not exists cooperation_terms text;

create table if not exists public.studio_members (
  studio_id uuid not null references public.studios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'designer')),
  status text not null default 'pending' check (status in ('pending', 'active')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (studio_id, user_id)
);

create index if not exists studio_members_user_idx
on public.studio_members (user_id, status, created_at desc);

create index if not exists studios_owner_idx
on public.studios (owner_id, created_at desc);

alter table public.designer_inquiries
add column if not exists studio_id uuid references public.studios(id) on delete set null;

create index if not exists designer_inquiries_studio_idx
on public.designer_inquiries (studio_id, created_at desc);

alter table public.studios enable row level security;
alter table public.studio_members enable row level security;

create or replace function public.is_active_studio_member(target_studio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.studio_members member_record
    where member_record.studio_id = target_studio_id
      and member_record.user_id = auth.uid()
      and member_record.status = 'active'
  );
$$;

create or replace function public.can_manage_studio(target_studio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.is_admin() or exists (
    select 1
    from public.studio_members member_record
    where member_record.studio_id = target_studio_id
      and member_record.user_id = auth.uid()
      and member_record.status = 'active'
      and member_record.role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_active_studio_member(uuid) from public;
revoke all on function public.can_manage_studio(uuid) from public;
grant execute on function public.is_active_studio_member(uuid) to anon, authenticated;
grant execute on function public.can_manage_studio(uuid) to anon, authenticated;

-- Client profile rows remain private account data except when an existing
-- conversation needs the client's name. Only designer accounts are public.
drop policy if exists "profiles_select_visible_or_authorized" on public.profiles;
create policy "profiles_select_visible_or_authorized"
on public.profiles
for select
to public
using (
  id = auth.uid()
  or public.is_admin()
  or (
    public.is_designer_account(id)
    and public.is_content_visible('profile', id)
  )
  or exists (
    select 1
    from public.designer_inquiries inquiry_record
    where (
      inquiry_record.client_id = auth.uid()
      and inquiry_record.designer_id = profiles.id
    ) or (
      inquiry_record.designer_id = auth.uid()
      and inquiry_record.client_id = profiles.id
    ) or (
      inquiry_record.studio_id is not null
      and inquiry_record.client_id = profiles.id
      and public.is_active_studio_member(inquiry_record.studio_id)
    )
  )
);

drop policy if exists "projects_select_visible_or_authorized" on public.projects;
create policy "projects_select_visible_or_authorized"
on public.projects
for select
to public
using (
  profile_id = auth.uid()
  or public.is_admin()
  or (
    public.is_designer_account(profile_id)
    and public.is_content_visible('profile', profile_id)
    and public.is_content_visible('project', id)
  )
);

drop policy if exists "projects_insert_owner" on public.projects;
create policy "projects_insert_owner"
on public.projects
for insert
to authenticated
with check (
  profile_id = auth.uid()
  and public.current_account_role() = 'designer'
);

drop policy if exists "projects_update_owner" on public.projects;
create policy "projects_update_owner"
on public.projects
for update
to authenticated
using (profile_id = auth.uid() and public.current_account_role() = 'designer')
with check (profile_id = auth.uid() and public.current_account_role() = 'designer');

drop policy if exists "projects_delete_owner" on public.projects;
create policy "projects_delete_owner"
on public.projects
for delete
to authenticated
using (profile_id = auth.uid() and public.current_account_role() = 'designer');

revoke all on public.studios from anon, authenticated;
grant select on public.studios to anon, authenticated;
grant insert, update on public.studios to authenticated;

revoke all on public.studio_members from anon, authenticated;
grant select on public.studio_members to anon, authenticated;

drop policy if exists "studios_select_public_or_team" on public.studios;
create policy "studios_select_public_or_team"
on public.studios
for select
to public
using (
  (published and public.is_content_visible('studio', id))
  or owner_id = auth.uid()
  or public.is_active_studio_member(id)
  or public.is_admin()
);

drop policy if exists "studios_insert_designer" on public.studios;
create policy "studios_insert_designer"
on public.studios
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and public.current_account_role() = 'designer'
);

drop policy if exists "studios_update_manager" on public.studios;
create policy "studios_update_manager"
on public.studios
for update
to authenticated
using (public.can_manage_studio(id))
with check (public.can_manage_studio(id));

drop policy if exists "studio_members_select_public_or_team" on public.studio_members;
create policy "studio_members_select_public_or_team"
on public.studio_members
for select
to public
using (
  status = 'active'
  or user_id = auth.uid()
  or public.can_manage_studio(studio_id)
);

create or replace function public.add_studio_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.studio_members (
    studio_id,
    user_id,
    role,
    status,
    invited_by,
    accepted_at
  ) values (
    new.id,
    new.owner_id,
    'owner',
    'active',
    new.owner_id,
    now()
  )
  on conflict (studio_id, user_id) do update
  set role = 'owner', status = 'active', accepted_at = coalesce(studio_members.accepted_at, now());
  return new;
end;
$$;

drop trigger if exists studios_add_owner_membership on public.studios;
create trigger studios_add_owner_membership
after insert on public.studios
for each row execute function public.add_studio_owner_membership();

create or replace function public.invite_studio_member(
  target_studio_id uuid,
  member_email text,
  member_role text default 'designer'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  target_user_id uuid;
begin
  if not public.can_manage_studio(target_studio_id) then
    raise exception 'Studio manager access required' using errcode = '42501';
  end if;

  if member_role not in ('admin', 'designer') then
    raise exception 'Choose admin or designer as the team role' using errcode = '22023';
  end if;

  select user_record.id into target_user_id
  from auth.users user_record
  where lower(user_record.email) = lower(trim(member_email))
  limit 1;

  if target_user_id is null then
    raise exception 'This email needs an ArchiCompass account before it can join a studio'
      using errcode = 'P0002';
  end if;

  if not public.is_designer_account(target_user_id) then
    raise exception 'Only a designer account can join a studio' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.studios studio_record
    where studio_record.id = target_studio_id and studio_record.owner_id = target_user_id
  ) then
    raise exception 'The studio owner is already on the team' using errcode = '23505';
  end if;

  insert into public.studio_members (
    studio_id,
    user_id,
    role,
    status,
    invited_by,
    accepted_at
  ) values (
    target_studio_id,
    target_user_id,
    member_role,
    'pending',
    auth.uid(),
    null
  )
  on conflict (studio_id, user_id) do update
  set
    role = case when studio_members.status = 'active' then studio_members.role else excluded.role end,
    invited_by = excluded.invited_by,
    status = studio_members.status;

  return target_user_id;
end;
$$;

create or replace function public.respond_studio_invitation(
  target_studio_id uuid,
  accept_invitation boolean
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.current_account_role() <> 'designer' then
    raise exception 'Only a designer account can join a studio' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.studio_members member_record
    where member_record.studio_id = target_studio_id
      and member_record.user_id = auth.uid()
      and member_record.status = 'pending'
  ) then
    raise exception 'Studio invitation not found' using errcode = 'P0002';
  end if;

  if accept_invitation then
    update public.studio_members
    set status = 'active', accepted_at = now()
    where studio_id = target_studio_id and user_id = auth.uid();
  else
    delete from public.studio_members
    where studio_id = target_studio_id and user_id = auth.uid();
  end if;
end;
$$;

create or replace function public.remove_studio_member(
  target_studio_id uuid,
  target_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.can_manage_studio(target_studio_id) then
    raise exception 'Studio manager access required' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.studio_members member_record
    where member_record.studio_id = target_studio_id
      and member_record.user_id = target_user_id
      and member_record.role = 'owner'
  ) then
    raise exception 'The studio owner cannot be removed' using errcode = '22023';
  end if;

  delete from public.studio_members
  where studio_id = target_studio_id and user_id = target_user_id;
end;
$$;

revoke all on function public.invite_studio_member(uuid, text, text) from public;
revoke all on function public.respond_studio_invitation(uuid, boolean) from public;
revoke all on function public.remove_studio_member(uuid, uuid) from public;
grant execute on function public.invite_studio_member(uuid, text, text) to authenticated;
grant execute on function public.respond_studio_invitation(uuid, boolean) to authenticated;
grant execute on function public.remove_studio_member(uuid, uuid) to authenticated;

-- Studio inquiries keep a responsible account for compatibility while also
-- naming the studio. Every active studio member can access the conversation.

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select constraint_name
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'designer_inquiries'
      and constraint_type = 'FOREIGN KEY'
      and constraint_name in (
        select constraint_name
        from information_schema.constraint_column_usage
        where table_schema = 'public'
          and table_name = 'profiles'
          and column_name = 'id'
      )
  loop
    execute format(
      'alter table public.designer_inquiries drop constraint %I',
      constraint_record.constraint_name
    );
  end loop;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.designer_inquiries'::regclass
      and conname = 'designer_inquiries_designer_account_fkey'
  ) then
    alter table public.designer_inquiries
    add constraint designer_inquiries_designer_account_fkey
    foreign key (designer_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create or replace function public.can_access_inquiry(target_inquiry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.designer_inquiries inquiry_record
    where inquiry_record.id = target_inquiry_id
      and (
        inquiry_record.client_id = auth.uid()
        or inquiry_record.designer_id = auth.uid()
        or (
          inquiry_record.studio_id is not null
          and public.is_active_studio_member(inquiry_record.studio_id)
        )
      )
  );
$$;

create or replace function public.can_manage_inquiry(target_inquiry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.designer_inquiries inquiry_record
    where inquiry_record.id = target_inquiry_id
      and (
        inquiry_record.designer_id = auth.uid()
        or (
          inquiry_record.studio_id is not null
          and public.is_active_studio_member(inquiry_record.studio_id)
        )
      )
  );
$$;

revoke all on function public.can_access_inquiry(uuid) from public;
revoke all on function public.can_manage_inquiry(uuid) from public;
grant execute on function public.can_access_inquiry(uuid) to authenticated;
grant execute on function public.can_manage_inquiry(uuid) to authenticated;

drop policy if exists "designer_inquiries_select_participants" on public.designer_inquiries;
create policy "designer_inquiries_select_participants"
on public.designer_inquiries
for select
to authenticated
using (public.can_access_inquiry(id));

drop policy if exists "designer_inquiries_insert_client" on public.designer_inquiries;
create policy "designer_inquiries_insert_client"
on public.designer_inquiries
for insert
to authenticated
with check (
  client_id = auth.uid()
  and public.current_account_role() = 'client'
  and designer_id <> auth.uid()
  and (
    brief_id is null
    or exists (
      select 1
      from public.project_briefs brief_record
      where brief_record.id = brief_id
        and brief_record.user_id = auth.uid()
    )
  )
  and (
    (
      studio_id is null
      and public.is_designer_account(designer_id)
    )
    or exists (
      select 1
      from public.studios studio_record
      where studio_record.id = studio_id
        and studio_record.owner_id = designer_id
        and studio_record.published
        and public.is_content_visible('studio', studio_record.id)
    )
  )
);

drop policy if exists "designer_inquiries_update_designer" on public.designer_inquiries;
create policy "designer_inquiries_update_designer"
on public.designer_inquiries
for update
to authenticated
using (public.can_manage_inquiry(id))
with check (public.can_manage_inquiry(id));

drop policy if exists "inquiry_messages_select_participants" on public.inquiry_messages;
create policy "inquiry_messages_select_participants"
on public.inquiry_messages
for select
to authenticated
using (public.can_access_inquiry(inquiry_id));

drop policy if exists "inquiry_messages_insert_participants" on public.inquiry_messages;
create policy "inquiry_messages_insert_participants"
on public.inquiry_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.can_access_inquiry(inquiry_id)
);

drop policy if exists "inquiry_messages_mark_received_read" on public.inquiry_messages;
create policy "inquiry_messages_mark_received_read"
on public.inquiry_messages
for update
to authenticated
using (
  sender_id <> auth.uid()
  and public.can_access_inquiry(inquiry_id)
)
with check (
  sender_id <> auth.uid()
  and public.can_access_inquiry(inquiry_id)
);

drop policy if exists "brief_reference_photos_select_inquiry_participants" on storage.objects;
create policy "brief_reference_photos_select_inquiry_participants"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'brief-reference-photos'
  and exists (
    select 1
    from public.designer_inquiries inquiry_record
    where public.can_access_inquiry(inquiry_record.id)
      and storage.objects.name = any(inquiry_record.reference_photo_paths)
  )
);

-- Studios are first-class favorites beside designers and projects.
alter table public.favorites
drop constraint if exists favorites_entity_type_check;

alter table public.favorites
add constraint favorites_entity_type_check
check (entity_type in ('designer', 'studio', 'project', 'article', 'inspiration'));

create or replace function public.set_my_account_role(new_role text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if new_role not in ('client', 'designer') then
    raise exception 'Choose client or designer' using errcode = '22023';
  end if;

  if new_role = 'client' then
    if exists (select 1 from public.projects where profile_id = auth.uid()) then
      raise exception 'Delete your portfolio projects before switching to a client account'
        using errcode = '22023';
    end if;
    if exists (
      select 1 from public.studio_members
      where user_id = auth.uid() and status = 'active'
    ) then
      raise exception 'Leave or transfer your studio memberships before switching to a client account'
        using errcode = '22023';
    end if;
    if exists (
      select 1 from public.designer_inquiries
      where designer_id = auth.uid() or studio_id in (
        select studio_id from public.studio_members where user_id = auth.uid()
      )
    ) then
      raise exception 'Designer request history must remain assigned to a designer account'
        using errcode = '22023';
    end if;
  end if;

  insert into public.account_roles (user_id, role, created_at, updated_at)
  values (auth.uid(), new_role, now(), now())
  on conflict (user_id) do update
  set role = excluded.role, updated_at = now();

  update public.profiles
  set
    user_type = case when new_role = 'designer' then 'professional' else 'client' end,
    profession_type = case when new_role = 'designer' then profession_type else null end,
    specialties = case when new_role = 'designer' then specialties else '{}'::text[] end,
    service_capabilities = case when new_role = 'designer' then service_capabilities else '{}'::text[] end,
    hourly_rate = case when new_role = 'designer' then hourly_rate else null end,
    pricing_model = case when new_role = 'designer' then pricing_model else null end,
    price_from = case when new_role = 'designer' then price_from else null end,
    price_to = case when new_role = 'designer' then price_to else null end,
    minimum_project_budget = case when new_role = 'designer' then minimum_project_budget else null end,
    work_modes = case when new_role = 'designer' then work_modes else '{}'::text[] end,
    availability_status = case when new_role = 'designer' then availability_status else null end,
    cooperation_terms = case when new_role = 'designer' then cooperation_terms else null end,
    years_experience = case when new_role = 'designer' then years_experience else null end
  where id = auth.uid();
end;
$$;

revoke all on function public.set_my_account_role(text) from public;
grant execute on function public.set_my_account_role(text) to authenticated;

create or replace function public.delete_my_professional_profile()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  project_ids text[];
begin
  if auth.uid() is null or public.current_account_role() <> 'designer' then
    raise exception 'Designer account required' using errcode = '42501';
  end if;

  select coalesce(array_agg(project_record.id::text), '{}'::text[])
  into project_ids
  from public.projects project_record
  where project_record.profile_id = auth.uid();

  delete from public.favorites favorite_record
  where (
    favorite_record.entity_type = 'designer'
    and favorite_record.entity_key = auth.uid()::text
  ) or (
    favorite_record.entity_type = 'project'
    and favorite_record.entity_key = any(project_ids)
  );

  delete from public.content_moderation moderation_record
  where (
    moderation_record.entity_type = 'profile'
    and moderation_record.entity_id = auth.uid()
  ) or (
    moderation_record.entity_type = 'project'
    and moderation_record.entity_id::text = any(project_ids)
  );

  delete from public.projects where profile_id = auth.uid();
  delete from public.profiles where id = auth.uid();

  insert into public.admin_audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  ) values (
    auth.uid(),
    'professional_profile_deleted',
    'profile',
    auth.uid()::text,
    jsonb_build_object('project_count', cardinality(project_ids))
  );
end;
$$;

revoke all on function public.delete_my_professional_profile() from public;
grant execute on function public.delete_my_professional_profile() to authenticated;

commit;
