# Catalog authenticity update

Authenticity in the Catalog is now a single shared status on the catalog pin, set by the person who creates that catalog entry. The Catalog no longer displays a separate personal assessment or community report counts. Existing personal authenticity values in `collection_items` are preserved but are not used as the shared Catalog status.

## Apply
1. Run `supabase/migrations/20261101000002_pinfolio_catalog_authenticity.sql` in the Supabase SQL Editor.
2. Replace the project files with the files in this ZIP, preserving your `.env` and `.git` folder.
3. Restart with `npm run dev`.

The migration adds `pins.authenticity_status` with a default of `unknown`. Existing catalog pins will show Unknown until their shared status is updated. New pins created through Add Pin save the selected authenticity status to the shared catalog entry. Selecting an existing catalog pin does not overwrite its shared status.
