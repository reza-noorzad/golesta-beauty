# Golesta Beauty V2.3 — Phase 5A readiness

Assessment: **BLOCKED for Preview release approval**. Current findings and exact owner actions are in [BLOCKER_REVIEW.md](BLOCKER_REVIEW.md); the gates below include that focused follow-up. Local code review, regression testing, secret-file checks and release preparation are complete. This assessment does not mean the local application tests failed. No Phase 5B action is authorized or performed by this report.

## Evidence recovered after interruption

Phase 5A had already run before the usage interruption, although PROJECT_STATUS.md still ended at 4B-2. Existing security/dependency reports, source edits, manifest hashes, build artifacts and Playwright's passed last-run file confirm that work. The earlier tool results recorded 37 unit, 29 API and 89 browser tests passing, as well as TypeScript, ESLint and the production build. Source hashes were reconciled with STAGING_PLAN.json; no application files had changed since that manifest. Completed test suites were not repeated merely because the documentation was unfinished.

## Release gates

1. **Dependencies:** npm audit exits 1. After compatible RE2JS/body-parser/fast-uri fixes, the all-dependency tree has 31 affected-package findings (5 high, 26 moderate); omit-dev has 12 (4 high, 8 moderate). Totals include propagated parents, not distinct independent exploits. See DEPENDENCY_AUDIT.json and DEPENDENCY_TRIAGE.json. No major upgrades, downgrades, forced fixes or overrides were applied. Review each real usage path and select supported compatible updates or a documented mitigation before approving release.
2. **Rules execution:** static review confirms deny-by-default Firestore/Storage rules, restricted own-admin lookup, public service get-only access and server-only writes. The demo rules command was attempted but stopped before tests with `spawn java ENOENT`. Install/configure Java 21+ for the existing Firebase CLI and run the isolated demo suite. Rules have not been live-deployed or proven by an emulator in this phase.
3. **Preview linkage:** connected deployment metadata confirms Preview source `reza-noorzad/golesta-beauty` / `development/golesta-v2` and production source `main`. Current project Git settings and Root Directory remain unexposed. Confirm root `v2` and current settings in a read-only dashboard review before any deployment. Do not assume an existing READY deployment contains this uncommitted work.
4. **Environment isolation:** Preview variable names/targets exist; only non-secret resource identifiers were read in the focused follow-up. The sensitive server project ID remains unreadable and production backend identifiers are unavailable, so isolation is still unknown. Verify Firebase public/server IDs match the intended isolated test project, credentials are valid, Firebase authorized domains allow Preview, and Cloudinary points to an authorized test account/folder before authenticated write/upload/account QA. Do not use salon production data as a fixture.

The gRPC high advisory concerns server-side authentication using `getAuthContext` with particular TLS client-certificate settings. This application does not define a gRPC server or use that method; reachability was not demonstrated. The vulnerable 1.9.16 copy comes from the browser Firebase SDK's Node dependency tree; Firebase Admin's google-gax resolves 1.14.6. This is a scoped finding, not proof every Firebase request is exploitable. RE2JS was patched from 2.8.6 to 2.8.7; older UUID/tooling chains remain in the audit. Do not treat a passing application test suite as resolution of these advisories. Primary source: [gRPC maintainer advisory](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j).

## Read-only Vercel evidence and required settings

| Item | Required / observed |
| --- | --- |
| Preview project | `golesta-beauty`, confirmed by connected project API |
| Production project | `golesta-beauty-web`, confirmed present in project list; untouched |
| Repository | `reza-noorzad/golesta-beauty`, confirmed in observed deployment metadata; current settings not exposed |
| Branch | `development/golesta-v2`, verified locally and in observed Preview deployment metadata |
| Root Directory | `v2`; Vercel setting remains unverified |
| Framework | `nextjs`, confirmed |
| Node | `24.x`, confirmed; local package requires `>=24.12.0 <25` |
| Package install/build | Existing npm lockfile, `npm ci`, `npm run build`; framework defaults unless deliberately reviewed |
| Output | Next.js framework default; do not override to a legacy static folder |
| Deployment protection | SSO protection enabled for `all_except_custom_domains`, observed; preserve it |
| Existing deployment | API reports an older READY deployment; not this checkpoint, not an integration test |

Vercel supports Node 24 and permits package engines to select its major version; see [official runtime documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). Installed Next 16.4.1 requires Node >=20.9, Firebase Admin 13.10.0 requires >=18. All application API handlers use the Node runtime. `jwks-rsa@3.2.2` resolves its own `jose@4.15.9`; the separate root `jose@6.2.12` belongs to another dependency chain. No local ESM external-module error reproduced. Local import/build success is not Vercel serverless validation.

