# Golesta Beauty — Project status

Updated: 2026-11-11 (Europe/Berlin)

## Identity and safeguards

- Repository: `reza-noorzad/golesta-beauty`; local application: `v2/`.
- Permanent development branch: `development/golesta-v2` (verified).
- Current specification: master development prompt v2.3; Phases 1–4B-2 and the Phase 5A implementation/checkpoint are recorded; release gates remain open. Phase 5B local navigation, dependency review and Playwright WebKit QA are complete below; Preview release approval remains BLOCKED.
- Package version: `0.1.0` (unchanged; no release or tag created).
- Current local HEAD: `3dd1c9ac01d24fcbde54b7929e381bb3e7307098` - completed LOCAL Phase 5B checkpoint; last recorded pushed checkpoint remains `9f81aeb`. No remote query/fetch/push in this review.
- Historical baseline Preview build at 9f81aeb: READY in earlier metadata. Phase 5B is committed locally at 3dd1c9a, not pushed/deployed; no fully verified live integration release established.
- Production reference from brief: Vercel `golesta-beauty-web`, `www.golestabeauty.com`.
- Development reference: Vercel `golesta-beauty`; Next.js/Node 24, Preview variable names and observed deployment repository/development branch confirmed read-only. Current project Git/root settings and backend isolation remain unverified; no settings/deployments changed.
- Do not change `main`, push, deploy, delete Firestore data, commit secrets, or modify production. Preserve QR links and business data.

## Current phase

Final go-live preparation completed after the interruption. Redirect fixes and saved validation are intact; owner confirmation resolves old-site sharing. Code is ready for an approved checkpoint/Preview, but NO-GO for domain cutover until runtime/deployed-policy/admin checks, scoped dependency decision and explicit cutover approval. Concrete sequence: v2/release/GO_LIVE_PLAN.md. No commit/push/deploy, provider mutation or domain/settings changes.

**Reading this record:** phase-specific entries are historical snapshots. Old HEAD 581b1c2, Java-unavailable and not-started phase statements describe their original checkpoints; latest Phase 5B reconciliation below and PREVIEW_READINESS.md are authoritative.

## Phase 1 — completed implementation

- Added root ignore rules covering nested environment files, common Firebase service account/credential files, backups, duplicate app, source exports, dependencies, generated builds, browser test output, coverage and logs. No files deleted or unstaged.
- Excluded `v2/v2/` and historical `v2/reference/` from the active TypeScript and ESLint scopes; retained active source and tests.
- Added the missing services accordion with native keyboard-accessible disclosure controls, category descriptions and unchanged service price strings.
- Completed the services page's existing search/category UI, result counts, empty/reset state and expanded filtered matches.
- Services page now uses the same `publicServices/current` subscription, validation and original-data fallback as the homepage. Contacts use existing website settings. Live subscription errors show a German fallback notice.
- Preserved the existing README edits, `v2/public/links.html`, untracked tests, source/assets, backup directories and duplicate app on disk.
- Added `v2/tests/services.spec.ts` for isolated responsive services/QR regression checks. Existing test files were not edited.

## Phase 1 — verification

- Verified local branch, HEAD, origin URL and initial working tree.
- Installed runtime: Node `24.17.0`, npm `11.13.0`, Next `16.4.1`, React `19.3.0`, TypeScript `5.9.3`, Firebase Admin `13.10.0`.
- No tracked environment/credential/key paths found in the targeted Git filename check.
- `npm.cmd run typecheck`: PASS (`next typegen && tsc --noEmit`), including a final check after adding browser tests.
- Parsed TypeScript configuration: PASS; zero duplicate-app files, active tests retained in compilation.
- `npm.cmd run build`: PASS, Next.js 16.4.1 Turbopack, 24/24 static pages generated, including `/leistungen`; dynamic API/product routes compiled.
- `npm.cmd test`: PASS, 11/11 existing unit tests (content validation/migration, publication filtering, image optimization/upload validation, announcements and discount behavior).
- `node node_modules/eslint/bin/eslint.js src/app/leistungen/page.tsx src/components/ServicesAccordion.tsx tests/services.spec.ts eslint.config.mjs`: PASS. This is targeted lint, not a full-repository lint certification.
- Isolated browser command (from `v2/`, after starting the built app on port 3102): set `GOLESTA_TEST_BASE_URL=http://127.0.0.1:3102` and `GOLESTA_TEST_BROWSER_CHANNEL=msedge`, then run `node node_modules/@playwright/test/cli.js test tests/services.spec.ts --workers=1 --reporter=line`: PASS, 3/3 tests at 320, 390 and 1440px in installed headless Microsoft Edge.
- Browser coverage: initial categories/result count, unchanged original price strings, native accordion keyboard open/close, trimmed/case-insensitive search, combined category filtering, automatically opened matches, empty state/reset, configured WhatsApp link, no horizontal overflow with the filtered results, QR `/links.html` HTTP 200/title, and no uncaught page errors. `/api/content` was mocked and external browser requests blocked; live Firestore delivery was not tested.
- Root ignore checks: PASS for representative nested environment/credential paths, actual historical copies, duplicate app, source exports, dependencies, build/test artifacts and coverage. Active tests/docs/source/QR files remain trackable. All three backup directories, duplicate app and reference directory still exist.
- Preservation checks: SHA-256 hashes matched all 13 original files selected before edits (root/application README files, admin/Firebase README variants, QR links, existing image test marker and all six pre-existing test files).
- `git diff --check`: PASS. Git emitted existing LF/CRLF conversion notices; no whitespace errors.
- Initial restricted test/build attempts failed before useful verification: `tsx` OS user lookup (`uv_os_get_passwd` / `ENOMEM`) and blocked Google Fonts downloads. Both passed on approved execution outside those sandbox restrictions. No application workaround or dependency changes were needed. Future builds still require access to the existing Google Fonts downloads unless cached.
- The temporary local production server was stopped after browser verification.
- Use `npm.cmd` in PowerShell; `npm.ps1` is blocked by the local execution policy.

## Pending and known limitations

- No critical Phase 1 compilation/build issues remain in the checks executed. Full application verification is still pending in later phases.
- Phase 2 authentication/API fixes, Phase 3 admin redesign and Phase 4A public changes are recorded below. Management functionality remains in Phase 4B; full release QA remains Phase 5.
- Live Firebase reads passed in Phase 2. Real user authentication, authenticated live mutations, Cloudinary uploads and deployed Vercel behavior remain unverified.
- Mobile viewport checks used Chromium-based Edge; iPhone Safari/WebKit and Android device testing remain pending.
- The pre-existing broader browser/API smoke/emulator suites and full ESLint/security/dependency audit were not run in this phase. Run them in the appropriate later phase with isolated configuration; do not assume the checked-in smoke script is safe against a configured live backend without reviewing its setup.
- Ignore rules do not remove secrets from prior Git history; no comprehensive history or credential-content audit has been performed.
- Existing changes and meaningful untracked tests/documentation are intentionally uncommitted. Ignore rules hide local historical copies from normal status output without deleting them.

## Deployment status

Local changes only. No commits, tags, pushes, deployments or production configuration/data changes performed.
Phases 1–3 and 4A pass their recorded local checks. This is not deployment approval or proof that deployed authentication and write integrations work.

## Files changed in Phase 1

- `.gitignore` (new): repository-wide safety rules.
- `v2/tsconfig.json`: duplicate/reference exclusions.
- `v2/eslint.config.mjs`: matching exclusions.
- `v2/src/app/leistungen/page.tsx` (pre-existing untracked work, repaired): live services integration and completed filtering.
- `v2/src/components/ServicesAccordion.tsx` (new): accessible services/price presentation.
- `v2/tests/services.spec.ts` (new): isolated desktop/mobile regression coverage.
- `PROJECT_STATUS.md` (new): this phase checkpoint and verification record.

Other modified/untracked README, public, test and documentation files predate this phase. Do not attribute their existing diffs to this work or discard them. Historical copies are now ignored, not removed.

## Phase 2 — bugs found and fixes

- **Unbounded and duplicated authorization:** the shell and login separately awaited client Firestore admin lookups, with no deadline or observer error recovery. A shared session provider now observes Firebase ID-token changes and checks the new authenticated `GET /api/admin/session` endpoint. Initial restoration and authorization have a 15-second UI deadline. Recovery stays on the page, with German retry/sign-out actions; transient failures do not bounce between login and protected pages.
- **Client/server authorization divergence:** navigation now uses the server's verified identity and role. Every admin handler still verifies the token with revocation checking and requires an active administrator. Unknown roles now fail closed with 403; existing active administrators without a role retain the prior legacy admin behavior. Editor restrictions and superadmin-only administrator management remain enforced server-side.
- **Stale asynchronous access grants:** authorization results are ignored after timeout, user switch, logout or disposal. Routine token refresh for the same authorized user does not remount an editor and discard its unsaved draft. API 401/403 responses trigger a bounded authorization recheck; the session endpoint itself cannot recursively trigger retries.
- **Session lifecycle:** initialization failures show a recoverable message rather than throwing during page rendering. Persistence tries IndexedDB, local storage, session storage and then memory. Password login, token acquisition, logout and API/body reads have deadlines. Logout cancels pending access checks and restarts observation so re-login works without a page reload. Safe return URLs restore direct admin navigation and reject external/login-loop destinations. Login fields use mobile-appropriate autofill and 16px text.
- **JSON/network failures:** shared request handling now tolerates empty/HTML/truncated error bodies, retains HTTP status, hides upstream/internal error details, handles offline/aborted requests, and validates successful response shapes before rendering. Headers objects are preserved. Requests are not automatically retried. Save timeouts warn that a mutation may have completed and advise reloading before another save.
- **Incorrect API error status:** malformed JSON in review moderation and administrator mutations previously reached generic 500 handling. All JSON-writing admin handlers now use limited structured parsing and return 400; oversize requests return 413. Expected failures use German JSON responses and no-store headers. Unexpected exceptions return a generic 500 without stack traces or secrets.
- **Document path validation:** review IDs and administrator UID inputs now reject nested paths before constructing a Firestore reference.
- **Service editor hangs/unsafe recovery:** the admin service loader now uses authenticated `GET /api/admin/services` rather than an unbounded client Firestore lookup. Failed loads show retry instead of opening an empty editable list. Original-data fallback is used only when the document is absent, not on a failed backend request. Content and service writes retain their revision/timestamp conflict checks.
- **Backend read reliability:** token/admin verification and content/services/reviews/administrator listing reads have bounded server-side deadlines. The public content read also returns a controlled failure if its backend read stalls. Mutations are not raced against a server timer, because an operation might still commit.
- **Unexpected editor failures:** added the admin route error boundary with a safe German message and the installed Next.js 16.4 `retry()` recovery API.
- **Lint findings:** corrected the affected users/reviews mount effects and removed one pre-existing unused settings import. No premium redesign was started.

## Phase 2 — Firebase Admin / Node / Vercel investigation

