# Shared catalog price setup

The Catalog Edit Pin form now has a **Catalog price ($)** field for every catalog pin, whether or not you own it or created it. This is a shared catalog value, separate from your personal purchase cost in your collection.

Before using it, run `supabase/migrations/20261101000000_pinfolio_shared_catalog_price.sql` in the Supabase SQL Editor. Sign-in is required to save a catalog price. The migration adds `pins.catalog_value` and a narrowly scoped RPC that updates only that price field, without granting users permission to edit other people's catalog metadata.

The regular **Save changes** button still edits the pin's metadata and remains subject to the existing `pins` table RLS rules. Use **Save catalog price** to save the shared price independently.
