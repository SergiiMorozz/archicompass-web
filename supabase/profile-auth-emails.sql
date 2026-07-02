-- Ensure message notifications have a verified destination for existing accounts.
begin;

insert into public.profiles (id, email, user_type)
select
  user_record.id,
  user_record.email,
  case when role_record.role = 'designer' then 'professional' else 'client' end
from auth.users user_record
join public.account_roles role_record on role_record.user_id = user_record.id
where user_record.email is not null
on conflict (id) do update
set
  email = coalesce(nullif(trim(public.profiles.email), ''), excluded.email),
  user_type = excluded.user_type;

commit;