- Actual installed production chain: `firebase-admin 13.10.0 -> jwks-rsa 3.2.2 -> jose 4.15.9`. The development-only Firebase CLI separately brings `jose 6.2.12`; it is not the Admin SDK's resolved copy.
- Native loading of Firebase Admin app/auth/Firestore/storage, jwks-rsa and jose succeeds on local Node `24.17.0`. The compiled API also initializes the actual configured Admin SDK and rejects a malformed token with JSON 401.
- Installed Next.js documentation confirms that Firebase Admin is already automatically externalized. No redundant externalization, package downgrade or dependency override was added. All admin handlers explicitly select the Node.js runtime. The engine range and lockfile root metadata now select Node 24 (`>=24.12.0 <25`) while retaining the existing minimum. Dependency versions and resolved package graph were unchanged.
- The historical `ERR_REQUIRE_ESM` / external-module load error was **not reproduced with the current installed graph**. A CommonJS/ESM dependency or deployed-runtime mismatch is a plausible cause class, not a confirmed reconstruction of that deployment. Historical deployment logs, its exact installed graph and actual Vercel runtime were not inspected, so that incident's exact root cause remains unverified.
- The frontend's unconditional `response.json()` was a confirmed cause of raw parse failures on empty/non-JSON responses. That path is now covered by focused tests.
- References: [Firebase persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence), [Node require(esm) changes](https://nodejs.org/en/blog/release/v22.12.0), [Vercel Node version selection](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). The version-specific Next guides were read from `v2/node_modules/next/dist/docs/`.

## Phase 2 — verification results

All commands below run from `v2/` unless stated otherwise.

| Check | Final result | Evidence / scope |
| --- | --- | --- |
| `npm.cmd run typecheck` | PASS | Route generation and TypeScript, including new scripts/tests. |
| `npm.cmd run lint` | PASS | Full configured ESLint scope; zero errors or warnings. Historical/duplicate folders stay excluded. |
| `npm.cmd run build` | PASS | Next.js 16.4.1, 25/25 static pages, compiled dynamic API routes. No deployment. |
| `npm.cmd test` | PASS, 26/26 | Existing 11 tests plus session deadlines/races/revocation/roles, safe redirects, response parsing/shapes, offline/abort/deadline behavior, headers and redaction. |
| `npm.cmd run test:admin-api` | PASS, 9/9 | Actual route handlers with the Firebase boundary replaced by a process-local Map. Every supported admin handler rejects anonymous requests; checks session/role restrictions, content/settings saves, nonempty published/draft products and variants, gallery preservation, service saves/conflicts, review moderation, malformed JSON and invalid paths. No live writes. Node's test-module-mocking experimental warning is expected. |
| Isolated browser suites | PASS, 12/12 | Command below; 9 auth/editor cases plus 3 Phase 1 services/QR cases. Installed Microsoft Edge. |
| `node tests/admin-http-smoke.mjs` | PASS | Existing local production server: 11 supported admin method/path combinations return JSON 401, actual SDK initialization + invalid token returns JSON 401, compiled public content API returns JSON 200 from configured Firebase (read only). |
| `node --import tsx scripts/verify-firebase-read.ts` | PASS | Actual configured Firebase, read only: content exists and validates; 0 stored products, 18 gallery images, settings readable, 8 service categories; review query succeeds (sample 0), admin query succeeds (sample 1). No names, emails, tokens, credentials or record contents printed. |
| Preservation / working tree | PASS | All 13 original README/QR/marker/test SHA-256 hashes still match Phase 1. Branch remains `development/golesta-v2`, HEAD `581b1c2`; backups and previous work retained. `git diff --check` passes. |

Browser reproduction:

1. Build the app and start `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3102`.
2. In PowerShell set `$env:GOLESTA_TEST_BASE_URL='http://127.0.0.1:3102'` and `$env:GOLESTA_TEST_BROWSER_CHANNEL='msedge'`.
3. Run `node node_modules/@playwright/test/cli.js test tests/admin-auth.spec.ts tests/services.spec.ts --workers=1 --reporter=line`.
4. Auth/content responses are intercepted in the browser; all other external browser requests are blocked. Coverage includes direct protected URLs, login at 390/1440px, reload persistence, logout and re-login without reload, denied access without loops, stalled session deadline and successful retry, HTML/invalid-JSON/network editor errors, expired API sessions, and unavailable browser storage falling back to memory.
5. Run `node tests/admin-http-smoke.mjs` separately for actual local compiled endpoints. Its public GET needs server network access to Firebase. Stop the temporary server afterwards; servers started in this phase were stopped.

Final unresolved test failures: none in the checks executed. Initial browser failures were incorrect selectors (the existing product button label and Next's additional route-announcer alert), corrected in the new tests. The first standalone read diagnostic imported Next's build-only `server-only` marker; its standalone SDK import was corrected. A sandboxed local server could not complete its Firebase read; the final network-enabled local server returned HTTP 200. These attempts are not evidence of live authentication or mutation coverage.

## Phase 2 — remaining limits and manual verification

- No real administrator password/session was supplied or used. Successful live password sign-in, real token refresh/expiration/revocation, real role changes and permission removal across devices remain unverified. Browser auth flows use intercepted Firebase responses; route authorization tests use a mocked boundary.
- Actual content/services/settings/products/gallery/review writes and user management were tested only in memory. No business record was created, changed or deleted. The live product list is empty, so nonempty product round-trips were verified using isolated fixtures.
- Java is not installed/on PATH; Firestore/Storage rules emulator tests were not run. Existing rules were not modified. Full security and dependency audit remains Phase 5.
- iPhone Safari, real Android Chrome and WebKit were not run. Edge mobile viewports and simulated unavailable storage passed, but do not certify real Safari persistence/background-resume behavior.
- Live Cloudinary uploads were not attempted. Existing image optimization unit tests passed; network upload/credential behavior remains a later isolated/manual check.
- No Vercel project configuration, preview/production deployment or runtime logs were changed or inspected. The historical deployment failure cannot be declared resolved in production from a local build.
- Before eventual release, verify against an isolated development Firebase project and a user-approved development Vercel preview: real admin/editor/superadmin login, refresh, logout/re-login, inactive/revoked accounts, permission boundaries, saves/conflicts and moderation; then test Safari/Android on devices. Never perform destructive QA on business records.
- Root ignore rules and earlier protection limitations remain in effect. No commits, pushes, tags or deployments were performed.

## Files changed in Phase 2

- Auth/session: `v2/src/lib/firebase.ts`, new `admin-session.ts`, new `components/admin/AdminSession.tsx`, `AdminShell.tsx`, admin layout/login and new admin `error.tsx`.
- API/client reliability: new `v2/src/lib/request.ts`, new `admin-api.ts`, `content-client.ts`, `server/firebase.ts`, new `server/http.ts`, new `server/authorization.ts`; all five existing admin route files, new admin session route, and the public content route.
- Service integration: new pure `v2/src/lib/services.ts` (existing model extracted), `services-store.ts`, admin services page. The public subscription and original service values are retained.
- Typed API consumers/effect cleanup: admin overview/users/reviews, `ContentEditor.tsx`, `ImageUpload.tsx`; unused import only in `SettingsEditor.tsx`.
- Runtime/test commands: `v2/package.json`, `v2/package-lock.json` (engine metadata only; no dependency resolution changes).
- New verification artifacts: `v2/tests/auth.test.ts`, `api-errors.test.ts`, `admin-routes.test.mts`, `admin-auth.spec.ts`, `admin-http-smoke.mjs`, and `v2/scripts/verify-firebase-read.ts`.
- `PROJECT_STATUS.md` updated. Pre-existing READMEs, tests and QR files were not edited.

## Phase 3 — UI/UX completed

- Added an admin-only design system: warm ivory canvas, cream surfaces, dark champagne buttons, readable dark text, serif headings, shared spacing/radii, restrained shadows, and consistent line icons. CSS is scoped to `.admin-app`; public styles and pages are unchanged.
- Rebuilt the desktop sidebar with clear active navigation, account context, role-appropriate links, website access and logout. Mobile/tablet use a compact sticky header and collapsible navigation with `aria-expanded`/`aria-controls`, Escape dismissal and focus return. The menu scrolls within the available viewport rather than clipping its links.
- Added shared headers, badges, notices, loading/empty states, keyboard-operable tabs and a sticky save toolbar. Inputs use consistent labels, placeholders, focus indicators and 16px text. Checkboxes and action buttons have consistent styling; mobile buttons are at least 44px high. Reduced-motion preferences are respected.
- Grouped advanced forms into collapsible sections. New text fields for services, categories, employees, announcements and variants start empty with examples only in placeholders. Existing genuine values and data contracts are retained.
- Save feedback now clearly distinguishes success and errors. Editors stay disabled during a save. Content validation gives German recovery guidance before submitting invalid data. The shared unsaved-change warning covers in-app navigation, tab closing and logout; opening the public website in another tab does not discard a draft.
- Removed administrator-facing Firestore/Cloudinary/storage/setup implementation explanations. Role names and actions use everyday German. Clipboard failures have a recovery message rather than an unhandled rejection.
- No analytics, tracking, paid service, backend schema, API authorization or security-rule changes were introduced.

## Phase 3 — pages improved

| Page | Result |
| --- | --- |
| `/admin` | Six compact, actionable metrics for published products, drafts, pending reviews, currently active announcements/promotions, and selected published homepage gallery images. Scheduled/expired notices are counted using the existing period logic. Values come from the APIs; unloaded values remain a dash. Restricted editor cards do not link to forbidden sections. Analytics remains an honest, quiet unconfigured state. |
| `/admin/leistungen` | Category browser on desktop and category select on mobile; one service editor opens at a time. Category descriptions and ordering controls fold away. New names/prices are empty; the current form stays open while typing. Failed loads cannot present an editable empty list. Save controls remain available and edits are disabled during saving. |
| `/admin/produkte` | Existing search/category/publication filters retained. Product summaries include thumbnail, actual name, brand/price and publication badge. Description, characteristics, images, variants and discounts fold into separate sections. Existing categories/homepage selection remain available. Reordering now has keyboard/mobile arrow controls as well as desktop dragging. No Phase 4 product feature expansion. |
| `/admin/galerie` | Responsive image cards with publication/selection controls, upload area, counts and gallery/homepage tabs. Advanced image actions fold away. Mobile uses two compact columns; opening an image editor gives it full width. Expanded cards do not stretch their neighbors. |
| `/admin/team` | Collapsed employee summaries show a photo, name, position and visibility. Open profiles group portrait, identity, experience, biography and specializations. New profiles start empty. |
| `/admin/bewertungen` | Responsive review cards, German moderation states, status filters, clear loading/empty/error states, dates and disabled busy actions. Review IDs are no longer shown as owner-facing explanatory text. |
| `/admin/gutschein` | Consistent description/visibility and value sections, clear empty state and the shared save workflow. Existing salon sales information and values retained. |
| `/admin/aktionen` | Separate tabs for announcements/promotions, collapsible editors, draft/active/planned/ended badges, grouped schedules, optional links and product exceptions. Existing discount rules and fields retained. |
| `/admin/einstellungen` | Five keyboard-accessible tabs: salon/brand, contact, hours, website and social media. Website wording groups into disclosures; genuine existing values remain editable. |
| `/admin/benutzer` | Clear account cards and German permission names, a collapsible invitation form, busy/save feedback, unsaved role-change warning and copyable credential handling. Own-account controls are disabled to match the server's existing self-protection. |
| `/admin/login` | Refined responsive sign-in presentation with labeled autofill fields, accessible recovery notices and the original bounded Phase 2 sign-in/session behavior. |

## Phase 3 — shared files

- New `v2/src/app/admin/admin.css`: scoped tokens and responsive admin styling. Admin layout imports it and wraps the unchanged session provider in `.admin-app`.
- New `v2/src/components/admin/ui.tsx`: `Icon`, `PageHeader`, `Badge`, `Notice`, `EmptyState`, `LoadingState`, `SaveBar`, accessible `Tabs`, and a cleaned-up client clock for scheduled counts.
- New `v2/src/components/admin/useUnsavedChanges.ts`: shared draft protection for content, services and account editors.
- Modified `AdminShell.tsx`, `editor-types.tsx`, `ContentEditor.tsx`, `Reorderable.tsx`, `ProductsEditor.tsx`, `GalleryEditor.tsx`, `TeamEditor.tsx`, `MarketingEditor.tsx`, `SettingsEditor.tsx` and upload presentation in `ImageUpload.tsx`.
- Modified admin overview, services, reviews, administrators, login, layout, loading and error presentation. Team/gallery/product/voucher/marketing/settings route wrappers keep using the common content editor.
- New test helpers `v2/tests/support/admin-browser.ts` and `admin-fixture.ts`; new `v2/tests/admin-ui.spec.ts`. The Phase 2 authentication spec now shares the same isolated fixture and opens the collapsible account menu before mobile logout; its authentication coverage is retained.
- `v2/package.json`: added `test:admin-ui`. No dependency/version or lockfile change in this phase. `PROJECT_STATUS.md` updated.

## Phase 3 — responsive issues resolved

- Replaced horizontally scrolling mobile admin navigation with a collapsible menu.
- Moved reorder controls outside editor form columns so narrow screens retain usable input widths; provided arrow alternatives to dragging.
- Applied minimum-width containment and responsive columns for long names, email addresses, selectors, schedules, service prices and expanded product forms.
- Reduced long settings/team/product/gallery forms through tabs and disclosures rather than removing fields.
- Kept mobile gallery editing at full width while its closed grid remains compact.
- Kept focus indicators, keyboard tab navigation and save/recovery controls usable at the tested widths, including a short 375×480 viewport that simulates reduced vertical space. This does not certify behavior with an actual mobile OS keyboard.

## Phase 3 — verification results

| Check | Final result | Scope |
| --- | --- | --- |
| `npm.cmd run typecheck` | PASS | Next route types and full active TypeScript scope, including new tests/helpers. |
| `npm.cmd run lint` | PASS | Full configured ESLint scope, zero errors or warnings. React hooks/purity/accessibility guidance applied. |
| `npm.cmd run build` | PASS | Next.js 16.4.1 local production build; 25/25 static pages plus dynamic routes compiled. |
| `npm.cmd test` | PASS, 26/26 | Existing content/image/pricing tests and Phase 2 auth/error tests. |
| `npm.cmd run test:admin-api` | PASS, 9/9 | Existing isolated route integration tests; database writes use a process-local Map. |
| Combined isolated browser suite | PASS, 26/26 | 14 new UI tests, 9 retained auth tests and 3 public services/QR tests. Installed headless Edge. |
| Preservation | PASS | 24 Phase 2/public/rules/QR file hashes match the start of Phase 3, including all API routes, server helpers, auth/session/provider/request code and public root pages/styles. The 13 original README/QR/test-file hash checks still match as well. |
| Working tree | PASS | Branch `development/golesta-v2`, HEAD `581b1c2`; `git diff --check` passes. No commit/push/deployment or data mutation. |

Browser command, from `v2/` with the compiled app running locally on port 3102:

```powershell
$env:GOLESTA_TEST_BASE_URL='http://127.0.0.1:3102'
$env:GOLESTA_TEST_BROWSER_CHANNEL='msedge'
node node_modules/@playwright/test/cli.js test tests/admin-ui.spec.ts tests/admin-auth.spec.ts tests/services.spec.ts --workers=1 --reporter=line
```

- The five responsive cases each visit all eleven admin pages at **375, 430, 768, 1280 and 1440px**. They check horizontal overflow, visible input bounds, navigation, Escape/focus return, expanded editors, tabs and keyboard selection. The dashboard fixture checks exact real-data-derived counts, including exclusion of future/expired announcements/promotions.
- Nine UI workflow cases cover: settings save/draft cancellation and preservation of unrelated data; empty new service fields and price preservation; product filtering and existing variant saves; review moderation and role actions; new empty employee profiles; gallery ordering/selection and cancelled removal; voucher values; new announcements and retention of schedules; and focused controls in a short mobile viewport.
- Auth regression cases continue to check direct protected access, login/reload/logout/re-login, denial without loops, loading deadline/retry, bad API responses, expired sessions and unavailable browser storage. Public services/QR regressions remain passing.
- Browser Firebase/API responses are intercepted; other external browser requests are blocked. All browser save/moderation/role changes update isolated in-memory fixtures. No real salon record or account was changed. Phase 2's live read checks were not reclassified as Phase 3 live authentication evidence.
- Screenshots for desktop/mobile dashboard, login, settings, products and gallery were generated under ignored `v2/test-results/` and representative images were visually inspected. They contain **isolated fixture data**, not a deployment or current production dashboard. Paths include `admin-dashboard-1440.png`, `admin-dashboard-375.png`, `admin-gallery-1440.png`, `admin-gallery-375.png` and `admin-login-1440.png`. Test runs may replace these generated artifacts.
- Initial UI-test failures came from selecting hidden duplicate product disclosures; selectors were limited to the visible editor. A render-time clock lint finding was corrected with a stateful clock. Final checks have no unresolved failures.
- Temporary local servers were stopped after verification. No Firebase/Cloudinary writes, security rule changes, analytics setup, new dependencies, paid services, commits, pushes or deployments occurred.

## Phase 3 — remaining visual / functional limits

- No reproducible clipping or horizontal overflow remains in the tested page/editor states at the requested widths. This is representative coverage, not proof for every possible long field, asset or browser extension.
- Physical iPhone Safari/Android, real software keyboards, screen-reader use, browser zoom and finger drag/drop remain manual release checks. Arrow sorting provides a tested alternative; only installed Chromium-based Edge was run here.
- Sign-in, persistence and authenticated saves in the browser suite are mocked. Real authenticated live writes, Cloudinary uploads, role revocation across devices and deployed Vercel behavior remain the Phase 2 limitations recorded above.
- Broader product/featured-selection functionality, public catalog availability, public sticky contact navigation and the remaining functional audits belong to Phase 4. Existing server/data contracts and discount behavior were retained rather than expanded here.
- No visitor analytics is connected or enabled. The dashboard's setup state shows no invented visitor numbers.

## Phase 4A — completed changes and fixes

### Shared public header and contact access

- Replaced separate page headers with one public frame/header/footer across the homepage, `/leistungen`, `/produkte` and the retained product-detail view. The existing team, gallery, contact and voucher sections remain on the homepage and use explicit cross-page anchors.
- The header sits in normal document flow and stays sticky at the top. It becomes slightly smaller after scrolling, uses subtle transitions and respects reduced motion. Announcement banners are outside the sticky header, so they scroll away without covering navigation. No banner space is reserved when none is active.
- Desktop navigation includes the configured telephone number and a WhatsApp button. Mobile/tablet keep 44px telephone, WhatsApp and menu controls visible, with accessible labels, expanded state, Escape dismissal and focus return.
- Phone and WhatsApp URLs use current application settings. Phone formatting is normalized for `tel:`; WhatsApp uses the configured digits. A shared content provider avoids separate page/header contact snapshots. Updates are fetched on window focus and every 60 seconds, matching the existing content refresh behavior.
- Added safe-area-aware header/content/footer spacing and `viewport-fit=cover` for public pages. Admin layout explicitly keeps `viewport-fit=auto` to preserve its previous viewport behavior; this metadata-only exception does not change the admin shell, provider, authorization or management features.
- Header measurement updates public anchor offsets, preventing section headings from disappearing beneath it. Voucher links disappear together with an unpublished voucher section, avoiding a dangling anchor. Added a shared footer with configured contact details and existing footer text.

### Public catalog paused centrally

- The release switch is **`PUBLIC_CATALOG_ENABLED = false` in `v2/src/lib/public-config.ts`**. This is the only catalog-release switch; no paid flag service or database setting was added.
- `/produkte` renders the requested heading and exact description: **Unsere Produkte – Bald verfügbar** / **Wir bereiten für Sie eine exklusive Auswahl hochwertiger Beauty- und Pflegeprodukte vor. Schauen Sie bald wieder vorbei!** It has responsive styling, meaningful metadata and links to services/contact, with no product search/results or fake product cards.
- Direct `/produkte/[slug]` URLs temporarily redirect to `/produkte` with HTTP 307 before any product lookup. This covers existing, unknown and bookmarked slugs without exposing unfinished detail pages.
- Homepage product cards are suppressed. The public content API projection removes catalog products, categories and promotions while paused. Public product-review GET/POST return JSON 404 before any database read/write; authenticated admin reviews remain independent and unchanged.
- The original catalog and detail UI are retained in `components/public/ProductCatalog.tsx` and `ProductDetail.tsx`, adapted only to the shared public frame/content provider. Admin editors, records and images were not removed. Pure projection tests prove the input document is unchanged and catalog output is restored when the switch is true.
- Reactivation means changing that single switch to `true` and performing a normal application build/deployment **after explicit authorization**. It requires no product-system rewrite or data migration. This is a source configuration switch, not a runtime dashboard toggle.

### Public quality and services

- Home and services now share one service-data provider. New read-only `GET /api/services` loads the existing `publicServices/current` document through the existing validation and read deadline. Both views refresh together; original prices are used only if the document/configuration is absent, and a failed request produces a clear stale/fallback notice. No service write or admin service behavior was changed.
- Preserved the Phase 1 accordion, case/whitespace-normalized search, category filters, result counts and reset behavior. Added service metadata and a clear homepage link to the full services page. Long names/prices wrap safely; the homepage has one visible responsive service display at a time.
- Replaced the public gallery's generic overlay with a native modal dialog: keyboard containment, focused close control, Escape/arrow handling, scroll lock, explicit focus return and safe-area controls. Images are identified by gallery ID instead of a potentially duplicated image URL. Explicit restoration fixed a reproduced focus-loss failure on close.
- Corrected the fixed Instagram handle text so a changed profile URL is no longer mislabeled with a stale hardcoded handle. Existing photography, team content, contact details, opening hours, voucher text/values and business prices are retained.
- Verified all 21 original local logo/team/gallery image paths exist. Browser checks load the requested images without failed image responses, exercise gallery expansion/collapse and inspect existing public anchors. No unrelated homepage redesign was introduced.
- Static QR `v2/public/links.html` remains unchanged and available. It is a standalone link hub outside the Next.js public frame; its QR behavior was regression-tested rather than replaced with duplicate app navigation. Repository-root legacy production files were not modified.
- Fixed a test-scope defect uncovered during verification: Playwright was also finding browser tests in the historical duplicate `v2/v2/` app. New `v2/playwright.config.ts` limits discovery to the active `v2/tests` directory and `.spec.ts` browser files; no historical files were deleted.

## Phase 4A — files changed

- Public frame/UI (new): `v2/src/components/public/PublicSite.tsx`, `PublicHeader.tsx`, `PublicFooter.tsx`, `public.css`, `ProductsComingSoon.tsx`, `GalleryLightbox.tsx`, and retained `ProductCatalog.tsx` / `ProductDetail.tsx`.
- Public helpers (new): `v2/src/lib/public-config.ts`, `public-content.ts`.
- Routes/layouts: `v2/src/app/layout.tsx`, `page.tsx`, `leistungen/page.tsx`, new `leistungen/layout.tsx`, `produkte/page.tsx`, `produkte/[slug]/page.tsx`.
- Public API: `v2/src/app/api/content/route.ts`, `api/reviews/route.ts` (catalog availability guard only), new `api/services/route.ts`.
- Shared services view: `v2/src/components/ServicesGrid.tsx`. The shared service model and existing admin store are unchanged.
- Admin exception: `v2/src/app/admin/layout.tsx` adds only viewport metadata to preserve the admin's previous safe-area behavior. Its provider and UI code are unchanged.
- Tests/config: new `v2/playwright.config.ts`, `tests/public.test.ts`, `public-routes.test.mts`, `public-site.spec.ts`, `support/public-browser.ts`; updated existing `tests/browser.spec.ts` for the requested Coming Soon state, isolated content, configurable local URL and a correct negative admin-control assertion; existing `services.spec.ts` now mocks the shared services endpoint. Previous test coverage is retained.
- `v2/package.json` adds public test commands and the public unit test. No dependency versions or lockfile changed. `PROJECT_STATUS.md` updated.

## Phase 4A — verification results

| Check | Final result | Evidence / scope |
| --- | --- | --- |
| `npm.cmd run typecheck` | PASS | Next route types and full active TypeScript scope, including new public components/config/tests. |
| `npm.cmd run lint` | PASS | Full configured ESLint scope; zero errors or warnings. |
| `npm.cmd run build` | PASS | Next.js 16.4.1, 26/26 static pages and compiled dynamic API/detail routes. Local build only. |
| `npm.cmd test` | PASS, 28/28 | Existing 26 regressions plus paused/re-enabled catalog projection, source immutability and configured contact-link tests. |
| `npm.cmd run test:public-api` | PASS, 4/4 | Actual public handlers with a mocked Firebase boundary: published products hidden without record mutation; stored service values and absent-document fallback; safe outage JSON; paused review routes return 404 with zero backend access. |
| `npm.cmd run test:admin-api` | PASS, 9/9 | Retained isolated authorization/content/product/service/moderation/role regression suite, using a process-local store. |
| Combined browser suite | PASS, 46/46 | 23 public/browser/services cases and 23 retained admin auth/UI cases. Installed headless Microsoft Edge. Final run excludes historical duplicate apps. |
| Assets / preservation | PASS | 21 expected local image files exist. 49 protected admin/auth/API/model/rules/QR/lockfile hashes match the start of Phase 4A. The remaining protected admin-layout file was verified byte-for-byte after removing only the added viewport import/comment/export. |
| Working tree | PASS | `development/golesta-v2`, HEAD `581b1c2`; `git diff --check` passes. Prior uncommitted work retained. |

Browser reproduction from `v2/`, after building and starting a local server on port 3102:

```powershell
$env:GOLESTA_TEST_BASE_URL='http://127.0.0.1:3102'
$env:GOLESTA_TEST_BROWSER_CHANNEL='msedge'
node node_modules/@playwright/test/cli.js test tests/public-site.spec.ts tests/services.spec.ts tests/browser.spec.ts tests/admin-auth.spec.ts tests/admin-ui.spec.ts --workers=1 --reporter=line
```

- Sticky/contact cases cover **320, 375, 430, 768, 1024, 1280 and 1440px**, each with and without an active announcement, on `/`, `/leistungen` and `/produkte`. They verify one shared header, sticky position, smaller scrolled height, desktop numeric phone/nav visibility, mobile 44px controls/menu/Escape, no horizontal overflow, Coming Soon metadata and direct-detail redirection. Expired banners stay hidden.
- Focused public cases verify same-page anchors clear the header; settings updates change phone/WhatsApp/footer links; hiding vouchers removes dead anchors; gallery keyboard/focus/expansion behavior; current API service data overrides initial fallback in both homepage and searchable services views; original prices remain exact; and failed service loads show a notice.
- HTTP assertions verify direct detail routes return 307, the Coming Soon page contains the requested server-rendered text, and admin metadata keeps `viewport-fit=auto`. Actual unauthenticated admin endpoints still return JSON 401.
- Browser API/auth responses are mocked; unknown external browser requests are blocked. Synthetic catalog records and updated contact numbers exist only in isolated fixtures. Tests never call the salon or send WhatsApp messages. All admin save/moderation/role operations in the UI regression suite remain in memory.
- Representative desktop/mobile Coming Soon screenshots were generated and visually inspected under ignored `v2/test-results/public-coming-soon-1440.png` and `public-coming-soon-375.png`. They are local test artifacts, not deployed pages. Later test runs may replace them.
- Initial test-only expectation errors (changing menu accessible name and existing public social normalization) were corrected. The gallery focus-return failure was a reproduced UI defect and fixed. An earlier 48-case run passed all 46 active cases but failed two historical duplicate-app cases due to their missing browser binary; discovery is now restricted and the final **46/46** run passes. No browser download or backup deletion was needed.
- No unresolved failures remain in the executed checks. Temporary local servers were stopped after testing. No commits, tags, pushes, deployments, production configuration changes, security-rule changes or real data writes occurred.

## Phase 4A — limits

- Sticky/safe-area behavior is implemented and viewport metadata/CSS reviewed; physical iPhone Safari, Android Chrome, real OS keyboards, screen readers and mobile browser chrome were not run. Edge viewport coverage is not real-device certification.
- No live authenticated save, Cloudinary upload, account mutation, production Vercel API or deployment check was performed. Earlier Phase 2 live read results remain historical evidence only. Integration/credential/runtime limitations from Phase 2 still apply.
- The catalog's enabled UI was retained and typechecked; reactivation projection is unit-tested. A full enabled-catalog release flow must be verified in an isolated environment before reactivation. Do not enable it on production as a test.
- No production Core Web Vitals/CLS score is claimed. Image dimensions/header flow are explicit, but asynchronously refreshed business content/banners can still change page height; deployed performance remains a Phase 5 measurement.
- The shared header covers the public Next.js application; the preserved standalone QR link hub and repository-root legacy static production pages retain their existing layout.
- No Phase 4B management feature work or Phase 5 release/security audit was started.

## Phase 4B-1 — product and gallery implementation

- Product discovery is paginated (15 entries per page), with name/brand search, category/publication filters, thumbnails and draft/published badges. Only the selected product form mounts. Selecting another product closes the previous editor; new products clear filters, open immediately, start with blank names and update their collapsed heading as soon as named.
- Categories use a compact expandable list, one open category editor, drag ordering and optional keyboard/touch arrow controls. Occupied categories cannot be deleted. Empty-category deletion requires confirmation. New names are placeholders, not instructional saved values.
- Product fields retain descriptions, characteristics, ingredients, prices, text variants, publication, discounts, review settings and existing image URLs. German explanations distinguish descriptive characteristics from purchasable variants. New/changed variant lists require a nonblank size/name; text such as `1 Liter` and `Größe M` remains valid.
- Added optional product-level `available?: boolean`. Missing means “Keine Angabe”; explicit true/false needs no stock quantity and does not alter promotional exclusions. An availability hint is prepared in the retained product detail component, which remains inaccessible while the public catalog is paused.
- German product names generate collision-safe slugs automatically where appropriate. Existing/custom links survive renaming. New products do not keep a repeated “Neues Produkt” title after naming.
- Dedicated “Produkte auf der Startseite” management shows every selected product together, thumbnails, count and the actual existing homepage limit of three. It supports eligible additions, removal and independent ordering through optional `featuredOrder?: number`. The retained homepage consumer now uses this order. Published products require published categories to be newly selected.
- Product/category unpublishing asks for confirmation when removing affected homepage selections. Legacy invalid/over-limit selections are shown with a recovery warning and remain stored on unrelated saves; there is no silent trimming/migration. Client and actual authenticated content PUT both validate changed selections. Existing server authorization and optimistic revision conflict protection remain intact.
- Gallery lists are paginated at 24 images, with separate full-gallery/homepage views, selected badges, counts and the configured public display limit. Selected legacy drafts remain identifiable/removable and stay publicly hidden; new homepage selections require publication. Drag/order controls and explicit position forms allow movement across pages without deleting items. Image removal requires confirmation.
- Shared compact sorting hides arrow stacks until requested. Keyboard/touch alternatives remain available, with 44px mobile targets. Product/category/gallery position forms support arbitrary destinations; the selected product stays open after cross-page moves.
- Multi-upload validates count/type/size, reports progress, preserves selection order and retains successful files after a later failure. Existing URLs remain unchanged. Content saves and editing are blocked until uploads settle; navigation retains the unsaved-change guard. Partial results clearly request saving.
- Inspected the existing authenticated Cloudinary handler: it validates/decodes bytes using Sharp, applies EXIF rotation, strips metadata, bounds dimensions to 1800px, emits WebP and uses unique IDs with `overwrite:false`. Originals over 4 MB are reduced in compatible browsers before this server validation; unsupported browsers receive a smaller-file recovery message. No remote deletion was added or called.
- Product cover selection is explicit and immediately marked “Titelbild”; first-image ordering, previews, move/removal controls and responsive Next Image delivery remain intact. Save failures and validation retain the draft; negative prices receive a clear German range/optional-price explanation.
- `PUBLIC_CATALOG_ENABLED=false` is unchanged. Coming Soon, direct product redirects, public API projection, sticky contacts, QR hub, authentication/security rules, business content and all preceding work are preserved. No dependency versions or lockfile were changed in this phase.

## Phase 4B-1 — defects fixed

The previous product list mounted hidden forms for every listed item and allowed several editors to expand, making large collections difficult to navigate. Homepage selection was scattered among individual product checkboxes and lacked its own persistent order/limit checks. Product-level availability was absent. Sorting controls were always displayed, gallery navigation was unbounded, gallery upload insertion reversed selection order, and a save could begin before uploads finished. These are addressed above. New variants could be saved without any size/name; changed variant lists now require one. Image/category removals have appropriate confirmation or reference protection.

## Phase 4B-1 — files changed

All paths below are relative to `v2/`, except the root status file. These are changes for this phase on top of the already uncommitted preceding phases.

- Data/business rules: `src/lib/content.ts`, new `src/lib/product-management.ts`, `src/app/api/admin/content/route.ts`.
- Product UI: `src/components/admin/ProductsEditor.tsx`, new `ProductForm.tsx` and `FeaturedProducts.tsx` in that directory.
- Gallery/shared editor UI: `src/components/admin/GalleryEditor.tsx`, `ImageUpload.tsx`, `ContentEditor.tsx`, `Reorderable.tsx`, `ui.tsx`, new `UploadActivity.tsx` and `OrderPosition.tsx`; `src/app/admin/admin.css`.
- Retained public consumers: `src/app/page.tsx`, `src/components/public/ProductDetail.tsx`. The public flag, public projection and public routes themselves remain unchanged.
- Test scripts: `package.json` (existing unit/admin API commands extended; dependencies unchanged).
- Tests: new `tests/product-management.test.ts`, `tests/upload-route.test.mts`, `tests/products-gallery.spec.ts`; expanded `tests/image.test.ts`, `tests/admin-routes.test.mts`, `tests/admin-ui.spec.ts`, `tests/support/admin-browser.ts`, `tests/support/admin-fixture.ts`.
- Handoff: root `PROJECT_STATUS.md`.

## Phase 4B-1 — verification

- `npm.cmd run typecheck`: PASS (Next route type generation and TypeScript).
- `npm.cmd run lint`: PASS (full active ESLint scope).
- `npm.cmd run build`: PASS against final application source; all 26 static pages generated. Existing build-time Google Fonts access was permitted; nothing was deployed.
- `npm.cmd test`: **33/33 PASS**, including schema/backward compatibility, availability/text variants, German/collision-safe slugs, independent featured ordering/eligibility/limit, unchanged legacy selections, blank variants, metadata removal and real EXIF rotation.
- `npm.cmd run test:admin-api`: **15/15 PASS** (12 real admin-handler tests plus three real upload-handler tests). Firebase and Cloudinary remote boundaries are mocked; writes/quotas exist only in process memory. Real Sharp processing is exercised through the upload handler. Tests verify 401/400/413/429/502 responses, safe upstream errors and non-overwriting upload options.
- `npm.cmd run test:public-api`: **4/4 PASS**, including paused product/review boundaries and unchanged service prices.
- Final complete browser suite: **63/63 PASS** against the final production build in installed headless Edge (17 new product/gallery cases plus 46 existing authentication/admin/public regressions; one worker, no retries). Earlier full runs passed 61/61 before the final two cases, then 62/63 with a test-only drag-handle locator failure; after correcting that locator, the final complete 63-case run passed in 1.2 minutes. No unresolved failures remain in the executed checks.
- Browser fixtures authenticate/save/upload entirely in isolation. Unknown external browser requests are blocked. Remote image-optimizer previews are fulfilled with a local image to prevent indirect Cloudinary requests. Synthetic uploads never leave the local test process.
- New browser cases cover a 45-product/60-photo collection, name/brand/category/status discovery, one mounted form, blank new fields/custom links, text variants, availability unset/false/true/unset, invalid input, non-JSON failed save and retry, category deletion protection, explicit cover/order/removal, featured choices/order/limit, gallery tabs/order/deletion, pending/partial uploads and browser-side large-original WebP compression. Native desktop drag and arbitrary product cross-page movement are also tested.
- New viewport checks cover 375, 430, 768, 1280 and 1440px with expanded product/gallery controls; prior public tests still cover 320–1440px and active/inactive banners. Mobile product/gallery screenshots generated by the regression suite were visually inspected in ignored `test-results/`.
- Initial browser attempts found test-only selector failures involving Next's route announcer, removal from a filtered list, and the nested drag-handle wrapper. Those locators were corrected; the drag case passed separately. No functionality was weakened to satisfy tests.
- `git diff --check`: PASS; Git only reported existing Windows LF/CRLF conversion notices. Hash comparison confirms protected Phase 4A/auth/security/QR/lockfile sources unchanged except the two intentional content-PUT/detail-consumer changes listed above.

## Phase 4B-1 — limitations and recoverable checkpoint

- No live authenticated Firebase save, real Cloudinary upload/deletion, production API validation, Vercel runtime check or deployment occurred. A local build and mocked tests do not prove those integrations work. No real business records/assets were edited.
- Existing environment files were not printed or modified. Synthetic upload credentials in the isolated test process are not real credentials. Earlier Phase 2 live read evidence remains historical only.
- Physical Safari/iPhone/Android, real screen readers, native photo-picker behavior and mobile EXIF/browser-decoder differences remain unverified. Edge viewport checks and synthetic JPEG compression are not real-device certification. Large originals require browser bitmap support; users otherwise receive the documented smaller-image recovery message.
- Product limit remains 500 and gallery limit 200 under the existing single-document model; pagination bounds visible editors, but no server-side collection migration or performance claim at production scale is made.
- Reopening the catalog still requires an explicit instruction and isolated enabled-catalog integration verification. The public catalog, homepage product cards and product reviews remain paused.
- This is an uncommitted local working-tree checkpoint on `development/golesta-v2`, HEAD `581b1c2`. Preserve all tracked/untracked work and backups. No branch, commit, tag, push, release or deployment was created. No Phase 4B-2 or Phase 5 implementation was started.
- The temporary local production server was stopped after verification.

## Phase 4B-2 — completed local administration work

- **Team:** verified blank new member fields, actual names in headers, position/experience/biography, blank specialization inputs with genuine placeholders, image upload/preview, publication, reordering, save/reload and mobile layouts. The example-text defect was already fixed in earlier code; regression tests now prove no manual deletion is needed. Added compact on-demand sorting controls and a specific empty-specialization recovery message. Existing people/photos are preserved.
- **Announcements:** changed schedules now reject an end at/before the start; publication needs a message and optional links need both address and label. Validation runs in the editor and actual authenticated content PUT. Unchanged legacy entries are not silently rewritten. Administrative date guidance states the device time zone; Vienna winter dates/UTC round-trip and offset boundaries are tested. Invalid periods fail closed in the shared active-period helper. Closure/holiday labels are clearer. The existing gold banner already provides prominent, premium presentation; its optional link now has a 44px touch target. Timed browser tests confirm automatic activation/expiration, no residual empty banner and no sticky-header overlap.
- **Promotions:** replaced difficult category/exclusion checkbox walls with bounded, searchable selection lists, selected counts, an optional selected-only view and pagination (12 choices per page). Missing historical references remain explicit/removable rather than being discarded. Copy clearly states all-category behavior, selected-category scope, product exceptions, independence from availability and the lowest valid non-stacking price. The editor shows the number of products in scope. Active changed offers require a name and positive discount; excessive percentages receive natural German validation. Existing schedules, global/category offers, product-specific discounts and price data remain intact.
- **Reviews:** recent-only loading previously hid pending reviews older than the latest 200. The authenticated GET now merges up to 200 recent records with a separate queue batch of up to 200 pending records and returns aggregate counts over all pending/approved/rejected records. Dashboard and moderation consume the same complete pending count; larger queues show a notice and replenish after moderation. Pending status is never published publicly. After a successful moderation PATCH, the UI preserves that saved decision/count even if the following reload fails, with explicit recovery text instead of implying the decision failed.
- **Public review safety:** in an isolated enabled-catalog process, verified same-origin checks, schema validation, honeypot behavior, daily three-review quota and pending-only submission. GET now checks product/category publication and review eligibility before returning approved records; approved filtering occurs in the query and again before the response. Oversized submission bodies retain HTTP 413 rather than being collapsed into 400. The application catalog/review release flag remains false; no live endpoint was enabled.
- **Settings:** changed the Instagram label to `Instagram`. Verified logo upload/preview, phone/WhatsApp, address/maps, hours, social profiles, save/reload and public rendering using synthetic values. Sticky header contacts follow saved settings; visible social profiles require a name/link. No salon contact values or genuine configuration were overwritten.
- **Accounts:** ordinary administrators/editors still cannot manage accounts or grant roles. Self-modification remains forbidden. POST/PATCH recheck the acting active salon lead inside the Firestore transaction, preventing stale authority from mutating another account. Existing account entries cannot be implicitly overwritten through “add”; explicit list edits are required (409 otherwise). Disabled existing Auth accounts cannot be implicitly reactivated. Metadata is preserved.
- **Account UI:** saving one row no longer refetches/replaces the whole form and discards another account's draft. Failed saves retain edits. Adding an account is blocked while existing account edits remain unsaved; email drafts and visible one-time credentials join the navigation-loss guard. Deactivation/demotion requires confirmation. Newly created Auth accounts retain the existing random start-password flow; credentials can be shown/copied/hidden. If account creation succeeds but listing refresh fails, the UI explains partial success and retains credentials. Copy states that no invitation email is sent automatically.
- **Gift vouchers:** inspected active code and the original static site's workflow. Both describe buying in the salon; no external voucher form/payment integration is configured. Preserved description/values/publication and existing navigation. Added “Zum Gutscheinkauf anrufen” using the current configured telephone, without inventing payment or third-party flows. Voucher value/publication validation and failed-save/reload behavior are covered.
- **Services:** added name/price search within the selected service category and a clear no-results state. Category choice remains the filter; new services clear search and stay editable. Sorting uses the existing compact accessible pattern and correct source indices while filtered. Original price strings and category/service storage remain unchanged. The current service model has no publication toggle; none was invented.
- **Preservation:** no dependency/version/lockfile changes, schema migrations, business-data edits, security-rule changes, remote asset deletion or deployment. Hash comparison against the start of this phase confirms Phase 4B-1 product/gallery/upload components and data/model helpers, public header/frame/footer/catalog boundaries, base content/price data and authentication/session implementation remain unchanged.

## Phase 4B-2 — discovered defects and fixes

1. Reversed announcement schedules, blank published messages and incomplete optional links could be saved: validate changed entries client/server, preserve unchanged legacy data, and fail closed on malformed active periods.
2. Large promotion/category/exclusion lists were difficult to discover or interpret: searchable paginated controls, explicit selection/scope counts and availability-independent wording.
3. Review queries silently omitted old pending records and counts covered only the loaded batch: separate pending queue plus aggregate counts, shared dashboard contract and replenishment notice.
4. A moderation decision could commit but appear failed when its follow-up read failed: preserve the confirmed local decision and distinguish reload failure.
5. Saving one administrator discarded edits to other administrators: save only the selected row's snapshot; keep remaining drafts.
6. “Add account” could overwrite an existing administrator or present a disabled Auth account as newly usable: explicit 409 recovery, with normal changes handled in the list.
7. Account mutations relied only on the earlier authorization read: recheck the acting salon lead transactionally alongside target updates; retain self-lockout protection.
8. Credential/email drafts and partial success lacked adequate recovery: guarded navigation, confirmation for access restriction and explicit account-created/list-not-refreshed feedback.
9. Enabled public review reads did not verify product/category eligibility and body-size errors lost their status: enforce publication/review eligibility and preserve 413.
10. Service administration lacked discovery within a category: scoped name/price search without changing prices or data shape.

## Phase 4B-2 — files changed

Paths are relative to `v2/` unless stated otherwise; all changes build on the already uncommitted prior phases.

- New shared administration rules: `src/lib/administration.ts`; updated `src/lib/pricing.ts` and `src/lib/admin-api.ts`.
- Shared/editor UI: new `src/components/admin/ChoiceList.tsx`; updated `ContentEditor.tsx`, `TeamEditor.tsx`, `MarketingEditor.tsx`, `SettingsEditor.tsx` in that directory.
- Admin pages: `src/app/admin/page.tsx`, `benutzer/page.tsx`, `bewertungen/page.tsx`, `leistungen/page.tsx`.
- Routes: `src/app/api/admin/content/route.ts`, `admin/users/route.ts`, `admin/reviews/route.ts`, `src/app/api/reviews/route.ts`.
- Public consumers: `src/app/page.tsx`, `src/components/AnnouncementBanner.tsx`.
- Tests: new `tests/administration.test.ts`, `tests/administration.spec.ts`, `tests/review-submission.test.mts`; extended `tests/admin-routes.test.mts`, `tests/support/admin-fixture.ts`, `tests/support/public-browser.ts`.
- `package.json` extends the existing unit/public API test commands; dependencies are unchanged.
- Root `PROJECT_STATUS.md`.

## Phase 4B-2 — tests executed and results

- `npm.cmd run typecheck`: PASS. Next type generation and all active TypeScript source/tests checked.
- `npm.cmd run lint`: PASS. Full active ESLint scope.
- `npm.cmd run build`: PASS against final application source; all 26 static pages generated. Existing Google Fonts build requests were permitted. This is local compilation, not production API verification.
- `npm.cmd test`: **37/37 PASS**, including four new administration tests for changed/legacy announcements, date offsets/activation/expiration, category/global/product discounts, fixed/percentage/variant prices, exclusions, optional availability independence and voucher/social validation.
- `npm.cmd run test:admin-api`: **22/22 PASS**, including actual route handlers with process-local Firebase/Auth/Cloudinary mocks. New cases exercise old pending reviews beyond the recent batch, full counts after moderation, forbidden role grants, self protection, existing-account conflict, metadata retention, stale-actor rejection, existing/new account creation and disabled-account handling. Real Sharp upload tests remain passing.
- `npm.cmd run test:public-api`: **7/7 PASS**. Four paused public-route tests retain the real false release flag; three new review tests enable it only through a Node module mock in a separate process, then verify origin/honeypot/schema/quota/pending-only submission/approved-only reads and unpublished product/category denial. No credential files or real databases are loaded by these tests.
- Complete active browser suite: **84/84 PASS** against the final production build, installed headless Edge, one worker, zero retries, 1.5 minutes. This includes all 63 prior regression cases plus 21 new administration cases.
- New browser coverage proves team specializations/photo/order/save/reload, invalid inputs/upload failure retention, announcement dates/links/removal/UTC reload, automatic public activation/expiration without header overlap, promotion scopes/exclusions and failed saves, approve/reject and dashboard counts, committed moderation with failed reload, public settings/logo/contacts/maps/socials/hours, multiple account drafts, creation/one-time credentials/deactivation confirmation, restricted direct URLs, voucher save/navigation and service search/order/original prices.
- New responsive cases cover **375, 430, 768, 1280 and 1440px**; timed public banners run at 375/1440. Existing public cases still cover 320–1440px with active/inactive announcements. Mobile promotion controls and desktop banner screenshots under ignored `v2/test-results/` were visually inspected.
- Initial focused browser run: 20/21 passed; the remaining failure was a test selector matching date inputs in closed announcements. It was scoped to the newly edited first announcement. The final complete 84-case run passes without weakening UI assertions or authorization.
- Browser saves/uploads/account changes are in-memory fixtures. Unknown external browser requests are blocked; remote Next Image optimizer URLs are fulfilled with a local image to prevent indirect external image fetches. Public render tests consume the saved synthetic content. No phone call, WhatsApp message, email or real account action is performed.
- `git -c core.safecrlf=false diff --check`: PASS. Local production server stopped after testing.

## Phase 4B-2 — limits, outstanding issues and checkpoint

- **No unresolved failures in executed local checks.** All requested remaining administration areas were inspected and covered locally. Phase 5 has not started.
- Live authenticated Firebase saves, actual Firestore aggregate queries/transactions under concurrency, real Auth account creation/deactivation, Cloudinary uploads, deployed Vercel runtime behavior and real email/recovery services remain unverified. Mocked tests and a successful build do not establish production reliability.
- Account creation spans Firebase Auth and Firestore, which are separate services. No cross-service atomicity or live partial-failure recovery is claimed. In an authorized isolated integration environment, verify a failed role-document write/list refresh and the existing-account/password-recovery procedure; never delete/recreate real accounts as a test. There is no automatic invitation email, forced first-login password change or new password-reset workflow in this phase.
- Review aggregate counts cover all statuses, while loaded detail records remain bounded: up to 200 recent plus 200 pending, deduplicated. Pending queues replenish after actions; older moderated history beyond that recent window is not a full paginated archive. Counts are a read-time snapshot, not a live push subscription. Review notifications are the dashboard count/notice; no outbound email notification provider is configured.
- No voucher form/payment provider exists in current configuration; external form success/error handling therefore cannot be live-verified. The preserved workflow is salon purchase plus contact/navigation.
- Real iPhone Safari/Android, native photo picker/clipboard behavior, screen readers and mobile browser chrome remain unverified. Edge viewport screenshots are not physical-device certification. Clipboard failures retain the existing manual-copy recovery.
- Dates are entered in the administrator device's local time and stored as ISO instants. Vienna winter offset/boundaries are automated; actual device/DST-gap behavior remains a Phase 5 check. Existing unchanged legacy announcement/offer values are preserved and can require deliberate cleanup before edits are published.
- The public product catalog/homepage product cards/reviews remain paused with `PUBLIC_CATALOG_ENABLED=false`. No enabled-catalog public browser release flow or production pricing change occurred.
- Permanent branch: `development/golesta-v2`; HEAD remains `581b1c2`. The recoverable checkpoint is the full uncommitted working tree, including tracked/untracked prior-phase work. No branch/commit/tag/push/deployment, production configuration change or business-data write was made. Preserve backups and the QR hub.

## Phase 5A — interrupted execution reconciled and completed

This section preserves the original Phase 5A snapshot before the focused blocker follow-up. Current dependency counts, configuration evidence and next steps appear in “Phase 5A — focused blocker review” below and `v2/release/BLOCKER_REVIEW.md`.

The interruption occurred after real Phase 5A work, not before its start. This file still reported 4B-2, but source modifications, `v2/release/` reports, build artifacts, manifest hashes and Playwright's passed last-run artifact were already present. Recovery verified these against the actual earlier tool results. No application files differed from the manifest at recovery. The remaining work was durable reporting, staging-plan completion, readiness assessment and stopping the local server; completed build/test suites were not unnecessarily repeated.

### Development summary and final review

Phases 1–4B-2 remain intact: bounded authentication and server authorization; shared public sticky contacts and paused catalog; searchable services; compact product/category/variant/availability/image/featured management; paginated gallery; team/announcements/promotions/reviews/settings/accounts/vouchers; safe saving/error recovery. The full active application/config/test tree was reviewed using source inspection, import/type/lint/build checks, API/browser regressions and secret/dependency checks. Retained ProductCatalog/ProductDetail components are intentional behind the false release switch, not accidentally exposed duplicate pages.

No business services/prices, original data files, images, team/product/gallery/review records, contacts or QR content were overwritten. Git reports no content diff for original data/assets/QR files; two existing whitespace/status-only public text/QR paths are held from the release allowlist. Backups and duplicate applications remain on disk. No unrelated redesign or dependency version change was made.

### Reproduced bugs fixed and security hardening

1. Renaming a product found through search removed its open editor because the updated name no longer matched. The selected product now remains visible while editing; explicit search/category/status changes clear that selection. A browser regression reproduces the old failure and proves the fixed save behavior.
2. Manually typing a hyphen in a product link immediately removed it. Intermediate trailing separators now remain while typing; final slug schema validation still applies. The keyboard regression failed on the earlier build and passed after the fix.
3. Review Origin validation compared only hosts and could throw 500 for malformed input. It now requires the full serialized origin, rejects malformed/cross-scheme/foreign origins as 403 and performs no backend access for those requests. Enabled-review tests use a process-local flag mock only.
4. Added response protections for framing, MIME sniffing and referrers: CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'self'`, X-Frame-Options DENY, nosniff and strict-origin-when-cross-origin. Browser HTTP checks cover public/admin/static/API responses. This limited CSP is not a comprehensive script-source XSS policy.
5. Extended root ignore rules to cover additional service-account/credential filename variants, key stores, capitalized backup directories and backup archives. No backup/secret file was deleted or force-added.

### Security findings

- Admin APIs verify bearer tokens with revocation checks, require active administrator records and enforce server roles. Editor restrictions, self-account protection and transactional acting-lead checks remain intact. Firestore/Storage rules deny direct writes; only own-admin lookup and the intended public service get are allowed.
- Strict schemas, bounded payloads, revision/timestamp conflicts, safe errors, client/read/auth deadlines, React escaping and URL/image restrictions remain active. Stored markup is tested as literal text. Private environment/repository/backup HTTP paths return 404; anonymous admin API responses remain no-store JSON 401.
- Uploads require authorization, enforce 4 MiB/25-megapixel decoding limits, rotate/strip metadata/resize to 1800px/WebP, use non-overwriting IDs and a 60-per-admin/hour quota. Review anti-spam/origin/schema/pending-approval controls and the three-per-IP/day quota remain in place while the public catalog is paused. Deployed proxy/IP behavior remains unverified.
- `SECURITY_SCAN.json` records zero known-private-value/credential-pattern findings in the current index plus tracked/unignored files and final client/static output (119 built files). All eight discovered environment files, including backup copies, are ignored. Local expected keys are present, the private key parses and local public/server Firebase project IDs match; these are configuration checks, not live integration evidence.
- The scan never prints secret values, does not claim exhaustive detection of unknown secrets and does not audit every Git-history commit or prove remote credential rotation. Forced staging bypasses ignore rules and remains prohibited.
- **Unresolved dependency findings:** all-dependency npm audit exits 1 with **34 affected-package findings: 7 high, 27 moderate, 0 critical**. Omit-dev exits 1 with **13: 5 high, 8 moderate, 0 critical**. Counts include propagated parents, not distinct independent exploits. Full package/range/advisory evidence is in `DEPENDENCY_AUDIT.json`.
- The gRPC advisory has specific server TLS/`getAuthContext` conditions; this app defines no gRPC server/use of that method, so an exploitable application path was not demonstrated. The older gRPC copy belongs to Firebase's Node tree; Admin's google-gax resolves a newer copy. RE2JS/UUID and tooling chains also require triage. See the primary-source links and precise versions in `PREVIEW_READINESS.md`. No blind `npm audit fix --force`, major upgrade, downgrade or override was applied.
- **Rules execution remains blocked:** the demo-only command was attempted but stopped before tests with `spawn java ENOENT`. Static rule review is not a passing emulator test. No live rules deployment or database write was used as a substitute.

### Files changed in Phase 5A

- `.gitignore`; `v2/next.config.ts`; `v2/src/app/api/reviews/route.ts`.
- `v2/src/components/admin/ProductsEditor.tsx`, `ProductForm.tsx`.
- `v2/tests/products-gallery.spec.ts`, `review-submission.test.mts`; new `v2/tests/security.spec.ts`.
- New `v2/scripts/audit-release.mjs` and durable `v2/release/SECURITY_SCAN.json`, `DEPENDENCY_AUDIT.json`, `STAGING_PLAN.json`, `VERIFICATION_RESULTS.json`, `PREVIEW_READINESS.md`.
- Root `PROJECT_STATUS.md`. All preceding tracked/untracked work is preserved. Application dependency versions and lockfile were not changed by 5A.

### Tests executed and results

The following are actual results from the interrupted Phase 5A run, recovered and recorded without repeating the completed suites:

| Check | Result |
| --- | --- |
| TypeScript / Next type generation | PASS |
| Full active ESLint | PASS |
| Production build | PASS; 26 static pages; final application source |
| Unit tests | **37/37 PASS** |
| Admin/upload handler tests | **22/22 PASS** |
| Public handler/review tests | **7/7 PASS** |
| Complete browser suite | **89/89 PASS**, headless installed Edge, one worker, zero retries, 1.6 minutes |
| Secret/ignore/build-output scan | PASS; zero matching secret findings; all eight environment files protected |
| Git diff whitespace check | PASS |
| Demo Firestore/Storage rules command | **BLOCKED before tests**; Java unavailable |
| npm audit, all / omit-dev | **Unresolved findings**, exit 1; 34 / 13 affected packages |

The two new product regressions initially failed against the prior compiled checkpoint, confirming real defects; both pass in the final 89-case suite. Three additional browser security cases check headers, private paths and escaped content. No tests were hidden. Public viewport checks span 320–1440px; admin checks include 375/430/768/1280/1440px. All prior public/admin/product/gallery/QR cases remain passing.

Build artifact timestamp: `2026-11-07T18:11:36.018Z`; passed browser artifact: `2026-11-07T18:14:47.388Z`. `VERIFICATION_RESULTS.json` preserves commands/counts/failures/limits for the next session. The recovered manifest matched source before documentation completion. Regenerating reports/checksums after documentation does not rerun application tests or remote audits.

### Preview readiness — read-only checks

**Assessment: BLOCKED for Preview release approval**, despite passing local application checks. Release gates are unresolved dependency triage, missing emulator execution, unverified Vercel Git/root settings and confirmation that any future integration tests use isolated resources. This is an audit result, not a claim of an observed production exploit or failed local build.

The connected Vercel API confirms `golesta-beauty` exists with Next.js, Node 24.x and SSO protection. `golesta-beauty-web` exists separately and was untouched. Project metadata lists all 12 expected keys targeted to Preview; the branch-specific query returned no overrides, while shared Preview keys remain applicable. Values were not decrypted, printed, pulled or changed. Git linkage, production branch and root directory are not exposed by the connector response and remain unverified. An existing older READY deployment does not prove this checkpoint works remotely.

Required Preview settings: repository `reza-noorzad/golesta-beauty`; source branch `development/golesta-v2`; root `v2`; Next.js framework; Node 24.x compatible with `>=24.12.0 <25`; npm lockfile install/build and default Next output. Local origin matches the intended repository. Do not change either project's Production branch or other settings without the specific later authorization. The required environment names/types, Node/Next/Admin/jwks-rsa/jose evidence and primary documentation links are recorded in `v2/release/PREVIEW_READINESS.md`.

### Safe Git staging plan and preserved checkpoint

`v2/release/STAGING_PLAN.json` is the explicit file-by-file allowlist with application/config, tests, scripts and documentation groups and SHA-256 checksums. Historical README/version/test/checksum documents plus existing whitespace-only QR/test-text status changes are held separately for review. Ignored backups, duplicate apps, reference/source exports, environments/credentials, dependencies/builds/artifacts/logs are excluded.

**No files were staged; the index remains unchanged.** Do not use `git add .`, force-add ignored files or upload the whole local working tree. A later authorized commit must review the exact allowlist and staged diff first. Source hashes must be refreshed after deliberate edits; the manifest is preparation, not permission to commit/push/deploy.

Permanent branch remains `development/golesta-v2`; HEAD `581b1c2`; full uncommitted working tree is the recoverable checkpoint. The local server was stopped after verification/recovery. No branch, commit, tag, push, deployment, production setting/data mutation or Phase 5B work occurred.

### Unverified integrations and remaining limitations

- Firebase: no new live authenticated save, Auth account mutation, aggregate/count/concurrency check, security-rule execution or account partial-failure/password-recovery integration. Earlier historical live reads are not new proof. Auth + Firestore account creation is not cross-service atomic.
- Cloudinary: no real upload/delete, live credential/account/folder verification or device-photo processing. Sharp and remote-boundary mocks passed; no remote asset was deleted.
- Vercel: no new deployment, deployed API/ESM/runtime inspection, root/Git-link confirmation or remote credential-value validation. All current serverless compatibility conclusions are local or metadata-only.
- Devices/accessibility/performance: physical iPhone Safari/Android, actual screen readers/native pickers/clipboard/DST-gap behavior and production Core Web Vitals remain unverified. Edge viewport and keyboard checks do not certify devices or full WCAG compliance.
- Review history remains bounded (recent + pending batches) with complete aggregate counts, not a full paginated archive/live push subscription. No automatic invitation/review emails, forced first-login password change or new payment/voucher integration was introduced.
- Public catalog/cards/reviews remain paused with `PUBLIC_CATALOG_ENABLED=false`. Enabled public release testing was not performed against a deployed site.

## Phase 5A — focused blocker review

The requested three blockers were rechecked. Full reasoning, advisory links, Windows installation instructions and owner checks are in `v2/release/BLOCKER_REVIEW.md`. All remaining package/version/severity/scope entries are in `DEPENDENCY_TRIAGE.json`; redacted resource evidence is in `RESOURCE_ISOLATION.json`.

### Dependency findings and fixes

- Fresh all/omit-dev audits ran before and after changes. **All findings: 34 → 31 (7 → 5 high; 27 → 26 moderate). Production-tree findings: 13 → 12 (5 → 4 high; 8 moderate). No critical findings.** Counts include propagated parents, not distinct independent exploits. Both audit commands still exit 1 for unresolved advisories.
- Four leaf lock entries changed: **re2js 2.8.6 → 2.8.7** (runtime Firebase client transitive, existing ^2.8.3); **body-parser 1.20.8 → 1.20.9** and **2.3.0 → 2.4.0** (development Firebase CLI/Express); **fast-uri 3.1.8 → 3.1.9** (development Firebase CLI/AJV). Actual installed versions now match the patched lockfile.
- Next.js, React, Firebase client, Firebase Admin, Firebase CLI, jwks-rsa/jose and package.json remain unchanged. RE2JS's Node >=20 minimum fits existing Node 24. No forced fix, major upgrade/downgrade, override or new direct dependency was applied. A temporary broader RE2JS lock resolution was narrowed to 2.8.7 before testing. npm's hidden install state left three dev copies stale; only those generated folders were refreshed, preserving all source/assets/backups.
- Remaining underlying advisory-bearing packages: **@grpc/grpc-js 1.9.16 high** and **uuid 9.0.1 moderate** in the production dependency tree; **@opentelemetry/core 1.30.1, glob 10.5.0 and minimatch 9.0.9/10.2.6 moderate**, development only. Parent SDK/tooling findings propagate from these.
- Firebase client Firestore pins gRPC ~1.9.0, outside patched 1.13.6/1.14.5+; Admin's separate copy is already 1.14.6. No app gRPC server/getAuthContext path was found. UUID's advisory concerns v3/v5/v6 APIs with caller buffers; inspected Google SDK calls use v4 and no app v3/v5/v6 use was found. This limited call-site review does not clear the advisories. Fixed majors fall outside parent constraints; blind Firebase downgrades, Admin major upgrades or Next/eslint changes could affect API/ESM/Vercel compatibility and were not applied.
- `DEPENDENCY_AUDIT.json` now contains current findings; `DEPENDENCY_TRIAGE.json` preserves before/after totals and production/development classifications. Remaining decisions require supported parent updates/compatibility verification or explicit evidence-based risk acceptance.

### Regression results after the lock changes

- **Production build including TypeScript PASS; 37 unit tests PASS; 22 admin/upload + 7 public API tests PASS; 12 focused authentication/services/QR browser tests PASS.** These regressions were justified by the Firebase runtime/tooling dependency changes.
- Direct leaf imports/version checks and a synthetic 4,000-match RE2JS lookbehind check pass. Firebase CLI starts and reports 15.34.0. Initial ad-hoc diagnostic export-path/config-sandbox errors were corrected as harness/environment issues; no application regression failed.
- The earlier **89-browser** and ESLint results remain historical evidence; neither was unnecessarily repeated or claimed as a new full-suite pass. No application source/UI code changed. The temporary local server was stopped. Auth/Firebase/Cloudinary boundaries in API/browser suites remain mocked.

### Java / Firebase rules

- Java is unavailable on PATH, JAVA_HOME is unset, and checked common Adoptium/Microsoft/Java/Android Studio runtime locations contained no java.exe. No installer or system change was performed.
- Installed **firebase-tools 15.34.0 explicitly requires Java major 21 or newer**, verified in `node_modules/firebase-tools/lib/emulator/commandUtils.js` (`MIN_SUPPORTED_JAVA_MAJOR_VERSION = 21`). The earlier emulator command failed before tests; this review did not repeat the same known missing-prerequisite failure. **Rules tests have not executed/passed.**
- Windows: install **Temurin JDK 21 LTS, Windows x64 MSI** from the official Adoptium site, enable Add to PATH and JAVA_HOME, then reopen PowerShell. If a JDK exists elsewhere, configure its actual location instead. Official download/installer links are in `BLOCKER_REVIEW.md`.

```powershell
Set-Location -LiteralPath 'C:\projects\golesta-beauty\v2'
java -version
# Confirm major 21 or newer before continuing.
npm.cmd run test:rules
```

The existing npm command explicitly uses `demo-golesta-v2` with only Firestore/Storage emulators. Never substitute a customer project or load real credentials for rules testing.

### Preview configuration / resource isolation

- Read-only metadata confirms `golesta-beauty` is Next.js/Node 24 with 12 Preview-target keys. Its latest returned deployment's Git metadata confirms **reza-noorzad/golesta-beauty / development/golesta-v2**. The actual production deployment confirms **golesta-beauty-web / the same repository / main**. These are observed deployment sources, not proof of every current project setting or this uncommitted version being deployed.
- Required root is `v2`; the connector does not expose Root Directory/current project Git settings. Installed CLI inspections could not access the project in their available scopes. No login/link/settings change was attempted; owner dashboard verification remains necessary.
- Preview public Firebase project-ID/auth-domain consistency was confirmed without reporting identifier values. Sensitive server FIREBASE_PROJECT_ID was not returned, so remote server/public equality remains unverified. Cloudinary cloud-name configuration exists. No API secret/private key/token was fetched or printed.
- Production project-level env metadata is empty. Read-only public production GETs of `/`, `/review/`, `/scan/`, `/links.html` returned 200 without Firebase/Firestore/Cloudinary markers or external script-src hosts; equivalent local legacy pages also lack them. **This does not prove production has no such backend**; shared groups, integrations, deployment overrides and other services remain to check.
- **Sharing assessment: UNKNOWN for Firebase project, Firestore database, Firebase Authentication and Cloudinary account/product environment.** Neither sharing nor isolation was proven. Separate Vercel project names do not establish separation.
- Current backend uses default Firestore and default project Auth, with no independent test tenant. Equal Firebase project IDs would therefore share these stores. Cloudinary folder `golesta-v2` is not an isolation boundary; different cloud names can also share a parent/billing account.

### Remaining blockers and exact next steps

1. Review the residual gRPC/UUID/telemetry/glob/minimatch parent compatibility risks using the saved triage. Do not repeat already fixed leaf updates or force unsupported majors. Test/audit again only after a relevant change or new uncertainty.
2. Install/configure JDK 21+, reopen PowerShell and run the demo rules command above. Record actual results; static review/application tests are not rules-test evidence.
3. Owner: verify current Preview Git settings and **Root Directory v2** in Vercel. Deployment repository/branch metadata is already confirmed. Preserve production-branch behavior and `golesta-beauty-web`; no automatic settings changes are authorized.
4. Owner: inspect project variables **plus shared environment groups, linked integrations, Git overrides and deployed backend configuration** privately. Compare actual production and intended Preview Firebase project IDs, default Firestore database, Auth project/tenant and Preview authorized domains. If production truly does not use Firebase, explicitly record that and what the configured Preview project is used for; do not infer it from HTML.
5. Owner: compare Cloudinary cloud names/product environments **and parent/billing account ownership**, and confirm credentials are for a test environment. A different folder/Vercel project is insufficient. Explicitly record production non-use if that is the real configuration.
6. Record an isolated resource assignment before live save/upload/account/moderation QA. Any provisioning/settings changes need a separate instruction. Keep the catalog paused; do not start Phase 5B.

**Updated assessment: BLOCKED.** Compatible remediation/regressions are complete; Java/rules execution, root/settings confirmation, backend isolation evidence and the residual dependency decision remain open. The focused blocker review is complete.

Files changed in this review: `v2/package-lock.json`, root status, updated release audit/security/staging/readiness/verification reports, and new `BLOCKER_REVIEW.md`, `DEPENDENCY_TRIAGE.json`, `RESOURCE_ISOLATION.json`. No application source, genuine content/assets/records or external settings changed. No new branch, staging, commit, push, deployment or Phase 5B work occurred.

## Exact Phase 5B handoff — only when requested

1. Read this file and `v2/release/PREVIEW_READINESS.md` first. Verify the permanent branch, HEAD, unchanged index and complete uncommitted tree; retain all preceding work/backups. Do not repeat passing suites without a change or new uncertainty. Do not reactivate the catalog.
2. Resolve or explicitly assess the outstanding dependency findings using the saved advisory ranges and actual usage paths. Evaluate supported compatible patches deliberately; do not force major upgrades/downgrades or claim conditional advisories are automatically exploitable. Re-run relevant tests/audits after any dependency change.
3. Provide a supported Java runtime for the installed Firebase CLI, then run `npm.cmd run test:rules` with `demo-golesta-v2`. Keep emulator tests isolated; never run destructive rule tests against business databases.
4. Confirm actual Vercel repository, branch and root settings read-only. Correct configuration only if the next user instruction authorizes changes. Keep `golesta-beauty-web` untouched; do not change Production branch/settings or promote anything implicitly.
5. Confirm the intended isolated Firebase/Auth/Cloudinary resources and Preview authorized domains before any live save/upload/account QA. Verify secret/public project consistency without reporting values. Existing local/Preview credentials must not be assumed to be safe test resources.
6. Prepare a concrete reviewed source/commit/configuration result using `STAGING_PLAN.json`. The user must separately authorize any commit, push, Preview deployment or settings mutation; this 5A handoff grants none. Never use blind staging/force-add or deploy the whole local workspace.
7. If a Preview deployment is later explicitly authorized, keep deployment protection, inspect its build/runtime logs and test actual auth persistence/direct routes, API JSON/error handling, safe isolated saves/counts/moderation/uploads/account recovery and public contacts/banners/gallery/vouchers/QR. A local build/mock suite or old READY deployment is not a substitute.
8. Complete actual-device/accessibility/performance checks where available and document exact browser/device versions and unverified cases. Preserve all business data and the paused catalog unless separately instructed.
9. Update this file with resolved/unresolved gates, actual live test evidence, deployment readiness and rollback/release instructions. Stop before production publication or any action not explicitly authorized.

Local baseline from `v2/`: `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run test:admin-api`, `npm.cmd run test:public-api`, `npm.cmd run build`. Start the local app with `npm.cmd run start -- --hostname 127.0.0.1 --port 3102`. In another PowerShell session set `GOLESTA_TEST_BASE_URL=http://127.0.0.1:3102`, `GOLESTA_TEST_BROWSER_CHANNEL=msedge`, then run `node node_modules/@playwright/test/cli.js test --workers=1 --reporter=line`. Stop the server afterwards.

Reconcile source/pattern/ignore/build scans and the allowlist without credential retrieval with `node scripts/audit-release.mjs --no-credentials`; use `--dependencies` only when a fresh registry audit is needed. Reports contain paths/key names/counts, never secret values. Inspect results before any later authorized staging action.

## Phase 5B — local public navigation regression checkpoint (2026-11-11)

### Scope and preservation

- Continued the existing `development/golesta-v2` branch at local HEAD `9f81aeb`, matching the latest pushed checkpoint supplied by the owner. No fetch, staging, commit, push, branch switch or deployment.
- Preserved the two existing UI edits: desktop navigation still includes `Startseite`; the products-coming-soon decorative `g` remains removed.
- Corrected only accidental UTF-8 mojibake introduced in those edited files: German menu open/close labels, the brand's accessible separator and the products caption separator. The final application diff relative to HEAD is exactly the two intended UI changes.
- Added `v2/tests/public-navigation.spec.ts` (12 focused cases). Existing tests, README changes, QR/public files, untracked documents and the unusual untracked `tatus --short` file were retained.
- Preservation SHA-256 check: all 19 protected baseline files match, including pre-existing modified/untracked files, QR/public text, public CSS, catalog flag, package manifest and lockfile.
- No CSS defect was reproduced: no stylesheet/layout changes were made. Brand, navigation links, phone and WhatsApp remain separated, in bounds and readable at the requested widths, with the voucher published and unpublished.
- `PUBLIC_CATALOG_ENABLED=false`, public catalog cards/reviews, original data/assets, package manifests and lockfile remain unchanged.

### Verified navigation and responsive behavior

- From both `/leistungen` and `/produkte`: the explicit desktop `Startseite` link is visible and navigates to `/` at 1024, 1280 and 1440px. The mobile menu does the same at 390px.
- Mobile menu open/close German accessible labels, expanded state, Escape/focus return, and link-driven menu dismissal work. Mobile links also navigate to services and products.
- Team, Galerie, published Gutschein and Kontakt navigate from each subpage to the correct homepage hash/section. Section targets are in the viewport below the sticky header. Unpublishing the mocked voucher removes both navigation copies; no voucher publication was changed in a backend.
- Header geometry checks cover 390, 1024, 1280 and 1440px across homepage/services/products, banners on/off, vouchers published/unpublished, and compact/expanded states where the page permits scrolling. Assertions measure pairwise element overlap, horizontal document/header overflow, unwrapped desktop labels, visible contacts and >=44px contact targets.
- Products remain in the coming-soon state, with no decorative emblem or standalone `g`. Existing services/search/prices, content refresh, image/gallery, catalog boundary and QR checks also pass.

### Actual commands and results

Commands ran from `v2/` against the local built app at `http://127.0.0.1:3117`.

| Check | Final result |
| --- | --- |
| `npm.cmd run typecheck` | PASS, exit 0; Next type generation and TypeScript. |
| `npm.cmd run lint` | PASS, exit 0; configured ESLint scope, 0 errors / 0 warnings. |
| `npm.cmd run build` | PASS, exit 0; Next 16.4.1, 26/26 static pages and dynamic routes compiled. |
| New navigation/layout Playwright cases | **12 passed / 0 failed**. |
| Existing public-site Playwright cases | **18 passed / 0 failed**. |
| Existing services/QR Playwright cases | **3 passed / 0 failed**. |
| Combined relevant browser run | **33 passed / 0 failed**, 41.5 seconds, 1 worker, 0 retries. |
| `git diff --check` | PASS. |

Browser: installed headless Microsoft Edge **157.0.4341.42** (Chromium), Windows. Exact final browser command:

```powershell
$env:GOLESTA_TEST_BASE_URL = 'http://127.0.0.1:3117'
$env:GOLESTA_TEST_BROWSER_CHANNEL = 'msedge'
node node_modules/@playwright/test/cli.js test tests/public-navigation.spec.ts tests/public-site.spec.ts tests/services.spec.ts --workers=1 --reporter=line --output=test-results/phase5b-final-20261111
```

Evidence: ignored `v2/phase5b-public-final-20261111.log`, `v2/phase5b-build-20261111.log` and screenshots under `v2/test-results/phase5b-final-20261111/`. The new run used separate output directories; prior test artifacts were not cleaned.

Initial failures are retained, not hidden:

- First focused reproduction: **0 passed / 3 failed**. Two failures confirmed the corrupted German menu/caption text. The third was a test bug: role lookup excludes hidden mobile links, so it incorrectly expected two visible voucher links. The test now counts both DOM links explicitly.
- Intermediate run after encoding fixes: **9 passed / 3 failed**. All three failures were a test assumption that a short products page must scroll the entire announcement away. Measurements showed correct normal-flow/sticky positioning at y=34px. The test now verifies the actual banner boundary and only requires compact mode when scrollY exceeds 64px. Collision/overflow/visibility assertions were retained. No application layout workaround was added.
- Final production-build run: **33 passed / 0 failed**. Full historical unit/admin/API/emulator/audit suites were not rerun or relabelled as current results for this focused UI change.

### Isolation, remaining gates and next step

- Build and local servers used inert, process-only replacements for all Firebase/Auth/Cloudinary configuration names; credential files and persistent environment settings were not changed.
- Browser content/services APIs were mocked; other API and external browser requests were blocked by the existing public fixture. Remote image optimization was replaced with a local fixture when applicable. No live Firebase/Auth/Firestore/Cloudinary resource was read, mutated or provisioned. Google Font build assets are unrelated to those backend services.
- Temporary local servers were stopped after verification. No Vercel settings, production resources, security rules, dependency versions or catalog-release flags changed.
- Physical iPhone Safari/Android, WebKit, touch-device behavior, live integrations and deployed performance remain unverified. Viewport emulation is not physical-device certification.
- Earlier Phase 5A release gates remain open: residual dependency advisories/decision, Java 21+ and isolated emulator rules evidence, current Vercel root/Git settings confirmation, and authorized resource-isolation evidence. This local Phase 5B UI checkpoint does not clear Preview release approval.
- Suggested next step: owner review of the preserved UI diff and regression evidence; then address the existing release gates in a separately authorized task. Refresh the staging manifest before any future approved commit. Do not commit, push, deploy, enable the catalog or access live integrations implicitly.

## Phase 5B — dependency security review (2026-11-11)

- Preserved the complete local checkpoint at `9f81aeb` on `development/golesta-v2`, including the Startseite/emblem edits and navigation test. No UI source or existing tests changed. The earlier **33 passed / 0 failed** Playwright result remains historical evidence and was not rerun.
- Read the saved audit/triage/blocker/readiness evidence, performed fresh full and production npm registry audits before and after the change, checked installed versions/parent ranges/call sites, and read primary maintainer advisories. No Firebase/Auth/Firestore/Cloudinary or Vercel operation.
- **Safe fix:** `fast-xml-parser 5.11.2 -> 5.12.0`, within Cloud Storage's existing ^5.3.4 range; required `is-unsafe 2.0.2 -> 2.0.3`. Exactly **two lock entries** changed. No package.json, SDK/framework version, override, business data or catalog-flag change.
- npm's hidden install manifest was stale despite reporting success. Actual old files were verified; only those two generated directories were moved to an ignored root backup, then installed with `--ignore-scripts`. Physical versions now match the lockfile.
- **Fresh all-dependency audit:** before **31 (5 high, 25 moderate, 1 low)**; after **30 (5 high, 25 moderate)**. **Production:** before **13 (4 high, 8 moderate, 1 low)**; after **12 (4 high, 8 moderate)**. **Development-only:** 18 (1 high, 17 moderate). **0 critical**, both final audits exit 1 for remaining findings.
- Counts are affected packages including parents, not independent exploits: five remaining advisory-bearing libraries / six advisories. Compared with the older 5A report, npm newly reports the low XML issue and no longer reports the propagated eslint-config-next finding before any code change; this registry drift is not credited as a fix.
- **Production findings:** gRPC 1.9.16 high + low (server certificate authentication/error-handler conditions, no matching app server path found), UUID 9.0.1 moderate (affected v3/v5/v6 output-buffer methods absent in inspected SDK callers, which use v4). Matching application exploitability is unproven, not formally cleared.
- **Development findings:** OpenTelemetry core 1.30.1 moderate (inbound baggage limits), glob 10.5.0 moderate (continued traversal after abort), minimatch 9.0.9/10.2.6 moderate (hostile patterns with optimizationLevel>=2). No public app input path found; local/CI tooling exposure remains relevant.
- Evaluated current supported-major SDK/tool releases and exact parent constraints. New Firebase 13.2.0/Firestore 4.19.1 still pin gRPC ~1.9.0; CLI 15.35.0 and typescript-estree 8.72.2 retain affected tooling majors. Existing Google SDK/gaxios/teeny versions are latest checked within current majors. No advisory-removing supported update for these remaining constraints was identified. No downgrade, major upgrade or unsupported override applied.
- **New regressions:** **5/5 offline dependency tests**, **22/22 mocked admin/upload handler tests**, production build with TypeScript and **26/26** static pages, targeted lint for the new test and git whitespace check PASS. No regression failures. Build used inert process-only backend values; no live integration or account was initialized.
- Updated `v2/release/DEPENDENCY_AUDIT.json`, `DEPENDENCY_TRIAGE.json`, `BLOCKER_REVIEW.md`, `PREVIEW_READINESS.md` and this status. Added `v2/tests/dependency-security.test.mjs`; lockfile is the only existing non-report file changed by this review. Prior reports/lock and old generated packages have ignored safety snapshots. Raw audit/test/build logs are ignored `phase5b-security-*` / `phase5b-dependency-*` files under v2.
- **Preservation:** 195/195 protected baseline files match their SHA-256 hashes, including the navigation components, public CSS, new navigation test, untracked documents, assets/data, package manifest and existing tests. Only six intentionally updated existing files plus the new dependency test differ from the task-start checkpoint.
- **Remaining gate:** release remains BLOCKED for unresolved advisories/upgrade-or-risk decision plus the unchanged Java/rules, Vercel root/Git and resource-isolation gates. No new remote verification, Java installation or emulator attempt. `PUBLIC_CATALOG_ENABLED=false`; no staging, commit, push, deployment or production change.
- **Next:** owner review of the scoped exposure/constraint evidence; track supported parent fixes or separately approve a validated compatibility/risk plan. Refresh the staging manifest only before a later approved commit. This review is not blanket risk acceptance or release approval.

## Phase 5B — Playwright WebKit compatibility QA (2026-11-11)

### Availability and isolated setup

- Verified `development/golesta-v2`, local HEAD `9f81aeb`; preserved the navigation and dependency-security checkpoint.
- Actual host: **Windows 11 Pro**, kernel build **10.0.26200**. Existing **Playwright 1.64.1**, cached WebKit revision **2370**, engine-reported version **27.2**, launched successfully using an in-memory page. **No browser installation/download or application dependency change was needed.**
- Added `v2/playwright.public-webkit.config.ts`, extending the existing configuration. It selects only the public navigation/site/services suites, one worker, zero retries, a desktop Safari device profile using WebKit, plus an iPhone 13 WebKit profile with touch/mobile settings for the 375/390/430px cases.
- Configuration rejects non-loopback/non-HTTP targets and a supplied Chromium browser channel. Removed the navigation spec's forced Edge fallback; its existing explicit Edge environment option still works. Assertions/test cases remain preserved.
- Build/local servers used inert process-only Firebase/Auth/Cloudinary values, never changed credential files, and listened only on 127.0.0.1:3117. Existing public fixtures mocked content/services APIs, blocked other API/external browser requests, and substituted local remote-image fixtures. No live provider resource was accessed, initialized or provisioned.
- Every run used a separate artifact directory. Updated public screenshots to use `testInfo.outputPath`, avoiding overwriting earlier screenshots or another browser project's output.

### Confirmed issue and minimal fix

Initial WebKit run: **39 passed / 3 failed**. All failures were the same gallery focus-return regression: desktop WebKit at 375 and 1440px, and iPhone-profile WebKit at 375px. Header/layout/navigation assertions passed.

An isolated DOM check confirmed that activating a thumbnail left `document.activeElement` on a prior DIV. The lightbox therefore remembered that DIV as its return target. Escape closed the dialog but left the original thumbnail unfocused, breaking keyboard continuation.

The only application change is in `v2/src/app/page.tsx`: explicitly focus `event.currentTarget` with `preventScroll:true` before opening the selected image. The existing lightbox then captures/restores the correct opener. No gallery redesign, timeout workaround, stylesheet change, image/data update or dependency change.

The retained regression now also reopens using Enter and closes through the close control, checking focus return again. iPhone-profile menu/gallery actions use Playwright touch taps; desktop actions retain clicks. Existing arrow navigation, Escape, expansion/collapse and image checks remain active.

### Exact results

| Check | Final result |
| --- | --- |
| Desktop-profile WebKit | **33 passed / 0 failed**. |
| iPhone-profile WebKit | **9 passed / 0 failed**. |
| Combined WebKit rerun | **42 passed / 0 failed**, 2.3 minutes, 1 worker, 0 retries. |
| Focused Edge cross-check | **3 passed / 0 failed**, 5.7 seconds: gallery/anchors at 375 and 1440px plus mobile subpage home navigation at 390px. |
| `npm.cmd run typecheck` | PASS, exit 0, after the final source/test changes. |
| `npm.cmd run lint` | PASS, exit 0; no errors/warnings. |
| `npm.cmd run build` | PASS, exit 0; Next 16.4.1, TypeScript and **26/26 static pages**. Rebuilt because application source changed. |
| `git diff --check` | PASS. |

Coverage: header and explicit Startseite links from services/products; mobile menu/Escape/focus; coming-soon content with no decorative g; services search/categories/prices; Team/Galerie/published Gutschein/Kontakt subpage anchors and unpublished-voucher removal; contacts; sticky/compact header; no overlaps or horizontal overflow; native lightbox opening, arrow keys, Escape, Enter reopening, close control and focus return; gallery expansion/images; catalog boundary/redirects and QR links.

Desktop-profile widths include 320, 375, 390, 430, 768, 1024, 1280 and 1440px; the dedicated collision/overflow matrix covers 390/1024/1280/1440px with banners and voucher publication both on/off. iPhone-profile cases use 375/390/430px with emulated touch, scale and mobile user agent. Screenshots at 375px mobile and 1024px desktop were visually inspected.

Final WebKit command (from v2, with the isolated local built server already running):

```powershell
Remove-Item Env:GOLESTA_TEST_BROWSER_CHANNEL -ErrorAction SilentlyContinue
$env:GOLESTA_TEST_BASE_URL = 'http://127.0.0.1:3117'
node node_modules/@playwright/test/cli.js test --config=playwright.public-webkit.config.ts --reporter=line --output=test-results/phase5b-webkit-final-20261111
```

Focused Chromium command used the existing config with `GOLESTA_TEST_BROWSER_CHANNEL=msedge`, the two public/navigation specs and `--grep 'public anchors|subpage navigation from /leistungen at 390px'`.

Evidence is retained in ignored `v2/phase5b-webkit-initial-20261111.log`, `phase5b-webkit-final-20261111.log`, `phase5b-webkit-edge-crosscheck-20261111.log`, `phase5b-webkit-build-20261111.log`, and separate `v2/test-results/phase5b-webkit-*` directories. Initial failures/screenshots/traces were retained. All temporary local servers were stopped.

### Preservation, files and limits

- Files changed in this QA task: `PROJECT_STATUS.md`, new `v2/playwright.public-webkit.config.ts`, `v2/src/app/page.tsx`, `v2/tests/public-navigation.spec.ts`, `v2/tests/public-site.spec.ts`. The original `playwright.config.ts` is unchanged.
- **198/198 protected baseline files match SHA-256**, including package.json/lockfile, all dependency-security reports/tests, public header/products changes, CSS, fixtures, original assets/data, pre-existing modified files and untracked documents. The existing 33 browser cases remain, with only browser portability/artifact safety and gallery/touch assertions improved. No unrelated cleanup/reset.
- `fast-xml-parser 5.12.0` and `is-unsafe 2.0.3` remain installed; `PUBLIC_CATALOG_ENABLED=false`. Dependency audit/regression suites were not needlessly repeated because the dependency graph is unchanged.
- **This is Playwright WebKit running on Windows, not the Apple Safari application, macOS Safari, an iOS simulator, or a physical iPhone test.** Device profiles/user agents/taps emulate browser conditions; they do not reproduce iOS browser chrome, actual VoiceOver/keyboard, native safe areas, OS integration, or physical touch/rendering/performance.
- Physical iPhone/iPad Safari and real Android/device validation remain outstanding, alongside the existing dependency/risk, Java/rules, Vercel settings confirmation and resource-isolation release gates. No new audit/Java/Vercel/live integration check was performed.
- No staging, commit, push, deployment, Firebase project creation, credential/remote data change, Vercel setting or production action. Release approval remains **BLOCKED** by the earlier independent gates.
- Suggested next step: review the minimal gallery fix and WebKit evidence; then perform a separately authorized physical iPhone Safari rehearsal and address the remaining release gates before any approved Preview release.

## Phase 5B - release gate reconciliation and safe checkpoint review (2026-11-11)

Read all release reports and tracked/untracked changes. Preserve app/tests/lock/backup/inherited files; successful app suites not repeated. Dated Phase 5A evidence retained instead of claiming it as fresh.

Fresh read-only findings: local and remote development/golesta-v2 both equal `9f81aebfa5dd6cebb798bf4888a3834976d7201a`. Java **Temurin OpenJDK 21.0.13+9-LTS** meets Firebase CLI minimum 21. Existing firestore-debug.log (2026-11-07, 28,954 bytes) shows emulator activity but does not attest a complete passing Rules run tied to current source.

Vercel metadata: baseline Preview `dpl_CR31tTcfb2gr68uSu7KmK1pf1G3a` at `9f81aeb` is **READY**: https://golesta-beauty-i8fpl8mgp-reza-noorzads-projects.vercel.app. It excludes local Phase 5B. Current root/Git settings omitted by connector. Separate projects/historical key names are not isolation proof. No environment or credential endpoint queried.

| Gate | Status | Evidence / next action |
| --- | --- | --- |
| Branch and pushed checkpoint | **VERIFIED** | Local HEAD and git ls-remote equal 9f81aebfa5dd6cebb798bf4888a3834976d7201a on development/golesta-v2. No fetch or Git mutation. |
| Navigation and public UI | **VERIFIED** | Saved Edge 33/0: Startseite, mobile menu, subpage anchors, catalog-off and 390/1024/1280/1440px collision/overflow matrix. |
| Windows WebKit and Edge regression | **VERIFIED** | Final WebKit 42/0 (33 desktop + 9 iPhone profile); focused Edge 3/0 after gallery focus fix. Emulation, not physical Safari. |
| Typecheck, lint and local build | **VERIFIED** | Latest completed WebKit task: exit 0 for all, build 26/26 static pages. No app/test/lock changes in reconciliation; no suite repetition. |
| Compatible dependency patch | **VERIFIED** | Only fast-xml-parser 5.11.2 -> 5.12.0 and is-unsafe 2.0.2 -> 2.0.3 lock entries; offline tests 5/0, mocked admin/upload 22/0. No direct dependency or override. |
| Residual dependency release decision | **BLOCKED** | Saved current audits exit 1: all 30 (5 high/25 moderate), production 12 (4 high/8 moderate), dev-only 18 (1 high/17 moderate), 0 critical. Includes affected parents. Supported fixes or explicit scoped risk decision required; no acceptance implied. |
| Java prerequisite | **VERIFIED** | Fresh java -version: Temurin OpenJDK 21.0.13+9-LTS meets Firebase CLI 15.34.0 minimum major 21. Installation no longer a blocker. |
| Firebase Rules emulator pass | **BLOCKED** | Historical ENOENT predates available Java. Existing firestore-debug.log proves emulator activity, not a complete passing runner result tied to current rules. Capture a demo-golesta-v2 local result; no Console or owner phone needed. |
| Existing pushed Preview build | **VERIFIED** | Read-only Vercel deployment dpl_CR31tTcfb2gr68uSu7KmK1pf1G3a is READY at 9f81aeb, source git, development/golesta-v2, target null (Preview). Baseline build only, not uncommitted Phase 5B or live integrations. |
| Uncommitted Phase 5B Preview | **BLOCKED** | Current changes remain local and are not deployed. Separate approval required for an exact checkpoint/push/Preview; no publishing now. |
| Current Vercel Git and root settings | **REQUIRES OWNER CONFIRMATION** | Connector omits current configured Git/root settings. Required root v2. Authorized Vercel admin can confirm read-only without Firebase Console or salon phone. |
| Firebase/Firestore/Auth isolation | **REQUIRES OWNER CONFIRMATION** | Actual Production/Preview project/default database/Auth store/domain assignments not reliably compared. Authorized account admin must privately confirm isolated test assignment. |
| Cloudinary isolation | **REQUIRES OWNER CONFIRMATION** | Product environment and parent/billing account boundaries unknown. Folder golesta-v2 is not isolation. Authorized Cloudinary admin confirmation needed. |
| Credential validity and live integration QA | **BLOCKED** | No credentials retrieved/validated; old key-name metadata is historical. Auth/save/upload boundaries mocked. Requires isolation, authorized admin confirmation and separate permission; no live writes now. |
| Physical iPhone/Safari and Android QA | **BLOCKED** | Windows engine/viewport tests do not establish physical-device behavior. Use any authorized suitable test device and isolated target; not necessarily owner's personal phone. |
| Public catalog disabled | **VERIFIED** | src/lib/public-config.ts still exports PUBLIC_CATALOG_ENABLED=false; source unchanged. Keep disabled. |

### Completed work and preserved test evidence

Desktop Startseite, emblem removal, subpage anchors, mobile menu, responsive header collisions/overflow; minimal WebKit gallery opener focus fix; supported XML dependency patch and usage/range triage. Final scoped counts: **33/0 navigation Edge; 42/0 WebKit; 3/0 focused Edge; 5/0 offline dependency; 22/0 mocked admin/upload**. Runs overlap; do not sum as unique tests. Latest prior typecheck/lint/build passed, **26/26 static pages**. Initial failures/commands remain above. Physical Safari and live integrations are not verified.

### Checkpoint and independent next actions

The exact 18-file recommendation is in PREVIEW_READINESS.md and STAGING_PLAN.json with individual reasons/hashes. Other inherited README/install/version/test/checksum changes, whitespace-only public assets and stray terminal capture are held, preserved on disk. Backups/environments/credentials/generated outputs excluded. Manifest targets current 9f81aeb, replacing stale 581b1c2 allowlist containing already committed work.

Existing release helper now supports `--no-credentials`: no .env/private-key read or parsing, no known-private-value comparison. Current path/pattern/build review is in SECURITY_SCAN.json; not a Git-history, credential-validity or rotation audit.

Without Firebase Console/owner phone: local reviews, mocked QA, safe checkpoint preparation, available read-only Vercel metadata, and existing demo-only Rules emulator now Java is present. Later local command from v2: `npm.cmd run test:rules` (fixed demo-golesta-v2; no real projects). Authorized Vercel admin confirms current root/Git; authorized Firebase/Cloudinary admins confirm actual resources privately. Physical QA can use any authorized suitable device/isolated target. MFA belongs to the actual account holder if required, never bypassed.

Next: review exact allowlist, capture a verifiable demo Rules result, obtain settings/isolation confirmations. Seek separate explicit approval before any checkpoint/publishing action. No staging, commit, push, deploy, release, project creation or Production action; PUBLIC_CATALOG_ENABLED=false.

### Final reconciliation validation

- Credential-free guard: **PASS**; 0 attempted credential-file reads / 0 private-key parses; 0 secret-path/pattern findings across **203 eligible paths and 119 generated public/build files**. All 8 environment paths and 11 ignore probes protected. No environment values, private keys, tokens or credential exports retrieved.
- **10 synthetic detector cases passed / 0 failed**, in memory with no real credentials; scanner syntax and targeted ESLint PASS. Initial lint invocation from repository root failed to locate v2 config, corrected cwd PASS; no lint-code failure. These are helper checks, not repeated application tests.
- **195/195 protected file SHA-256 hashes match** the 203-file starting snapshot. Only eight authorized reports/helper files changed in reconciliation; all app source/tests/lock, inherited and untracked files preserved. No files missing. Dependency audit/triage reports remain byte-identical to the completed dependency review.
- Exact recommendation: **18 files**, with **15 held paths**. No staging, commit, push or deployment. Release gates remain as classified; see the full authoritative PREVIEW_READINESS.md matrix, including the VERIFIED scoped security/checkpoint review.

## Phase 5B - Firebase Rules emulator verification (2026-11-11)

Confirmed branch development/golesta-v2 / HEAD 9f81aeb and Java **Temurin 21.0.13+9-LTS**. Reviewed package script, firebase.json, Firestore/Storage rules, tests/rules.test.mjs and installed CLI/unit-testing internals before execution. Fixed project **demo-golesta-v2**, CLI **--only firestore,storage**, singleProjectMode true, local ports **8080/9199**. No Functions/Extensions/Auth service or real project needed; authentication identities are local mock tokens. CLI demo mode skips requireAuth. Cached **Firestore 1.22.0 / Storage Rules runtime 1.1.3** SHA-256 match installed metadata; no download required.

Added `v2/scripts/verify-rules-local.mjs` for repeatable guarded execution: child environment allowlist excludes credentials, isolated CLI/npm config with usage false, Node sockets/DNS reject remote hosts, credential-file reads blocked, local ports checked before startup, input/JAR/output hashes captured. It runs the unchanged `npm.cmd run test:rules` from v2. Reproduce with `node scripts/verify-rules-local.mjs` from v2. This is not an OS-wide network sandbox or proof of deployed backend isolation.

| Execution | Passed | Failed | Skipped | npm/runner exit |
| --- | --- | --- | --- | --- |
| First isolated run | 1 | 0 | 0 | 0 |
| Rerun after runner log-preservation correction | 1 | 0 | 0 | 0 |

Same **one existing Node test**, not two distinct cases; **18 allow/deny assertions** per run (2 expected allows, 16 denials). PERMISSION_DENIED console messages are expected negative checks. No test failures, SDK/rule/config/package changes or live rule deployment. Synthetic data exists only in local emulators; cleanup and CLI shutdown completed. No emulator listeners remained on checked ports.

Final artifact: `v2/test-results/phase5b-rules-u9PP13/result.json` and `v2/test-results/phase5b-rules-u9PP13/test-output.log`. Source/config/lock/runner and cached-tool SHA-256 values bind this result in VERIFICATION_RESULTS.json. Guard reports observed only localhost/127.0.0.1, zero remote attempts; two nonexistent .npmrc probes blocked before reads. No real Firebase/Auth/Firestore/Storage connection, project creation or credentials retrieval required. No Console or owner phone used.

**Preservation incident, disclosed:** first runner's createWriteStream redirect was bypassed by CLI graceful-fs, replacing the pre-existing ignored `v2/firestore-debug.log` (old 2026-11-07, 28,954 bytes). No historical copy was found to restore. Minimal runner fix also redirects open/openSync and backs up/restores an existing root log if needed; corrected rerun preserved root bytes without fallback and kept its fresh emulator log in its artifact directory. Original historical log loss remains a limitation. No app/test/config/lock/customer records changed.

Helper syntax and targeted ESLint: **PASS**, exit 0. Existing successful app typecheck/build/browser/dependency suites not repeated because app/dependency graph unchanged. Rules gate changes **BLOCKED -> VERIFIED** only for existing emulator assertions. Residual dependencies, resource/settings confirmation and physical/live integration gates remain open. STAGING_PLAN refreshed to **19 recommended files / 15 held**, including the new local verification helper; no files staged. Public catalog remains false; no commit, push, deploy, Vercel setting or live rules changes.

Recommended next action: review this evidence/19-file checkpoint; obtain authorized admins' resource/settings confirmation and residual dependency decision before release. No need for Firebase Console or owner's phone for repeating the isolated demo verification.

Final Rules-task preservation/review: **196/196 protected eligible-file SHA-256 match** the 203-file starting snapshot; 7 authorized existing reports/helper edits plus 1 new runner, 0 missing eligible files. Existing app/source/tests/rules/config/lock and all held files are byte-identical. The ignored historical log overwrite is explicitly excluded from this claim. Fresh credential-free audit: **0 findings / 204 eligible paths / 119 build files**, 0 audit credential-read or private-key-parse attempts; no emulator listeners on checked ports. Manifest: **19 recommended / 15 held**. Helper syntax/targeted lint and git diff whitespace checks passed; no staging/Git publishing/live-resource action.

## Read-only backend isolation review - 2026-11-11

Current local checkpoint: `3dd1c9ac01d24fcbde54b7929e381bb3e7307098`, branch `development/golesta-v2`. New evidence is local-code-only. No network, Vercel/environment API, live provider call, Firebase Console, credentials/private identifier read or owner phone used. The local origin/main reference was not fetched; it is not a verified currently deployed revision.

Reviewed the complete locally stored legacy main tree: **28 files, five HTML pages**, images/README only; no backend/API/dependency/deployment configuration, external script sources, Firebase/Firestore/Auth/Storage/Cloudinary integrations or fetch/XHR calls. Working legacy HTML matches that snapshot ignoring line endings. Review navigation is a Google review redirect; the scan Website link matches the Production alias, not Preview. This establishes **no direct service use in that source**, not the current deployed inventory. The ignored older API backup imports V2-style helper code and is not in the production tree.

| Resource | Actual deployed classification | Source evidence / remaining gap |
| --- | --- | --- |
| Firebase project | **UNKNOWN** | No direct Firebase initialization/configuration in the reviewed static main snapshot. Actual deployed Production/Preview project assignments, credentials/IAM scope and any other production consumers are unavailable. Code equality validation is not a deployed identity comparison. |
| Firestore | **UNKNOWN** | No Firestore SDK/REST calls or backend routes in the reviewed static source. Deployed project/default-database relationship and existing-data purpose are unverified. If project is shared, this code targets the same default database; collection prefixes do not isolate it. |
| Authentication | **UNKNOWN** | No Firebase Auth code/login/account storage in the reviewed static source; external Google review navigation is not Firebase Authentication. Actual project/user-store assignment and other production users are unverified. Separate app names or Vercel projects do not isolate users in a shared Firebase project. |
| Firebase Storage | **UNKNOWN** | Reviewed legacy images are repository assets; no Firebase Storage SDK/REST or hosted-image references found. Configured bucket identity/ownership/IAM, other consumers and stored image URL targets cannot be established offline. Initializing a Storage client is not evidence of a used or isolated bucket. |
| Cloudinary | **UNKNOWN** | No Cloudinary SDK, upload endpoint or hosted image reference in reviewed static source. Actual Preview/Production product environment and parent/billing account assignments, credentials' scope and stored asset origins are unavailable. A folder is not isolation; distinct clouds would not prove separate parent accounts. |

V2 client/server project equality is checked by code, not confirmed runtime metadata. Default Firestore/Auth would be shared if the project were shared. Storage is configured but no active app bucket operations were found; current uploads use Cloudinary. Existing image URL shapes can reference other buckets/clouds, so configuration separation alone would not prove every asset origin isolated. No stored records were inspected.

### Local configuration evidence

Local environment file presence, tracked key names and earlier reports provide no paired authoritative Production/Preview inventory. No .env/credential file or provider resource-identifier value was read, printed, exported or added. Earlier local project-ID equality is historical and cannot establish remote assignments. Current local Vercel link metadata is absent. The prior Vercel observations remain historical, not new checks.

### Safe QA now

- Local source/configuration/documentation review without importing application initialization or reading credentials.
- Existing offline unit/schema/image/dependency tests and mocked API/browser QA under inert process-only configuration, a loopback server and denied external traffic.
- Existing synthetic local demo Rules emulator workflow with cached tools and credential/network guards, when separately needed; its passing evidence is already recorded and was not repeated here.
- Local legacy static-site layout/navigation checks with external navigation/network blocked.

- Do not open an unmocked configured V2 Preview even for read-only UI QA: public pages poll GET content/services, server routes read Firestore, Auth may restore/refresh sessions, and remote images may access Storage/Cloudinary.
- Do not execute the legacy Firebase read diagnostic, real login, saves, account actions, uploads or remote-image fetches before identity/test authorization and separate permission. Upload handling increments a Firestore quota before uploading.
- Do not treat catalog-off, browser API mocks alone, separate Vercel projects, app names, folders, successful emulator tests or historical local identity checks as deployed resource-isolation proof.

### Minimum later confirmations (no Console/phone required now)

1. Confirm that the currently served Production site is the reviewed static root/main snapshot, with no injected scripts, platform rewrites/API integrations or additional production application using these resources. A yes/no source/deployment-scope confirmation can establish NOT USED BY PRODUCTION without supplying identifiers.
2. Confirm that intended Preview Firebase project/default database/Auth store, any Storage bucket and Cloudinary product environment are authorized for test use, and whether any other production workload depends on them.
3. If any production consumer exists, an authorized admin privately compares the two environments' project/default database/Auth tenant/bucket and Cloudinary product environment/parent account plus permissions/quotas. Report only same/different/not used/unknown and test authorization; never provide identifier values or credentials.

No isolation gate is cleared by this review. Resource classifications remain **UNKNOWN** for actual deployment relationships; **NOT USED BY PRODUCTION** is conditional on confirming the static deployed scope/no other consumers. No new test suite, build, server, provider request or emulator run was necessary for documentation-only analysis. Existing test evidence remains unchanged.

Preservation: the LOCAL checkpoint `3dd1c9ac01d24fcbde54b7929e381bb3e7307098` and all 15 held paths/logs remain intact. Only PROJECT_STATUS.md, RESOURCE_ISOLATION.json, PREVIEW_READINESS.md and BLOCKER_REVIEW.md updated in this review. No app/source/dependency/configuration/rule changes; public catalog remains false. Committed STAGING_PLAN.json remains a historical precommit manifest for 3dd1c9a, not an allowlist/authorization for a new commit.

## Final go-live preparation - interrupted documentation completed

The declined large command was not assumed executed. GO_LIVE_PLAN.md was created and release records updated in small focused edits.

Owner evidence: old Production is static and uses no Firebase/Cloudinary; existing Firebase belongs to V2. This resolves legacy sharing but is not a live technical audit, credential check or claim that Preview and future V2 Production have separate databases/credentials. Create no additional provider projects.

Redirect code and prior results reverified by source/artifact hashes: legacy tests **3 passed/0 failed** after **0 passed/3 failed** reproduction; inert HTTP smoke **10 passed/0 failed**; production build with TypeScript and targeted lint **PASS**, **27 static pages**. No passing suite repeated on resume. Review uses the unchanged legacy Google target and drops incoming query data; scan reaches links, thanks reaches contact without claiming an order.

Remaining critical gates: verify BOTH Vercel variable targets/root/runtime and deployed policies privately; verify approved-SHA Preview/staged Production, actual content and existing administrator/integration; explicit scoped dependency release decision; authorize the recorded-rollback two-domain cutover. Device/performance coverage and historical log exception are documented limitations; catalog/commerce stays paused. No automatic dependency acceptance.

Exact future Preview/admin/staged Production, apex/www move, rollback and legacy-retirement steps plus the proposed ten-file checkpoint: [GO_LIVE_PLAN.md](v2/release/GO_LIVE_PLAN.md). STAGING_PLAN.json is the already-committed historical manifest, not an allowlist for these new edits.

No new source changes on resume; completed next.config.ts, static review route and legacy-link tests preserved. Local HEAD remains 3dd1c9a. No commit, push, deployment, deletion, live provider mutation, account change or Vercel/domain setting change; PUBLIC_CATALOG_ENABLED=false.
