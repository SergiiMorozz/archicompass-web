-- Keep role and visibility helpers out of PostgREST's exposed public schema.
-- RLS policies retain their function OIDs after the move and continue to work.

begin;

create schema if not exists private;
revoke all on schema private from public;

alter function public.is_admin() set schema private;
alter function public.has_admin_permission(text) set schema private;
alter function public.is_content_visible(text, uuid) set schema private;
alter function public.is_billing_subject_accessible(text, uuid) set schema private;
alter function public.is_designer_account(uuid) set schema private;
alter function public.is_active_studio_member(uuid) set schema private;
alter function public.can_manage_studio(uuid) set schema private;
alter function public.current_account_role() set schema private;

-- Recreate database functions whose bodies explicitly qualified these helpers.
-- Policies reference function OIDs, so they do not need to be recreated.
do $$
declare
  function_record record;
  definition text;
begin
  for function_record in
    select proc.oid
    from pg_proc proc
    join pg_namespace namespace_record on namespace_record.oid = proc.pronamespace
    where namespace_record.nspname in ('public', 'private')
      and (
        proc.prosrc ilike '%public.is_admin(%'
        or proc.prosrc ilike '%public.has_admin_permission(%'
        or proc.prosrc ilike '%public.is_content_visible(%'
        or proc.prosrc ilike '%public.is_billing_subject_accessible(%'
        or proc.prosrc ilike '%public.is_designer_account(%'
        or proc.prosrc ilike '%public.is_active_studio_member(%'
        or proc.prosrc ilike '%public.can_manage_studio(%'
        or proc.prosrc ilike '%public.current_account_role(%'
      )
  loop
    definition := pg_get_functiondef(function_record.oid);
    definition := replace(definition, 'public.is_admin(', 'private.is_admin(');
    definition := replace(definition, 'public.has_admin_permission(', 'private.has_admin_permission(');
    definition := replace(definition, 'public.is_content_visible(', 'private.is_content_visible(');
    definition := replace(definition, 'public.is_billing_subject_accessible(', 'private.is_billing_subject_accessible(');
    definition := replace(definition, 'public.is_designer_account(', 'private.is_designer_account(');
    definition := replace(definition, 'public.is_active_studio_member(', 'private.is_active_studio_member(');
    definition := replace(definition, 'public.can_manage_studio(', 'private.can_manage_studio(');
    definition := replace(definition, 'public.current_account_role(', 'private.current_account_role(');
    execute definition;
  end loop;
end;
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.has_admin_permission(text) from public;
revoke all on function private.is_content_visible(text, uuid) from public;
revoke all on function private.is_billing_subject_accessible(text, uuid) from public;
revoke all on function private.is_designer_account(uuid) from public;
revoke all on function private.is_active_studio_member(uuid) from public;
revoke all on function private.can_manage_studio(uuid) from public;
revoke all on function private.current_account_role() from public;

grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_admin() to anon, authenticated, service_role;
grant execute on function private.is_content_visible(text, uuid) to anon, authenticated, service_role;
grant execute on function private.is_billing_subject_accessible(text, uuid) to anon, authenticated, service_role;
grant execute on function private.is_designer_account(uuid) to anon, authenticated, service_role;
grant execute on function private.is_active_studio_member(uuid) to anon, authenticated, service_role;
grant execute on function private.can_manage_studio(uuid) to anon, authenticated, service_role;
grant execute on function private.has_admin_permission(text) to authenticated, service_role;
grant execute on function private.current_account_role() to authenticated, service_role;

-- These tables are intentionally internal-only. Explicit service-role policies
-- document that intent and eliminate the misleading "RLS enabled, no policy" state.
create policy "service_role_internal_only" on public.action_quota_daily_usage
  as permissive for all to service_role using (true) with check (true);
create policy "service_role_internal_only" on public.companies
  as permissive for all to service_role using (true) with check (true);
create policy "service_role_internal_only" on public.product_events
  as permissive for all to service_role using (true) with check (true);
create policy "service_role_internal_only" on public.reviews
  as permissive for all to service_role using (true) with check (true);
create policy "service_role_internal_only" on public.saved_designers
  as permissive for all to service_role using (true) with check (true);
create policy "service_role_internal_only" on public.saved_projects
  as permissive for all to service_role using (true) with check (true);
create policy "service_role_internal_only" on public.style_analysis_daily_usage
  as permissive for all to service_role using (true) with check (true);

commit;
