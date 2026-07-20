-- New objects in the public schema must be explicitly exposed through grants
-- and RLS policies. This prevents accidental Data API exposure in future work.

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from public, anon, authenticated;
