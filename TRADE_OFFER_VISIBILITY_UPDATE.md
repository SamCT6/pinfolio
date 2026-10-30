# Trade proposal offering and pin image update

This update changes proposal rules so the person creating a proposal may offer any pin they currently own, even if they have not marked it tradeable. The pin requested from the other trader must still be shared with the user and have enough tradeable copies. Other members will still only see/propose against pins returned by the shared-trader listings, which require tradeable quantity.

It also resolves stored `pin-images` object paths into signed URLs when loading the user's collection, the catalog picker, and trade history cards, so images stored privately in Supabase Storage can render in the proposal screen.

## Apply the database migration

Run `supabase/migrations/20261030000000_pinfolio_any_owned_pin_offers_and_trade_images.sql` in Supabase SQL Editor. This updates the trade RPC functions without deleting existing collection or trade rows.

## Test

1. Add a pin to your collection with owned quantity 1 and tradeable quantity 0.
2. Propose a trade to a friend for one of their visible tradeable pins.
3. Confirm the pin with tradeable quantity 0 can be selected and offered.
4. Confirm pins offered by the friend are still limited to their tradeable inventory.
5. Check images on My Collection, All Pins, and trade history cards. Private storage images should be signed by the app when data loads.
