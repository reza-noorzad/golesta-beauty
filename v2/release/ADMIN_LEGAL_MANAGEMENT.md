# Admin legal management — 2026-11-12

Implemented and verified locally. Nothing pushed, deployed, migrated or written to
live Firebase/Cloudinary. This replaces the previous static legal-draft pages with
owner-managed published documents; the earlier launch report remains historical.

## Owner workflow

Open **Rechtliches & Datenschutz** (`/admin/rechtliches`). Admin and superadmin can
edit and save drafts of Impressum and Datenschutzerklärung independently. Editors
cannot access this feature or retrieve its drafts through the older content API.

1. Enter the actual proprietor/entity, legal form, official address, email and phone.
   Complete applicable register/court, GISA, UID, chamber, supervisory authority,
   professional/regulatory and disclosure details. Optional fields may stay empty
   only after checking that they do not apply; absence is not automatic exemption.
2. Enter the approved privacy notice as titled, plain-text sections (up to 12).
   No policy is generated or automatically copied into an approved state. Review
   purposes, legal grounds, recipients/providers, retention, international transfers,
   rights, contact workflows and browser storage using the earlier processing review.
3. Use **Vorschau** to inspect the current local text without a public write.
4. Use **Entwurf speichern**. A saved draft is private and is not approval.
5. The salon owner, using the superadmin role, reviews the saved version and checks
   the explicit approval checkbox for that document, then selects **Veröffentlichen**.
   The server publishes exactly that saved draft, with server-supplied actor/date.
   Each document needs its own approval. Edits and draft saves clear its checkbox.

Status, draft-update date and publication date are displayed. Editing/saving a new
draft preserves the last published version. Unsaved edits in the other document
survive a save or publication. Conflicts retain the local text; explicit reload asks
before discarding unsaved changes. Dates display in Europe/Berlin.

## Storage and authorization

- Existing document: `golestaV2/content`; optional `data.legal.impressum` and
  `data.legal.privacy` contain independent `draft` and `published` snapshots.
- Old records without `legal` read as empty/unpublished without a migration/write.
  No default legal identity, generated privacy notice or publication is seeded.
- `/api/admin/legal` GET/PATCH uses existing bearer-token/active-profile checks.
  Draft writes allow admin/superadmin; publication requires superadmin plus
  `approved: true`. Current actor role/status is re-read in the transaction.
- Strict action/content validation rejects forged metadata/extra fields, oversized
  bodies, duplicate section IDs and incomplete publication. Drafts may be incomplete.
  Human legal verification is represented by the owner's explicit approval, not
  inferred from passing syntactic checks.
- Transactions use the existing shared content revision to reject stale writes.
  Legal changes preserve unrelated raw content fields and document metadata.
- General content PUT cannot change legal snapshots. Older clients omitting `legal`
  preserve existing legal data; editor GET omits it entirely.
- Public `/api/content` returns only approved published snapshots and publication
  dates, never drafts or private audit UIDs. The projection is idempotent.
- Public pages use the existing public content loader and display only that published
  snapshot. Missing/unavailable content produces a neutral status/contact link,
  without a draft fallback. Footer links remain visible. Existing noindex metadata
  is retained; indexing is not used as a privacy control.
- Preview/public rendering shares a plain-text React renderer; no raw HTML,
  Markdown execution or user-supplied script/style injection. Existing Firestore
  rules already deny direct client writes to this document and are unchanged.

The approved Google Review route and disabled catalog switch are byte-for-byte
unchanged. No authorization bypass, new Firebase project or public write endpoint.

## Validation

- Next route type generation and TypeScript: PASS.
- Targeted ESLint: PASS.
- Production build including TypeScript: PASS, 31 generated static pages.
- 12 focused in-memory API/security/rendering tests: PASS.
- 8 selected existing content/public/role API regressions: PASS.
- 12 focused browser/HTTP cases: PASS (11 initially; one conflict test was rerun
  after restricting its alert locator to exclude Next's route announcer).
- Browser checks cover owner draft/preview/publish at 390px and 1280px, independent
  approvals, publication persistence, unsaved other-document preservation, conflict
  handling, admin/editor restrictions, public published-only rendering, escaped HTML,
  API failure states, footer links and preserved review/QR compatibility.
- Verification used an isolated source copy, inert demo configuration, in-memory
  Firebase boundaries and intercepted browser requests. No real write tests or
  live records were used. The Windows sandbox's tsx account-lookup limitation was
  resolved by running those isolated tests outside that process restriction.
- All 15 historical held paths are excluded from this commit and verified against
  their starting bytes/status. No completed generic audit or unrelated suite rerun.

Focused API command from `v2`:
`node --experimental-test-module-mocks --import tsx --test tests/legal-routes.test.mts`

Focused browser files (local inert server only): `tests/admin-legal.spec.ts`,
`tests/launch-legal.spec.ts`, `tests/legacy-links.spec.ts`.

## Remaining production gates

The feature is functional locally but not deployed. Neither document is populated
or published in live Firestore by this task. The owner must enter legally complete,
verified content and separately approve/publish both documents after an authorized
deployment. Software validation does not determine legal sufficiency. Previously
reported dependency risks still require explicit acceptance or remediation; none
were silently accepted. Push, deployment and domain cutover remain separate actions.

## Exact reviewed files (repository-relative)

```text
v2/src/app/admin/rechtliches/page.tsx
v2/src/app/api/admin/content/route.ts
v2/src/app/api/admin/legal/route.ts
v2/src/app/datenschutz/page.tsx
v2/src/app/impressum/page.tsx
v2/src/components/admin/AdminShell.tsx
v2/src/components/admin/LegalEditor.tsx
v2/src/components/public/LegalDocumentBody.tsx
v2/src/components/public/LegalPage.tsx
v2/src/components/public/PublishedLegalPage.tsx
v2/src/lib/admin-api.ts
v2/src/lib/content.ts
v2/src/lib/legal.ts
v2/tests/admin-legal.spec.ts
v2/tests/launch-legal.spec.ts
v2/tests/legal-routes.test.mts
v2/tests/support/admin-browser.ts
v2/tests/support/legal-fixture.ts
v2/release/ADMIN_LEGAL_MANAGEMENT.md
```
