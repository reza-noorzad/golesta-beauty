# V2.3 final launch fixes — 2026-11-12

**Launch decision: NO-GO pending complete legal details and owner approval.**
The technical changes pass their focused checks. The legal routes are explicitly
marked review drafts, with `noindex, nofollow`; they must not be deployed as final
legal notices. No publication approval or dependency-risk acceptance is implied.
The existing staged deployment at `b669d864` is unchanged by this local checkpoint.

## Changes

- `/impressum` and `/datenschutz` now have server-rendered pages and persistent
  public-footer links. Their text remains readable when public APIs fail.
- The pages reuse the existing public salon name, address, telephone and email.
  No team-member name was inferred to be the legal proprietor. No legal form,
  registration, VAT number, supervisory authority or contractual claim was invented.
- `/review` now redirects to the existing Google place-review URL that the owner
  explicitly verified and approved during this task:
  `https://search.google.com/local/writereview?placeid=ChIJu9YCaU-BcEcRATRKa-dAT4A`.
  Incoming personal query data and `next` destinations are ignored. GET, HEAD,
  slash and index variants are covered without following the external destination.
- No product-catalog, dependency, authentication, live-data or provider-setting changes.

## Inspected processing and evidence

| Processing | Evidence in this application | Still requires owner confirmation |
| --- | --- | --- |
| Hosting and request/error handling | Vercel hosts pages, APIs and optimized media. `server/http.ts` logs generic error names. Existing staged deployment metadata reports `iad1`; do not claim EU-only hosting. | Contracting entity, applicable DPA/transfer terms, platform analytics/drains/access controls and actual log retention. |
| Public salon data | `PublicSite.tsx` and `content-client.ts` fetch `/api/content` and `/api/services` on mount, focus and a 60-second interval. Server APIs read Firestore. Public projection filters publication status and hides the catalog. | Legal grounds and retention for team biographies, photos and other personal content. |
| Firebase Authentication/browser storage | `content-client.ts` imports `firebase.ts`, which initializes Auth with IndexedDB/local/session/in-memory persistence. This import is also reached on public pages. It is not admin-only initialization. | Legal assessment of this public-page initialization/storage, actual provider processing and whether a consent or technical change is required. No consent exemption is asserted. |
| Admin accounts and changes | Firebase Auth handles email/password sign-in; server verifies bearer tokens and `admins/{uid}`. Admin documents/content may store roles, creator/editor UID and timestamps. | Responsible entity, staff notification, account/deletion policy, provider contracts and access permissions. |
| Cloudinary images | Admin upload decodes/resizes/converts images with Sharp and sends WebP to Cloudinary. Firestore stores UID-keyed upload counters. A one-hour counter window is not an automatic deletion policy. | Image rights/consent, actual Cloudinary contract, media deletion/retention and transfer safeguards. |
| Firebase Storage/optimized images | Allowed stored image URLs include Firebase Storage and Cloudinary. Public images use Next Image optimization; an upstream fetch is not proof of direct browser contact with every provider. | Actual stored asset providers and their retention/access settings. No new bucket upload or live asset inspection was performed. |
| Historical product reviews | Public GET/POST review routes are disabled by the unchanged catalog switch. Authorized moderation can still read existing names, ratings, comments, status and timestamps, if present. | Retention/deletion and legal grounds for existing records. No assumption that disabling the catalog deleted them. |
| Contact and external links | Phone, mailto, WhatsApp, Instagram, Google Maps, approved Google reviews and owner-editable social links. No embedded map/feed found. The review redirect drops incoming query data. | Email host, WhatsApp/other contact workflows, their legal grounds, retention and provider relationships. |
| Fonts, tracking and cookies | `next/font/google` downloads fonts during build and self-hosts them. No app analytics SDK, advertising pixel, iframe widget, cookie setter or consent manager was found in the inspected source. Firebase storage and Vercel protection still prevent a blanket cookie-free claim. | Platform-injected features/cookies, final tracking/storage assessment and any required consent mechanism. A public-source inspection does not certify all account-level configuration. |

The draft describes confirmed technical behavior and marks unresolved legal facts.
It does not claim that DPAs were signed, consent was obtained, data remains in the
EEA, exact deletion periods are implemented, or the final notice is legally complete.
No new live provider call/write, customer submission, upload or administrator was used.

## Exact remaining owner approvals

1. Supply/approve the legal proprietor or entity name and legal form, official
   business address, and the party responsible for the website/privacy notice.
   Confirm the existing public contact data. The team profile is not identity proof.
2. Supply applicable registration/GISA and register-court details, chamber/trade
   and professional details, supervisory authority, VAT identification and media
   disclosure; explicitly confirm which requirements do not apply. Missing values
   are not evidence that the business is unregistered or VAT-exempt.
3. Approve the completed privacy text with legal grounds per processing activity,
   purposes, recipients/contracting entities, actual retention/deletion periods,
   international transfers/safeguards, and the appropriate contact for rights.
4. Confirm provider contracts/configuration for Vercel, Google Firebase and
   Cloudinary; email/WhatsApp workflows; staff/person-image rights; and the legal
   treatment of Firebase initialization/storage on public pages. No consent or
   DPA status is inferred from installing an SDK.
5. Review the final text after these facts are incorporated. Only then remove draft
   warnings/noindex and authorize any later deployment. These drafts are not final
   legal notices and must not be released as such.
6. Separately accept or resolve the previously reported dependency risks before
   public launch. This task does not revisit or silently accept those risks.

The Google review destination approval is **complete**; no further approval for
that exact destination is required. Push, deployment and both-domain cutover remain
separate actions and are not authorized here.

## Focused validation

- Next route type generation and TypeScript: PASS.
- Targeted ESLint on the seven changed application/test files: PASS.
- Production build including TypeScript and 29 generated static pages: PASS.
- New legal/footer/review tests plus three legacy cases: **8 passed / 0 failed**,
  headless Edge, 390px/1280px where relevant.
- Browser API calls are mocked and external requests aborted. Verification uses an
  isolated source copy, inert demo browser settings and no server credentials.
  No live Firestore/Auth/Cloudinary writes or external Google review navigation.
- Initial isolated-build root/font-access failures were verification-environment
  issues; correcting only the scratch configuration/network access produced the
  successful final production build. Application configuration was not changed.
- Full completed suites/audits were not repeated. Existing 15 held paths are
  excluded from staging and checked against their starting byte hashes.

## Primary references used for the review

- [WKO: imprint requirements differ by legal/business status](https://www.wko.at/internetrecht/website-impressum-eu).
- [WKO: privacy information checklist](https://www.wko.at/bgld/wirtschaftsrecht-gewerberecht/checkliste-datenschutzerklaerung-infopflichten-dsgvo-tkg.pdf).
- [Austrian DSB: data-subject rights](https://dsb.gv.at/rechte-pflichten/ihre-rechte-als-betroffene-person).
- [Firebase privacy/security](https://firebase.google.com/support/privacy).
- [Vercel DPA](https://vercel.com/legal/dpa).
- [Cloudinary privacy policy](https://cloudinary.com/privacy).
- Installed Next.js 16.4.1 documentation: `page.md`, `route.md`, `font.md`.

Provider publications describe their services, not this salon's contract acceptance,
account configuration or consent evidence. No third-party template was copied as an
approved salon policy.
