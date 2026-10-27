# Shared Catalog Autofill Update

## What changed
- The Add Pin form now loads shared pin sets from `public.pin_sets`.
- The “Set name” field offers autocomplete suggestions from sets contributed by any signed-in Pinfolio user.
- Selecting an existing set fills its franchise and release year when those values are available.
- If you enter a set name that does not exist yet, the form creates a shared set and links the new pin to it.
- New pins created through this form continue to be marked `is_catalog = true`, so they can appear in the shared Catalog page.
- Set loading is paginated, so suggestions are not limited to the first 1,000 sets.

## Supabase
No new schema migration is required if the existing Pinfolio catalog migration has already been applied. That migration creates `pin_sets`, enables row-level security, allows authenticated users to read shared sets, and lets signed-in users create sets attributed to their own account.

The existing `pins` policies likewise allow signed-in users to read catalog pins and create pins attributed to themselves. Personal inventory is still written separately to `collection_items`; the form does not share purchase cost, quantity, authenticity, or personal notes with other users.

## Apply the update
1. Back up your current project folder.
2. Replace `src/forms/PinForms.jsx` with the updated file from this ZIP.
3. Run `npm install` if dependencies are not installed.
4. Run `npm run dev` and test **Add a pin → Create new**.
5. Type an existing set name in **Set name** and choose the suggestion. Save a new pin and verify it appears under that set in Catalog.
6. Test with a second signed-in account to verify the same set is suggested there too.

## Notes
- Shared set suggestions require a signed-in user and the existing `pin_sets` table/policies.
- The suggestion list is loaded when the Add Pin form opens.
- Existing pins are not automatically merged; this update links new pins to shared sets.
