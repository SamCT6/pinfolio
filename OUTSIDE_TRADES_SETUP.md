# Pinfolio trade cards and outside exchanges

## What's included
- Trade history proposals display pin image cards, labels (offered/requested), set information, and quantity.
- Traders includes "Exchange outside Pinfolio" for recording an exchange without selecting a partner.
- The exchange flow supports an existing catalog pin or creating a new pin entry.
- Inventory removal/addition and an outside-exchange history record are handled by one PostgreSQL function/transaction.

## Required Supabase step
Before using the outside exchange feature, run the complete migration:
`supabase/migrations/20261029000000_pinfolio_outside_exchanges.sql`

Run it in Supabase SQL Editor, or apply migrations using your normal Supabase workflow. This migration adds a private per-user exchange history table and the `record_outside_pin_exchange` RPC. It does not delete existing collection or trade data.

## Apply the code
Copy the included project files over your current project, but **keep your existing local `.env` file**; it is intentionally not included in this ZIP. Do not commit `.env` to GitHub. Install dependencies if needed with `npm install`, then run `npm run dev`.

The source JSX passed a syntax parse check. A full Vite production build could not be verified in this environment because the supplied archive's `node_modules` was missing the platform-specific Rollup optional dependency.
