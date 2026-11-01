# Pinfolio shared pin value fix

This is a targeted repair for the shared pin value update. It restores the full `PinForms.jsx` from the password-recovery-compatible baseline and adds the shared catalog-value save call, so `PasswordRecoveryScreen` remains exported for `src/App.jsx`.

## Apply
1. Back up your existing project files.
2. Copy `src/forms/PinForms.jsx` and `src/components/Catalog.jsx` from this package into the matching paths in your project. Do not replace `src/App.jsx`.
3. In Supabase Dashboard → SQL Editor, run `supabase/migrations/20261101000004_pinfolio_shared_pin_value_from_add_pin.sql`.
4. Run `npm run dev` and test adding a pin with a value. That value updates the shared catalog; `purchase_cost` remains recorded in your personal collection.

This ZIP has not been tested against your live Supabase project.
