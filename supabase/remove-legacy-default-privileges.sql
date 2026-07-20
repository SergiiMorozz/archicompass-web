-- Remove historical default grants that can otherwise survive narrower REVOKE
-- statements. Future public-schema objects start private by default.

alter default privileges for role postgres in schema public
  revoke all privileges on tables from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all privileges on sequences from public, anon, authenticated;
