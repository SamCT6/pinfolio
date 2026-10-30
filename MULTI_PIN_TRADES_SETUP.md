# Multi-pin trade setup

This update lets you offer several pins and request several pins in a single member-to-member trade. It also lets you record outside exchanges with multiple pins given and received in one atomic save.

## Supabase migration

Run `supabase/migrations/20261031000000_pinfolio_multi_pin_trades.sql` in the Supabase SQL Editor. It adds multi-item RPC functions and an outside-exchange batch history. It does not delete or rewrite existing trades or collection rows. Existing single-pin trades remain readable and completable.

## Test locally

1. Keep your existing `.env` file.
2. Run `npm install` if needed, then `npm run dev`.
3. In Traders, start a proposal from a friend's available pin. Select one or more cards under **What you're offering** and one or more cards under **What you want in return**, setting each quantity.
4. Test **Record an exchange** by adding at least two pins on the given side and two on the received side. Try both catalog pins and newly created pins.
5. Verify quantities and the trade cards before deploying.

Multi-pin trade proposal functions validate every offered quantity against owned inventory and every requested quantity against the other member's currently shared, tradeable inventory. Outside exchanges validate the entire given side before changing collection inventory, and the function transaction rolls back all changes if any step fails.
