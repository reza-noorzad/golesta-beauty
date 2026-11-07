# Phase 5A — focused blocker review

Assessment: **BLOCKED**. Compatible dependency fixes are applied and tested. Rules execution still requires Java 21+, and actual backend isolation/current Preview root settings remain unverified. No Phase 5B, commit, push, deployment, service-setting change or business-data mutation occurred.

## 1. Dependency security

Fresh npm audits ran before and after the fixes. Findings count affected dependency-tree packages, including propagated parent findings, not independent exploits.

| Scope | Before | After |
| --- | --- | --- |
| All dependencies | 34: 7 high, 27 moderate | 31: 5 high, 26 moderate |
| Omit development dependencies | 13: 5 high, 8 moderate | 12: 4 high, 8 moderate |
| Critical | 0 | 0 |

Only four installed leaf entries changed in package-lock.json:

| Package | Change | Scope / compatibility |
| --- | --- | --- |
| re2js | 2.8.6 → 2.8.7 | Runtime transitive of Firebase client Firestore; within existing ^2.8.3. New Node >=20 requirement fits existing Node 24. |
| body-parser | 1.20.8 → 1.20.9 | Development Firebase CLI/Express 4; compatible patch. |
| body-parser | 2.3.0 → 2.4.0 | Development Firebase CLI MCP/Express 5; compatible minor within the parent's range, needed for the fix. |
| fast-uri | 3.1.8 → 3.1.9 | Development Firebase CLI/AJV; compatible patch. |

Next 16.4.1, React 19.3.0, Firebase client 13.0.0, Firebase Admin 13.10.0, Firebase CLI 15.34.0, jwks-rsa, jose and package.json are unchanged. No forced audit fixes, new direct dependencies or overrides were introduced. The generic RE2JS update initially resolved a newer minor in the lockfile; it was narrowed to the exact first patched 2.8.7 release before installation/testing. npm's hidden install manifest also left three old dev folders in place despite the new lock entries; only those verified generated folders were refreshed. Actual installed versions now match the lockfile. Source/assets/backups were untouched.

Full remaining package names, severities, installed versions, dependency scope, ranges and advisory references are in DEPENDENCY_TRIAGE.json and DEPENDENCY_AUDIT.json. The five underlying remaining advisory-bearing packages are:

| Remaining package | Severity / tree | Usage and safe-update decision |
| --- | --- | --- |
| @grpc/grpc-js 1.9.16 | High, production-tree Firebase client Node dependency; also propagates to Firebase and rules-testing packages | Firestore client pins ~1.9.0, excluding patched 1.13.6/1.14.5+. Firebase Admin's separate gRPC is already 1.14.6. No app gRPC server/getAuthContext use was found. Advisory-specific server authentication/error-handler paths were not shown reachable. Do not replace the pinned range or downgrade Firebase to npm's suggested 9.14.0 blindly. A supported parent-SDK update or separately validated compatibility plan is required. |
| uuid 9.0.1 | Moderate, production Google SDK chain, also tooling | Advisory concerns v3/v5/v6 APIs with caller-provided output buffers. Inspected google-gax/teeny-request call v4; no app v3/v5/v6 use found. Patched >=11.1.1 is outside ^9 parent constraints. Upgrading Admin to npm's suggested 14.5.0 would be a major change and may affect ESM/jose/runtime compatibility. No unsupported override applied. |
| @opentelemetry/core 1.30.1 | Moderate, development-only Google Pub/Sub/Firebase CLI | Patched >=2.8.0 crosses the installed major; no unconditional parent upgrade/downgrade justified in this focused session. No production request path in this app identified. |
| glob 10.5.0 | Moderate, development-only CLI/archive/lint tooling | Advisory spans through 14.0.1. A fixed later major is outside existing consumers' ranges; no forced upgrade. |
| minimatch 9.0.9 / 10.2.6 | Moderate, development-only glob/typescript-eslint tooling | Fixed >=11.0.1 is outside installed major constraints. Updating/downgrading Next/eslint-config-next just to replace tooling transitives is not a minimal safe fix. |

The SDK/tooling parents listed in npm audit inherit these findings. Dependency presence is not proof of a reachable website exploit, but neither a passing build nor this limited call-site review clears an advisory. Outstanding upstream updates/compatibility validation or explicit risk acceptance remain necessary. No production vulnerability-free claim is made.

