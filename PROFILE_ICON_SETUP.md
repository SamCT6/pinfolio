# Pinfolio profile icon setup

This update lets each signed-in user upload a profile picture from **More → Trader profile → Profile icon**. The image is shown in their sidebar and top-right account avatar, and where friend avatars are displayed. Users can reset to the default initial at any time.

## Supabase setup

1. Open your Supabase project and go to **SQL Editor**.
2. Run the full migration file `supabase/migrations/20261028000001_pinfolio_profile_avatars.sql`.
3. Deploy the updated frontend to GitHub Pages as usual.

The migration creates a public `profile-avatars` storage bucket (maximum 5 MB; JPG, PNG, WebP, and GIF) and restricts uploads/updates/deletes to the signed-in user's own UUID folder. Public read access is intentional so profile pictures can display to friends.

No new environment variables or Edge Function secrets are required. Keep your existing `.env` file private and out of public repositories.
