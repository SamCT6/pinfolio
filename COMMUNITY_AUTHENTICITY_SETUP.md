# Community authenticity reports

The Catalog now displays aggregate authenticity assessments saved by all users for each catalog pin. The database function returns counts by status only; it does not reveal who owns a pin or expose private notes/photos. Assessments are community reports, not official authentication.

## Setup
1. In Supabase Dashboard, open **SQL Editor**.
2. Run `supabase/migrations/20261101000001_pinfolio_community_authenticity.sql`.
3. Reload Pinfolio. When users update authenticity in their own Collection, the catalog's aggregate counts update on the next catalog load.

Only non-unknown assessments are counted. If reports disagree, each status and its count appears separately rather than presenting one status as definitive.
