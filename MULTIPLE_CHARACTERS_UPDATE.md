# Multiple Characters in Pinfolio

Character fields in Add Pin, Edit Pin, Wishlist-created pins, and Catalog Edit Pin now accept multiple character names separated by commas, for example `Mickey Mouse, Minnie Mouse, Pluto`.

The values are saved to the existing `pins.character_name` text column, so no Supabase migration is required and existing pin IDs/collection references are preserved. Existing single-character values continue to work.

This stores the list as a comma-separated text value rather than a normalized relational character table. Search and display continue to use the existing `character_name` field.
