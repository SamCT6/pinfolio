# Pinfolio shared pin value + detail view update

## What this changes
- A value entered when adding a pin is stored as the shared `pins.catalog_value`.
- The shared value is updated automatically when a new `collection_items` row is created with a purchase/value entered.
- Personal `collection_items.purchase_cost` remains separate.
- Clicking a collection pin opens its detail view and shows the shared Pin value.
- Clicking a catalog pin opens a detail view and shows the shared Pin value.
- Catalog cards also show the shared Pin value when one exists.

## Supabase setup
Run this migration in Supabase SQL Editor:

`supabase/migrations/20261101000005_pinfolio_shared_pin_value_trigger.sql`

This migration creates `pins.catalog_value` if it does not exist and adds an AFTER INSERT trigger on `collection_items`.

The trigger intentionally runs only when a collection item is first inserted. Editing a user's personal purchase cost later will not silently change the shared catalog value.

## Frontend files
Replace:
- `src/forms/PinForms.jsx`
- `src/components/Catalog.jsx`

Do not replace `src/App.jsx`.
