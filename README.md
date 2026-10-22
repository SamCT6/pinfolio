# Pinfolio starter

Pinfolio is a responsive, mobile-first web app concept for organizing a personal pin collection, wishlist, and friend-to-friend trading.

## Current status

This is the **first UI prototype**, not a production-ready collection tracker. It uses clearly labeled sample data so the main navigation and layouts can be reviewed before we connect real accounts and storage.

Included:
- Responsive desktop sidebar and mobile bottom navigation
- Dashboard, collection, friends' traders, wishlist, and More screens
- Search and demo pin detail view
- Initial visual design system (midnight navy, cream, muted gold)
- Supabase client scaffold and environment variable template

Not implemented yet:
- Real sign-up/sign-in or cloud persistence
- Database tables and row-level security policies
- Real pin catalog or imports
- Real photo uploads
- Friend invitations and per-friend visibility enforcement
- Trade proposals, counteroffers, and mutual completion confirmation
- Market valuation sources
- Authenticity-assessment workflow

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL Vite prints in the terminal.

## Next build steps

1. Create a Supabase project and configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Implement authentication and private profile/collection tables.
3. Add row-level security (RLS) before storing real collection or friend data.
4. Replace demo data with user-owned database records.
5. Build pin entry, photo storage, set checklists, and wishlist.
6. Implement friend sharing controls and trader listings.
7. Build trade negotiation, reservations, and mutual completion confirmation.

## Security notes

- Do not put a Supabase service-role key in browser code.
- Do not store private collection information until access rules are implemented and tested.
- Demo visibility labels are illustrative only; they do not enforce privacy.
- Do not deploy this prototype as if friend privacy and trade workflows were already functional.
