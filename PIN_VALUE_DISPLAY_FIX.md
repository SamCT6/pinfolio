# Pin Value display fix

The collection detail was showing “Not set yet” because `src/App.jsx` did not select `pins.catalog_value` from Supabase or map it onto each collection pin as `catalogValue`. The detail component already reads `pin.catalogValue`.

This patch adds `catalog_value` to the nested `pins` query and maps it to `catalogValue`, so values already saved in Supabase display on the Collection pin details and Dashboard. The Dashboard card is labeled “Pin Value”.

No SQL migration is required. After extracting, run `npm run dev`, refresh the app, and open a pin that has a non-null `pins.catalog_value`. If the app is deployed to GitHub Pages, commit and push the updated files to rebuild the site.
