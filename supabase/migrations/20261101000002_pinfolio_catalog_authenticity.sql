-- Store one shared authenticity status on the catalog pin itself.
-- The status is set when a user creates a new catalog pin; per-user collection
-- authenticity_status remains available for personal records but is not shown in Catalog.
alter table public.pins
  add column if not exists authenticity_status text not null default 'unknown';

alter table public.pins
  drop constraint if exists pins_authenticity_status_check;

alter table public.pins
  add constraint pins_authenticity_status_check
  check (authenticity_status in ('unknown', 'verified_authentic', 'suspected_counterfeit', 'confirmed_counterfeit'));

-- Remove the old aggregate function so the Catalog no longer uses community assessments.
drop function if exists public.get_catalog_authenticity_summary();
