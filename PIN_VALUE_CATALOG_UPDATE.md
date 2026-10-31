# Pin Value and Catalog Editing Update

The Catalog now allows editing the value of an owned pin from its card. This updates the current user's `collection_items.purchase_cost` field; the database column is intentionally unchanged to preserve compatibility. User-facing labels across Add/Edit Pin, collection views, and dashboard now say Pin value.

No migration is required. Value is per your collection entry, not a global value shared by every catalog user.
