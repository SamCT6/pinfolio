# Preserve existing catalog authenticity statuses

The shared authenticity column was initially added with a default of `unknown`, which did not automatically copy existing personal collection assessments into the shared catalog. This migration backfills each catalog pin from existing non-unknown `collection_items.authenticity_status` values. It prefers the catalog creator's status, then the most recent saved status from another owner.

Run `supabase/migrations/20261101000003_pinfolio_backfill_catalog_authenticity.sql` in the Supabase SQL Editor. It only updates catalog pins whose shared status is currently `unknown`; it does not overwrite a shared status that has already been set.

Pins with no prior non-unknown collection assessment will remain `unknown` and must be set manually in the Catalog Edit Pin page.
