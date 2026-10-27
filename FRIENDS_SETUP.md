# Pinfolio Friends page setup

This update adds a **Friends** item to the desktop sidebar and a Friends page with:

- exact-username friend search and requests
- incoming request accept/decline controls
- outgoing request status
- accepted friends list
- clickable friend profiles that show pins the owner marked **Public**

## 1. Apply the Supabase migration

Open Supabase Dashboard → SQL Editor and run the contents of:

`supabase/migrations/20261028000000_pinfolio_friends_page.sql`

The migration lets users see profile details only when a friend request connects the two users, and lets signed-in users read public inventory rows (plus friends-only rows only for accepted friendships). It does not grant access to private collection rows.

## 2. Deploy the updated username lookup function

The Friends page uses the existing `find-trading-user` Edge Function. This update lets a user find another account by its exact username even if that account's collection profile is private; only basic profile details needed to send a request are returned. Deploy the updated function from `supabase/functions/find-trading-user/index.ts`. Keep `PINFOLIO_SERVICE_ROLE_KEY` set as an Edge Function secret; never put it in a frontend `.env` file.

If using the Supabase CLI from the project root:

```bash
supabase functions deploy find-trading-user
```

## 3. Test

1. Sign in with two test accounts.
2. Search for the second account's exact username and send a request.
3. Sign in as the receiving account and accept the request.
4. On that account, set at least one collection item visibility to **Public**.
5. Return to the first account → Friends → click the friend. The public pin should appear; private pins should not.

## Notes

- Friends are accepted through the existing `respond_to_friend_request` database function.
- The page shows public pins only, as requested. Personal notes, purchase costs, and private pins are not displayed.
- A full production build could not be verified in this environment because the installed dependencies are missing the platform-specific Rollup binary. Run `npm install` and `npm run build` locally before deploying.
