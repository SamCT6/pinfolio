# Pinfolio: one shared Pin Value

This patch makes **Pin value** the single value used across Pinfolio. The amount entered in the Pin value field is saved to `pins.catalog_value` through `set_pin_catalog_value`, so it is shared with everyone who owns that catalog pin. The Dashboard and Collection report show the shared Pin value multiplied by the number of copies owned.

The app no longer presents a separate personal purchase-cost field in the pin detail or writes the Add/Edit Pin value into `collection_items.purchase_cost`. Existing `purchase_cost` values in Supabase are left untouched; this patch does not delete or migrate stored data.

## Install
1. Back up or commit your current project.
2. Extract this ZIP.
3. Copy the included `pinfolio/src/components/AppViews.jsx` and `pinfolio/src/forms/PinForms.jsx` over the matching files in your project.
4. Run `npm run dev` and test adding/editing a pin value.

The value is shared across owners; only users permitted by your Supabase RLS/RPC setup can update it. No database migration is included because this uses the existing `set_pin_catalog_value` RPC.
