# Pinfolio form and catalog updates

This update adds the following:

- Catalog images now use short-lived Supabase Storage signed URLs for `pins.image_path`, while continuing to support direct `image_url` links.
- Catalog cards have an **Add to wishlist** action alongside **Add to collection**.
- The Add to Wishlist form can either select a shared catalog pin or create a new shared catalog pin directly from the wishlist flow.
- The Add Pin form now captures authenticity and visibility at creation time.
- Pin fields include description, edition type, catalog code, set number, and an optional photo URL/upload.
- Shared, in-app autocomplete dropdowns filter as the user types; they do not depend on the browser's native `datalist`/keyboard suggestions.
- The collection edit screen now includes the pin's catalog metadata, set membership, catalog image URL/upload, quantities, cost, authenticity, visibility, notes, and a separate private personal-photo upload.

## Required Supabase step

Run this migration in the Supabase SQL Editor (or deploy migrations with the Supabase CLI):

`supabase/migrations/20261027000000_pinfolio_shared_catalog_editing.sql`

It allows authenticated users to update records marked `is_catalog = true`, so users can improve shared community catalog details. Personal collection data remains protected by the existing `collection_items` policies. Because catalog details are shared, changes to a shared pin are visible to other users.

No `.env` file or Supabase secret key is included in this archive. Keep your existing local `.env` file and do not commit secret keys to GitHub.

## Run locally

```bash
npm install
npm run dev
```

Test photo upload with a signed-in user and confirm that the `pin-images` bucket exists with the storage policies from the existing Pinfolio core migration. Catalog image uploads are shared; the personal-photo field in Edit Collection remains separate and private to that user's collection record.
