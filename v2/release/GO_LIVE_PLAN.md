# Golesta Beauty V2.3 - GO-LIVE PLAN

Status: NO-GO for production/domain cutover. Code is ready for an approved Git checkpoint and subsequent Preview verification. This document authorizes no actions.

Local baseline: 3dd1c9a on development/golesta-v2. New redirect fixes and documentation are uncommitted.

## Remaining critical gates

1. Privately verify the new Vercel project's root v2, Node 24 and required variables in BOTH Preview and Production. Validate the existing service credentials and deployed Firestore/Storage rules.
2. Verify the approved SHA in Preview and staged Production: actual published content, existing administrator login/session/reads and integration operation.
3. Obtain an explicit scoped dependency release decision or approved supported remediation. No silent acceptance or forced incompatible upgrades.
4. Approve the release actions and both-domain cutover after recording the rollback target and current assignments.

Owner evidence: the old website is static and uses no Firebase/Cloudinary; existing Firebase belongs to V2. This resolves the legacy-sharing question, consistent with inspected source, but is not a live technical audit. Create no additional project. Preview and future V2 Production may share real data/credentials; no separation is asserted.

## Configuration and login (names only; never export values)

- Browser/build: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID.
- Server: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. Never prefix server secrets NEXT_PUBLIC. Backend rejects mismatched client/server project fields; key parsing supports escaped newlines.
- Existing Preview key-name metadata does not establish Production availability. NEXT_PUBLIC values are built into browser assets; changed variables require a new build/deployment.
- /admin/login uses email/password: enabled provider, existing enabled Auth user and admins/<uid> active:true with valid superadmin/admin/editor role. Legacy active profiles without a role default to admin. User management requires superadmin. No public account bootstrap; do not create/change accounts here.
- /api/admin/session must validate the bearer token and active profile. Verify actual API-key/domain restrictions if login reports them; OAuth redirects are not a separate feature requirement for this password form.
- An authorized operator must confirm deployed Firestore/Storage policies match the reviewed files. Emulator success does not verify live rules. Any policy/account/provider change needs separate permission; no blanket Firebase deploy.


## Exact execution order - future approved actions only

1. **Checkpoint and push.** Review the explicit file list below, current diffs/hashes and secret checks; preserve 15 held paths and all backups/logs. Before any push verify this branch is Preview-only in the new project and cannot change legacy Production; stop for approval if branch tracking differs. After approval commit only reviewed release files and record the SHA. Push only development/golesta-v2 (git push origin HEAD:refs/heads/development/golesta-v2). Do not merge/change main or deploy this dirty working tree.

2. **Preview.** Privately verify golesta-beauty project/team, root v2, Node 24, Git branch and Preview variables. Confirm Git integration builds the approved SHA as READY/HTTPS Preview; keep deployment protection. Vercel protection login and Firebase app login are separate. No new Firebase/Cloudinary resource.

3. **Public and administrator verification.** Check /, /leistungen, /produkte coming-soon, team/gallery/voucher/contact anchors, prices/images, phone/WhatsApp and /links.html. Check /scan/, /review/, index.html variants and /thanks.html; do not submit a Google review. Confirm actual published content rather than fallback data. After explicit authorization, an existing admin logs in, refreshes, loads permitted management data and signs out. No customer edits. Save/upload probes require separate bounded authorization and approved cleanup scope; if deferred, explicitly accept unverified write capability. Uploads increment Firestore quota before Cloudinary, so failures can have partial effects.

4. **Staged Production.** After configuration and dependency decisions, build the SAME approved SHA for golesta-beauty's Production environment, withholding custom-domain assignment. From a clean, reviewed checkout an authorized operator can use vercel deploy --prod --skip-domain after verifying its project link, or Vercel's staged-production dashboard flow. Test the generated HTTPS URL with Production variables before promotion. Preview-to-Production promotion may rebuild with different variables; a Preview pass is not a Production pass.

5. **Promote and move BOTH domains.** Obtain explicit cutover approval and privately record the old project/deployment, assignments, redirects, DNS and TLS state. Promote the tested Production deployment. In the NEW project's Settings > Domains, add existing golestabeauty.com and www.golestabeauty.com, review the source/destination and Move Domain confirmation (including dependent redirects), then confirm. Do NOT delete domains from the old project first, transfer registrar/team ownership or rely only on a temporary alias. Keep www as primary and redirect apex to it preserving path/query. Verify both certificates, correct deployment, redirect and QR paths. Follow only DNS changes actually required by Vercel; preserve mail/TXT/CAA records.

