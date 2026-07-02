-- Keep client and designer identities separate after onboarding.
begin;

create or replace function public.set_my_account_role(new_role text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if new_role not in ('client', 'designer') then
    raise exception 'Choose client or designer' using errcode = '22023';
  end if;

  select role
  into existing_role
  from public.account_roles
  where user_id = auth.uid();

  if existing_role is not null and existing_role <> new_role then
    raise exception 'Account role cannot be changed after setup. Contact support if you need a different account type.'
      using errcode = '22023';
  end if;

  insert into public.account_roles (user_id, role, created_at, updated_at)
  values (auth.uid(), new_role, now(), now())
  on conflict (user_id) do update
  set updated_at = now();

  update public.profiles
  set user_type = case when new_role = 'designer' then 'professional' else 'client' end
  where id = auth.uid();
end;
$$;

revoke all on function public.set_my_account_role(text) from public;
grant execute on function public.set_my_account_role(text) to authenticated;

commit;
