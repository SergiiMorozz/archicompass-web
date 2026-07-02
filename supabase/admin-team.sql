-- Owner-managed access for ArchiCompass administrators.
-- Staff members must already have an ArchiCompass account before access is granted.

begin;

create or replace function public.admin_staff_directory()
returns table (
  user_id uuid,
  email text,
  full_name text,
  role text,
  active boolean,
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
    raise exception 'Owner access required' using errcode = '42501';
  end if;

  return query
  select
    role_record.user_id,
    user_record.email::text,
    profile_record.full_name,
    role_record.role,
    role_record.active,
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

create or replace function public.admin_set_staff_access(
  target_email text,
  target_active boolean
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
begin
  if not exists (
    select 1
    from public.admin_roles role_record
    where role_record.user_id = auth.uid()
      and role_record.role = 'owner'
      and role_record.active
  ) then
    raise exception 'Owner access required' using errcode = '42501';
  end if;

  if normalized_email = '' then
    raise exception 'Enter an account email' using errcode = '22023';
  end if;

  select user_record.id
  into target_user_id
  from auth.users user_record
  where lower(user_record.email) = normalized_email
  limit 1;

  if target_user_id is null then
    raise exception 'No ArchiCompass account exists for this email' using errcode = 'P0002';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot change your own owner access here' using errcode = '42501';
  end if;

  select role_record.role
  into target_current_role
  from public.admin_roles role_record
  where role_record.user_id = target_user_id;

  if target_current_role = 'owner' then
    raise exception 'Owner access cannot be changed here' using errcode = '42501';
  end if;

  if target_active then
    insert into public.admin_roles (user_id, role, active, created_by)
    values (target_user_id, 'admin', true, auth.uid())
    on conflict (user_id) do update
    set role = 'admin', active = true, created_by = auth.uid();
  else
    update public.admin_roles
    set active = false
    where user_id = target_user_id and role = 'admin';

    if not found then
      raise exception 'This account does not have administrator access' using errcode = 'P0002';
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
    jsonb_build_object('email', normalized_email, 'role', 'admin')
  );
end;
$$;

revoke all on function public.admin_staff_directory() from public;
revoke all on function public.admin_set_staff_access(text, boolean) from public;
grant execute on function public.admin_staff_directory() to authenticated;
grant execute on function public.admin_set_staff_access(text, boolean) to authenticated;

commit;
