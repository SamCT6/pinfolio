# Shared pin value update

This patch makes the optional value entered on Add Pin update the shared `pins.catalog_value` for that pin, so everyone sees the same catalog value. It still stores the same amount in your own `collection_items.purchase_cost` as your personal purchase cost. If the value field is left blank, the shared catalog value is not changed. The Catalog page displays the shared value when one is set.

## Apply
1. Back up your project.
2. In your project, replace `src/forms/PinForms.jsx` and `src/components/Catalog.jsx` with the matching files from this patch.
3. Open Supabase Dashboard → SQL Editor and run the full SQL in `supabase/migrations/20261101000004_pinfolio_shared_pin_value_from_add_pin.sql`.
4. Refresh Pinfolio. Add a pin and enter a value; the catalog value is saved for that shared pin and shown in Catalog.

The SQL migration is safe to rerun. This patch was not tested against your live Supabase project.