6. **Rollback.** Keep the old static deployment/project reachable throughout cutover. If content, login, TLS or either domain fails, move BOTH domains back to the recorded old project/environment and restore recorded redirects/DNS only if changed. Later V2 releases can roll back to the last-good V2 Production deployment. Deployment/domain rollback does not reverse Auth/Firestore/media writes; no migration or data deletion belongs in this launch.

7. **Retirement.** After owner acceptance of public/admin operation, both domains and an agreed monitoring/rollback window, separately authorize legacy retirement. First verify no domains/aliases/links depend on it and retain needed records. No automatic deletion, resource cleanup or credential rotation.

Official procedures: [staged Production](https://vercel.com/docs/deployments/promoting-a-deployment), [project-domain move](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain), [apex/www configuration](https://vercel.com/docs/domains/set-up-custom-domain), [environment handling](https://vercel.com/docs/environment-variables), [Firebase password login](https://firebase.google.com/docs/auth/web/password-auth).


## Evidence and scoped limitations

- Existing source contact defaults match legacy; QR Website uses the intended apex/www pair. Actual stored/published content still needs deployed smoke.
- Catalog, featured cards, product details and product reviews remain intentionally paused. Voucher is information plus call-to-buy, not checkout/payment/PDF delivery.
- Confirmed compatibility fix: scan -> retained links page; review -> unchanged Google destination, dropping incoming query data; thanks -> contact without claiming an order. Slash/index/HEAD variants are covered.
- Recorded new checks: legacy HTTP cases 0 passed/3 failed before (404), then 3 passed/0 failed; ten inert public/API paths passed; targeted lint and production build including TypeScript passed, 27 static pages. Source and six artifact hashes reverified on resume; no suites rerun.
- Validation used an ignored source copy, no credential files, empty provider settings, network guards and public-font access only during build. Its Turbopack filesystem root was adjusted only for the installed-dependency junction. Original build and historical logs remain untouched.
- The initial smoke script expected www only and exited 1 after all ten HTTP checks passed; its corrected metadata check accepted the existing valid apex link. No source edit or HTTP repetition was needed.
- Broad physical-device/accessibility/performance coverage and the documented old emulator-log loss are limitations, not automatic reasons to request the owner's phone or repeat completed QA. No live deployment, real credentials, deployed-policy or administrator/integration verification is claimed.

## Dependency decision required

Saved audit: 30 affected-package findings overall (5 high/25 moderate), 12 production (4 high/8 moderate), 18 dev-only by difference, 0 critical. Counts include parents: six advisories across five underlying packages, not 30 independent exploits.

- Runtime gRPC high/low: affected server authentication/error-handler paths were not found; vulnerable Firebase client copy differs from patched Admin copy. Potential auth bypass/error disclosure under advisory conditions still requires explicit scoped acceptance/deferral or a supported parent fix.
- Runtime UUID moderate: affected v3/v5/v6 buffer APIs were not found; inspected callers use v4 and the app uses crypto.randomUUID. Keep the advisory and require a scoped release decision.
- Dev OTEL/glob/minimatch: hostile baggage/filesystem/patterns can exhaust tooling/CI. No public app path found; controlled inputs/upstream tracking and explicit scope acceptance remain necessary.

Full ranges, call sites, constraints and primary references remain in DEPENDENCY_TRIAGE.json. No fresh registry audit, dependency change, forced fix, override or risk acceptance occurred.

## Proposed next checkpoint - NOT authorized now

STAGING_PLAN.json is the already-committed checkpoint's historical manifest. Re-review only these ten release paths before a later approved checkpoint:

- PROJECT_STATUS.md
- v2/next.config.ts
- v2/src/app/review/route.ts
- v2/tests/legacy-links.spec.ts
- v2/release/GO_LIVE_PLAN.md
- v2/release/RESOURCE_ISOLATION.json
- v2/release/PREVIEW_READINESS.md
- v2/release/BLOCKER_REVIEW.md
- v2/release/VERIFICATION_RESULTS.json
- v2/release/DEPENDENCY_TRIAGE.json

Preserve all 15 held historical/unrelated paths, backups and logs. Do not use git add . or git add -A.
