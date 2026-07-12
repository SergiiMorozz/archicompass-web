-- Owner-managed access for ArchiCompass administrators.
-- Staff members must already have an ArchiCompass account before access is granted.

begin;

alter table public.admin_roles
add column if not exists permissions text[] not null default array[
  'users',
  'moderation',
  'content',
  'analytics',
  'team',
  'finance'
]::text[];

drop function if exists public.admin_staff_directory();

create or replace function public.admin_staff_directory()
returns table (
  user_id uuid,
  email text,
  full_name text,
  role text,
  active boolean,
  permissions text[],
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1
    from public.admin_roles role_record
    where role_record.user_id = auth.uid()
      and role_record.role = 'owner'
      and role_record.active
  ) then
    raise exception 'Wymagany dostęp właściciela' using errcode = '42501';
  end if;

  return query
  select
    role_record.user_id,
    user_record.email::text,
    profile_record.full_name,
    role_record.role,
    role_record.active,
    role_record.permissions,
    role_record.created_at
  from public.admin_roles role_record
  join auth.users user_record on user_record.id = role_record.user_id
  left join public.profiles profile_record on profile_record.id = role_record.user_id
  where role_record.role in ('owner', 'admin')
  order by
    case when role_record.role = 'owner' then 0 else 1 end,
    role_record.active desc,
    role_record.created_at;
end;
$$;

drop function if exists public.admin_set_staff_access(text, boolean);

create or replace function public.admin_set_staff_access(
  target_email text,
  target_active boolean,
  target_permissions text[] default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_user_id uuid;
  target_current_role text;
  normalized_email text := lower(trim(coalesce(target_email, '')));
  normalized_permissions text[];
begin
  if not exists (
    select 1
    from public.admin_roles role_record
    where role_record.user_id = auth.uid()
      and role_record.role = 'owner'
      and role_record.active
  ) then
    raise exception 'Wymagany dostęp właściciela' using errcode = '42501';
  end if;

  if normalized_email = '' then
    raise exception 'Podaj adres e-mail konta' using errcode = '22023';
  end if;

  select user_record.id
  into target_user_id
  from auth.users user_record
  where lower(user_record.email) = normalized_email
  limit 1;

  if target_user_id is null then
    raise exception 'Nie znaleziono konta ArchiCompass dla tego adresu e-mail' using errcode = 'P0002';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Nie możesz tutaj zmienić własnego dostępu właściciela' using errcode = '42501';
  end if;

  select role_record.role
  into target_current_role
  from public.admin_roles role_record
  where role_record.user_id = target_user_id;

  if target_current_role = 'owner' then
    raise exception 'Dostępu właściciela nie można zmienić w tym miejscu' using errcode = '42501';
  end if;

  select coalesce(
    array_agg(permission order by permission),
    array['users', 'moderation', 'content', 'analytics']::text[]
  )
  into normalized_permissions
  from unnest(coalesce(target_permissions, array['users', 'moderation', 'content', 'analytics']::text[])) as permission
  where permission in ('users', 'moderation', 'content', 'analytics', 'team', 'finance');

  if target_active then
    insert into public.admin_roles (user_id, role, active, permissions, created_by)
    values (target_user_id, 'admin', true, normalized_permissions, auth.uid())
    on conflict (user_id) do update
    set role = 'admin',
        active = true,
        permissions = excluded.permissions,
        created_by = auth.uid();
  else
    update public.admin_roles
    set active = false
    where user_id = target_user_id and role = 'admin';

    if not found then
      raise exception 'To konto nie ma dostępu administratora' using errcode = 'P0002';
    end if;
  end if;

  insert into public.admin_audit_log (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    case when target_active then 'admin_access_granted' else 'admin_access_revoked' end,
    'user',
    target_user_id::text,
    jsonb_build_object('email', normalized_email, 'role', 'admin', 'permissions', normalized_permissions)
  );
end;
$$;

revoke all on function public.admin_staff_directory() from public;
revoke all on function public.admin_set_staff_access(text, boolean, text[]) from public;
grant execute on function public.admin_staff_directory() to authenticated;
grant execute on function public.admin_set_staff_access(text, boolean, text[]) to authenticated;

commit;
