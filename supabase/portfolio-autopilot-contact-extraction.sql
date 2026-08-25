-- Portfolio Autopilot: website contact/text extraction.
-- Adds storage for deterministic contact facts (phone, email, location,
-- languages, work modes, explicit service mentions) found in a crawled
-- site's own text/markup - never AI-invented, always surfaced for the
-- designer to confirm (source = website_extracted, confirmed_by_designer =
-- false until they say otherwise).
-- Run after supabase/portfolio-autopilot-profile-draft.sql.

begin;

alter table public.portfolio_import_jobs
  add column if not exists discovered_contact_facts jsonb not null default '{}'::jsonb;

alter table public.profile_field_provenance
  drop constraint if exists profile_field_provenance_field_key_check;
alter table public.profile_field_provenance
  add constraint profile_field_provenance_field_key_check
  check (field_key in (
    'headline', 'about', 'specialties', 'service_capabilities',
    'instagram_url', 'facebook_url', 'behance_url', 'linkedin_url',
    'full_name', 'location', 'website', 'phone', 'email', 'languages', 'work_modes'
  ));

alter table public.portfolio_profile_drafts
  add column if not exists full_name text,
  add column if not exists location text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists languages text[] not null default '{}',
  add column if not exists work_modes text[] not null default '{}',
  add column if not exists explicit_service_capabilities text[] not null default '{}';

commit;