Primary maintainer evidence: [RE2JS fix](https://github.com/le0pard/re2js/security/advisories/GHSA-gg6h-894w-4m9c), [gRPC conditions/fixes](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j), [UUID conditions](https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq). Remaining advisory URLs/ranges are saved in the JSON audit.

Regression checks justified by the lockfile changes: production build including TypeScript PASS; 37 unit tests PASS; 22 admin/upload and 7 public API tests PASS; 12 focused authentication/services/QR browser tests PASS. A direct 4,000-match RE2JS lookbehind check and leaf-module load/version checks PASS. Firebase CLI starts and reports 15.34.0. An initial diagnostic used an unsupported package-export subpath and a sandboxed CLI config read failed; correcting the diagnostic path and allowing the read-only CLI check resolved those harness/environment issues. No application test failed. The earlier full 89-browser suite and ESLint result remain historical passing evidence; they were not unnecessarily rerun or represented as new full-suite results.

## 2. Java and rules testing

Java is not on PATH, JAVA_HOME is unset, and no java.exe was found under the checked common Adoptium/Microsoft/Java JDK locations or Android Studio runtime path. No Java installer was run. The installed firebase-tools 15.34.0 explicitly defines MIN_SUPPORTED_JAVA_MAJOR_VERSION = 21 in node_modules/firebase-tools/lib/emulator/commandUtils.js.

Install **JDK 21 LTS** (or a supported newer JDK). On Windows, download the Windows x64 JDK 21 MSI from [Eclipse Temurin](https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64&package=jdk). Follow the [official Windows installer instructions](https://adoptium.net/installation/windows/), enabling Add to PATH and JAVA_HOME. Reopen PowerShell after installation. If a JDK is already installed elsewhere, point JAVA_HOME to its actual installation and add its bin directory to PATH instead.

Exact continuation:

```powershell
Set-Location -LiteralPath 'C:\projects\golesta-beauty\v2'
java -version
# Must report major 21 or newer.
npm.cmd run test:rules
```

The npm script runs `firebase emulators:exec --project demo-golesta-v2 --only firestore,storage "node --test tests/rules.test.mjs"`. Keep that exact demo project; do not substitute a customer project. No .env loading or real database setup is required. Local emulator ports are 8080/9199. The earlier command stopped before tests with missing Java; this review checked the same missing prerequisite and did not repeat the known failing command. **Rules tests have not executed/passed.**

## 3. Preview configuration and resource isolation

Read-only connected Vercel project/deployment/environment metadata was reviewed for both projects. Existing deployment metadata now establishes:

| Item | Evidence / limit |
| --- | --- |
| Preview project | golesta-beauty; Next.js, Node 24.x, deployment protection enabled |
| Preview Git source | Most recent deployment returned by project API: reza-noorzad/golesta-beauty, development/golesta-v2, source git, target Preview/null |
| Production project | golesta-beauty-web; actual production deployment: same repository, branch main; untouched |
| Current project Git settings | Connector omits settings; history is evidence of a deployment's source, not proof of every current project setting |
| Root Directory | Required v2; not exposed by connector; unverified |
| CLI fallback | Installed CLI cannot inspect these projects in its available scopes. No login/link/setting changes attempted. |
| Framework/runtime | Preview Next.js + 24.x verified; package requires >=24.12.0 <25; unchanged SDKs build successfully locally |
| Preview variables | 12 shared Preview-target keys present; no branch-specific overrides observed in prior review |
| Production variables | No project-level entries returned. This does not rule out shared groups, integrations, deployment overrides or a different backend |

Required Preview names remain: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET. Server-only names must remain server-only. Values/credentials are not included here.

Only non-secret resource identifiers (public project ID/auth domain and Cloudinary cloud name) were read for comparison; no API secret/private key/token was fetched or printed. Preview's public auth domain matches its public project ID. The sensitive server project-ID entry is not returned by the API, so remote server/public ID equality cannot be confirmed. Four production public HTML paths (/, /review/, /scan/, /links.html) returned 200 with no Firebase/Firestore/Cloudinary markers or external script-src hosts. The equivalent local legacy pages also lack those markers. This is limited public read evidence, not an inventory of every production resource.

**Separate Vercel projects do not establish resource separation.** Current conclusions:

| Resource | Shared between Preview and Production? |
| --- | --- |
| Firebase project | **UNKNOWN** — production backend project identifier/purpose not available |
| Firestore database | **UNKNOWN** — application uses getFirestore(app), hence (default), with no separate database-ID setting |
| Firebase Authentication | **UNKNOWN** — app uses default project Auth; no independent test tenant is configured |
| Cloudinary product environment | **UNKNOWN** — Preview cloud name exists, production environment identity not available |
| Cloudinary parent/billing account | **UNKNOWN** — different cloud names would not alone prove different parent accounts |

If both environments use the same Firebase project, this implementation would share default Firestore and Authentication; changing a Vercel project name or a collection prefix would not isolate Auth. Firebase recommends [separate projects for workflow environments](https://firebase.google.com/docs/projects/dev-workflows/general-best-practices). A Cloudinary cloud name identifies a [product environment](https://cloudinary.com/documentation/cloudinary_glossary); several product environments may share one parent account. The application upload folder is golesta-v2, not an environment boundary. No live Firebase/Auth/Firestore/Cloudinary integration call or mutation was made.

## Exact owner checks still needed

1. In Vercel golesta-beauty → Settings, confirm Git repository and intended development Preview branch, Root Directory v2, Next.js framework and Node 24.x. Preserve production-branch behavior; do not change it just to satisfy a Preview check. Reconfirm golesta-beauty-web remains the separate production site.
2. Inspect Preview and actual production variable sources privately: project entries, shared environment groups, linked integrations, Git-branch overrides and deployed backend configuration. Empty production project metadata is not sufficient. Compare identifiers only; do not paste keys/tokens/private keys into reports.
3. In Firebase Console → Project settings → General, identify which project backs actual production and which is intended solely for Preview. Confirm Preview's public/server project IDs refer to the intended test project. In Firestore → Databases confirm IDs, especially (default); in Authentication confirm the project/user store and authorized Preview domains. If production truly does not use Firebase, explicitly record that fact and what the configured Preview project is used for; do not infer it from HTML alone.
4. In Cloudinary Console, identify production and Preview product environments/cloud names and their parent account/billing ownership. Verify Preview credentials belong to a test environment and that shared quotas/account access are acceptable. If production does not use Cloudinary, record that explicitly. A different folder alone is not isolation.
5. Provide an isolated test resource assignment/confirmation before any authenticated save, upload, account or moderation QA. Any provisioning/setting changes require a later explicit instruction; none were performed here.
6. Install/configure Java 21+ and run the demo rules command. Review the remaining dependency call-site/upgrade risks before release approval. Retain BLOCKED until those gates are resolved or explicitly accepted on evidence.

Only package-lock.json and release/status reports changed in this focused review. No source/UI changes, full-suite repetition, dependency-major upgrades, new branches, staging, commits, pushes, deployments, production configuration changes, customer writes or Phase 5B work occurred.
