# Pinfolio password reset setup

The sign-in screen now includes **Forgot password?** and a show/hide password control. Password reset emails use Supabase Auth, and the recovery link opens Pinfolio's new **Choose a new password** screen.

## Supabase redirect URL

In Supabase, open **Authentication → URL Configuration → Redirect URLs** and add the exact URL where Pinfolio is hosted. For a GitHub Pages project this usually looks like:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`

Also add your local development URL if you want to test password resets locally, for example `http://localhost:5173/` (use the actual URL shown by Vite).

The app sends the current origin and pathname as the recovery redirect, so each URL you use needs to be allowed by Supabase. Do not put a service-role key in the frontend; the reset feature uses the normal Supabase client.

## Test it

1. Open Pinfolio's sign-in screen and enter the email address for your account.
2. Click **Forgot password?** and check the inbox and spam folder.
3. Open the reset link on the same deployment you requested it from.
4. Enter and confirm a new password. The eye buttons can show or hide each password field.
5. Sign out and sign in using the new password.
