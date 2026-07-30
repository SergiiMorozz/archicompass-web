begin;

-- A paid studio plan covers every active member's personal profile.
create or replace function public.is_designer_covered_by_active_studio(target_designer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.studio_members member_record
    join public.billing_accounts studio_billing
      on studio_billing.subject_type = 'studio'
      and studio_billing.subject_id = member_record.studio_id
    where member_record.user_id = target_designer_id
      and member_record.status = 'active'
      and studio_billing.status = 'active'
      and public.billing_access_active(
        studio_billing.status,
        studio_billing.trial_ends_at,
        studio_billing.current_period_end,
        studio_billing.manual_access_until
      )
  );
$$;

revoke all on function public.is_designer_covered_by_active_studio(uuid) from public;

create or replace function public.is_billing_subject_accessible(
  requested_subject_type text,
  requested_subject_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when requested_subject_type = 'designer' then
      not exists (
        select 1
        from public.billing_accounts account_record
        where account_record.subject_type = 'designer'
          and account_record.subject_id = requested_subject_id
          and account_record.status = 'suspended'
      )
      and (
        public.is_designer_covered_by_active_studio(requested_subject_id)
        or not exists (
          select 1
          from public.billing_accounts account_record
          where account_record.subject_type = 'designer'
            and account_record.subject_id = requested_subject_id
            and not public.billing_access_active(
              account_record.status,
              account_record.trial_ends_at,
              account_record.current_period_end,
              account_record.manual_access_until
            )
        )
      )
    else not exists (
      select 1
      from public.billing_accounts account_record
      where account_record.subject_type = requested_subject_type
        and account_record.subject_id = requested_subject_id
        and not public.billing_access_active(
          account_record.status,
          account_record.trial_ends_at,
          account_record.current_period_end,
          account_record.manual_access_until
        )
    )
  end;
$$;

create or replace function public.current_user_studio_billing_coverage()
returns table (
  studio_id uuid,
  studio_name text,
  plan_code text,
  current_period_end timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    studio_record.id,
    studio_record.name,
    studio_billing.plan_code,
    studio_billing.current_period_end
  from public.studio_members member_record
  join public.studios studio_record on studio_record.id = member_record.studio_id
  join public.billing_accounts studio_billing
    on studio_billing.subject_type = 'studio'
    and studio_billing.subject_id = studio_record.id
  where member_record.user_id = auth.uid()
    and member_record.status = 'active'
    and studio_billing.status = 'active'
    and public.billing_access_active(
      studio_billing.status,
      studio_billing.trial_ends_at,
      studio_billing.current_period_end,
      studio_billing.manual_access_until
    )
  order by studio_billing.current_period_end desc nulls last, studio_billing.created_at asc
  limit 1;
$$;

revoke all on function public.current_user_studio_billing_coverage() from public;
grant execute on function public.current_user_studio_billing_coverage() to authenticated;

create or replace function public.admin_billing_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_admin_permission('finance') then
    raise exception 'Wymagany dostęp do finansów' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'trialing', (select count(*) from public.billing_accounts where status = 'trialing' and trial_ends_at > now()),
    'active', (select count(*) from public.billing_accounts where status = 'active' and public.billing_access_active(status, trial_ends_at, current_period_end, manual_access_until)),
    'payment_issue', (select count(*) from public.billing_accounts where status in ('past_due', 'trial_expired', 'cancelled') and not public.is_billing_subject_accessible(subject_type, subject_id)),
    'restricted', (select count(*) from public.billing_accounts where not public.is_billing_subject_accessible(subject_type, subject_id))
  );
end;
$$;

create or replace function public.admin_billing_directory(
  search_text text default null,
  status_filter text default 'all',
  page_limit integer default 100
)
returns table (
  billing_account_id uuid,
  owner_user_id uuid,
  email text,
  account_name text,
  subject_type text,
  subject_name text,
  effective_status text,
  has_access boolean,
  plan_code text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  manual_access_until timestamptz,
  tax_id text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_admin_permission('finance') then
    raise exception 'Wymagany dostęp do finansów' using errcode = '42501';
  end if;

  return query
  with records as (
    select
      billing_record.*,
      user_record.email::text as user_email,
      coalesce(nullif(trim(profile_record.full_name), ''), user_record.email::text) as owner_name,
      case
        when billing_record.subject_type = 'studio' then coalesce(studio_record.name, 'Pracownia')
        else coalesce(nullif(trim(profile_record.full_name), ''), user_record.email::text)
      end as display_subject,
      case
        when billing_record.status = 'trialing' and billing_record.trial_ends_at <= now() then 'trial_expired'
        else billing_record.status
      end as resolved_status,
      public.is_billing_subject_accessible(
        billing_record.subject_type,
        billing_record.subject_id
      ) as access_active
    from public.billing_accounts billing_record
    join auth.users user_record on user_record.id = billing_record.owner_user_id
    left join public.profiles profile_record on profile_record.id = billing_record.owner_user_id
    left join public.studios studio_record
      on billing_record.subject_type = 'studio'
      and studio_record.id = billing_record.subject_id
  )
  select
    records.id,
    records.owner_user_id,
    records.user_email,
    records.owner_name,
    records.subject_type,
    records.display_subject,
    records.resolved_status,
    records.access_active,
    records.plan_code,
    records.trial_ends_at,
    records.current_period_end,
    records.manual_access_until,
    records.tax_id,
    count(*) over()
  from records
  where (
    nullif(trim(coalesce(search_text, '')), '') is null
    or records.user_email ilike '%' || trim(search_text) || '%'
    or records.owner_name ilike '%' || trim(search_text) || '%'
    or records.display_subject ilike '%' || trim(search_text) || '%'
    or coalesce(records.tax_id, '') ilike '%' || trim(search_text) || '%'
  )
  and (status_filter = 'all' or records.resolved_status = status_filter)
  order by
    case when records.access_active then 1 else 0 end,
    records.trial_ends_at asc nulls last,
    records.created_at desc
  limit greatest(1, least(coalesce(page_limit, 100), 200));
end;
$$;

revoke all on function public.admin_billing_summary() from public;
revoke all on function public.admin_billing_directory(text, text, integer) from public;
grant execute on function public.admin_billing_summary() to authenticated;
grant execute on function public.admin_billing_directory(text, text, integer) to authenticated;

commit;