Project-level metadata lists these 12 keys targeted to Preview. No branch-specific overrides were returned for `development/golesta-v2`; shared Preview keys still apply. No values were printed, pulled or changed:

- Public browser configuration: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.
- Server only: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

The private key and Cloudinary API key/secret are marked sensitive in existing Vercel metadata. Other fields use existing encrypted/sensitive types. Public Firebase configuration is intentionally available to the browser; server credentials must never receive a NEXT_PUBLIC prefix. The local key parses and local Firebase project IDs match, but no new live authentication/read/write check was performed.

## Security review and fixes

- Bearer tokens are verified with revocation checks and every admin API requires an active administrator. Role restrictions remain server-side; editor content restrictions, account self-protection and transactional acting-lead checks are intact. Native REST mutations do not rely on ambient session cookies.
- Content revision/service timestamp checks prevent stale overwrites. JSON input schemas, byte limits, safe error messages and finite client/auth/read deadlines remain active. User/account creation still spans Auth and Firestore without cross-service atomicity; live partial-failure recovery remains unverified.
- Cloudinary uploads require admin authorization, enforce 4 MiB request bodies, decode/re-encode with Sharp, cap 25 megapixels and 1800px dimensions, strip metadata, orient images, use unique non-overwriting IDs and enforce 60 uploads per administrator/hour. Tests mock remote writes. Review submissions retain honeypot/origin/schema checks and a three-per-day IP quota when enabled; deployed proxy/IP behavior remains to verify.
- Fixed malformed/cross-scheme review Origin handling: reject as 403 before backend access. Previously malformed Origin could yield 500 and host-only comparison did not enforce full origin.
- Added CSP framing/object/base protections, X-Frame-Options DENY, nosniff and strict-origin-when-cross-origin referrers across Next responses. This deliberately limited CSP is not a complete script-source/nonce policy or a claim to eliminate every XSS risk.
- React text escaping and URL/image validation remain the primary content boundaries. Browser tests confirm markup in team/announcement text stays literal, private paths return 404 and anonymous admin APIs return no-store JSON 401.
- Extended ignore protection for credential filename variants, capitalized backup folders and archives. All eight local environment files, including three real backup `.env.local` copies, are ignored. Known-private-value and credential-pattern scans found no matches in eligible files or final client/static output. This is not a full Git-history or credential-rotation audit; forced staging always bypasses ignore rules and must not be used.
- Product keyboard regressions were reproduced against the earlier build: renaming a searched product removed its form; manually typing a hyphen dropped it. The selected editor now remains visible until explicit filter/search changes, and manual link typing preserves an intermediate trailing separator while final schema validation still applies.

## Verification and limits

Original Phase 5A evidence: TypeScript, ESLint, build, 37 unit tests, 22 admin/upload API tests, 7 public API tests and all 89 browser tests passed. After the focused lockfile updates, build/TypeScript, 37 unit tests, 29 API tests and 12 relevant authentication/services/QR browser cases passed; the full 89 cases and unchanged-source ESLint were not rerun. See BLOCKER_REVIEW.md. The latter includes 320–1440px public checks and mobile/tablet/desktop admin checks, product/catalog boundaries, QR behavior and all preceding administration coverage. Two initial product regression tests failed on the prior build, then passed after the fixes; no tests were hidden. The rules command and npm audit results remain explicit exceptions, as above.

Remote API/auth/upload changes in browser and API suites are isolated mocks. No live Firebase save, new Firebase read diagnostic, real Auth account creation, Cloudinary upload/deletion, Vercel deployment or production measurement occurred. Physical Safari/iPhone/Android, actual screen readers, native clipboard/photo-picker behavior, real-device DST behavior and production performance remain unverified. Catalog, featured public product cards and public product reviews remain paused.

## Explicit staging preparation

STAGING_PLAN.json is the file-by-file allowlist for a later reviewed V2.3 commit. It contains application/config, tests, scripts and documentation groups plus SHA-256 checksums. It also lists historical documentation/checksums and whitespace-only QR/test-text changes to hold for separate review. No file was staged by the audit.

Ignored backups, duplicate `v2/v2`, reference/source exports, environment files, credential files, dependencies, generated builds, test artifacts and logs are excluded. Never run `git add .`, force-add ignored paths or upload the entire local working tree as a deployment. The allowlist itself does not grant permission to stage, commit, push or deploy. Regenerate after deliberate changes with `node scripts/audit-release.mjs`; inspect both its findings and the index before approving any later commit.

Phase 5B must first clear or explicitly accept the release gates, verify isolated integrations and actual Preview settings, then follow the user's separately authorized scope. Production project `golesta-beauty-web`, business data, existing images and QR links must remain protected. Preserve the permanent branch and the complete uncommitted checkpoint.
