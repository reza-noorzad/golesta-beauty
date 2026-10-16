Golesta Beauty V2 - Firestore Services Admin

1. IMPORTANT: BACK UP v2/src/components/ServicesGrid.tsx before extracting. This ZIP replaces it.
2. Extract ZIP contents directly into C:\projects\golesta-beauty\v2 (NOT a new nested folder).
3. In Firebase Console > Firestore Database > Regeln, replace the ENTIRE rules with firestore.rules from ZIP and click Veröffentlichen.
4. Run in VS Code PowerShell:
   cd C:\projects\golesta-beauty\v2
   npm.cmd run lint
   npm.cmd run build
   npm.cmd run dev
5. Log into http://localhost:3000/admin/login and open /admin/leistungen.
6. Initially existing services load from site-data.json; NOTHING is written automatically.
7. Click a category, edit service names/prices, then click Änderungen speichern and confirm.
8. Open http://localhost:3000 and expand that service card to verify changes.

IMPORTANT:
- If you want to migrate all existing services without changing them, make a small intentional edit and save. You can revert that edit before saving if you still have another change; otherwise no automatic import button is provided.
- The current Firestore doc 'publicServices/current' is publicly readable. Do not place private information in it.
- Admin login is still protected in the browser only. DO NOT deploy to production until server-side protection, complete rules review, and security testing are done.
- Existing QR links and production site remain untouched.
- This ZIP does not replace page.tsx, product pages, images, site-data.json, or .env.local.
- If your source site-data.json is missing or structurally different, compilation will fail. Ask for a compatibility fix instead of deploying.
- The Next.js instant navigation insight may persist; loading.tsx is a first mitigation, not a guarantee. Do not add 'instant=false' to a client component.
