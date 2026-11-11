# Phase 5B - release gate reconciliation (2026-11-11)

Current decision: **BLOCKED for release**; a reviewable checkpoint is separate from deployment approval. Java **21.0.13+9-LTS is VERIFIED**, not missing. Existing baseline Preview **9f81aeb is VERIFIED READY** but excludes local Phase 5B. Rules emulator pass is now **VERIFIED**: existing case passed 1/0, exit 0, in two isolated demo runs with 18 assertions; current source/config/lock and logs are hash-bound. Residual findings: **30 all / 12 production**, no risk acceptance. Current Vercel root/Git and backend isolation: **REQUIRES OWNER CONFIRMATION**.

Preserved evidence: navigation Edge **33/0**; final Windows WebKit **42/0** (33 desktop + 9 iPhone profile); focused Edge **3/0** after minimal gallery focus fix; offline dependency **5/0**; mocked admin/upload **22/0**; latest typecheck/lint/build passed, **26 static pages**. These are saved results, not newly repeated suites or physical Safari/live integration proof.

Fresh credential-free review: **0 findings** across **204 eligible paths / 119 build files**. Guard observed **0 credential reads / 0 private-key parses**. Earlier **10 synthetic detector cases passed, 0 failed** remain historical; current helper syntax and targeted lint pass. All **196 protected eligible-file hashes** match this task's starting snapshot, with **7 existing report/helper edits plus 1 new runner**. The ignored historical log exception is disclosed below. Exact recommendation: **19 files**, **15 held paths**, nothing staged. This does not prove absence of every secret or audit Git history/credential validity.

See [PREVIEW_READINESS.md](PREVIEW_READINESS.md) for the current matrix, file-by-file checkpoint list and owner-independent actions; JSON reports bind the local evidence. Available Java enabled the completed local demo Rules test without Firebase Console/owner phone or a new project. An authorized account admin must confirm actual resource assignments privately; separate Vercel projects are not isolation proof. No credentials retrieved, live resource calls/writes, settings changes, staging, commit, push or deployment.

## Historical Phase 5A - focused blocker review (2026-11-07)

The following Phase 5A sections preserve their original evidence, including the then-missing Java prerequisite and no-Phase-5B scope. Current Java, HEAD, phase and release gates are superseded above.


> Current 2026-11-11 Phase 5B dependency update is appended below: 30 all / 12 production affected packages remain. The Phase 5A sections retain historical evidence.

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

## Phase 5B — dependency review, 2026-11-11

This is the current dependency assessment; the Phase 5A sections above retain historical evidence. Branch remains `development/golesta-v2`, local HEAD `9f81aeb`. No live backend, Vercel, Git publishing or production operations were performed.

### Fresh audit outcome

| Scope | Before this fix | After this fix |
| --- | --- | --- |
| All dependencies | **31: 5 high, 25 moderate, 1 low** | **30: 5 high, 25 moderate** |
| Production (`--omit=dev`) | **13: 4 high, 8 moderate, 1 low** | **12: 4 high, 8 moderate** |
| Development-only difference | 18: 1 high, 17 moderate | 18: 1 high, 17 moderate |
| Critical | 0 | 0 |

Both final audits exit **1**, because findings remain. Counts include affected parents; they are not counts of independent exploits. The remaining 30 package findings trace to **five advisory-bearing packages / six advisories**. The extra development high is a propagated rules-testing/Firebase finding, not another independently identified high-severity defect.

Before changing dependencies, fresh registry results added the low XML advisory and stopped reporting the propagated `eslint-config-next` finding. This changed the prior Phase 5A count distribution; it is not a fix or dependency change credited to this task. Full before/after JSON, installed versions, ranges and primary advisory assessments are recorded in DEPENDENCY_AUDIT.json and DEPENDENCY_TRIAGE.json.

### One compatible fix applied

- `fast-xml-parser 5.11.2 -> 5.12.0`, a compatible minor inside `@google-cloud/storage@7.22.0`'s existing `^5.3.4` range. Its required helper `is-unsafe 2.0.2 -> 2.0.3` is the only other changed lock entry. Package.json, all SDK/framework versions and all other lock entries remain unchanged; no override or new direct dependency.
- [Maintainer advisory GHSA-474x-hrwr-fgx4](https://github.com/NaturalIntelligence/fast-xml-parser/security/advisories/GHSA-474x-hrwr-fgx4): the CPU issue needs non-default `stopNodes` and malformed tag fragments. Cloud Storage's inspected TransferManager uses a default parser; the app uploads images through Cloudinary/Sharp and has no direct XML/TransferManager endpoint. That specific application exposure was not demonstrated. The supported library fix nevertheless removes the advisory.
- The [5.12.0 changelog](https://raw.githubusercontent.com/NaturalIntelligence/fast-xml-parser/v5.12.0/CHANGELOG.md) and registry metadata were checked before selecting the release. A candidate 5.11.3 metadata lookup returned 404; no such package was installed.
- npm's hidden install manifest initially claimed the new versions while the physical files stayed old. Only the two checked generated directories were moved into ignored `.backups/phase5b-dependency-20261111/`, then reinstalled with lifecycle scripts disabled. Actual installed versions now match the reviewed lockfile. Original source, prior backups and navigation work were not removed.

### Remaining advisories and actual usage

| Package / severity | Reviewed exposure | Compatible-update decision |
| --- | --- | --- |
| `@grpc/grpc-js 1.9.16`, **high + low**, production tree | High requires server certificate authentication via getAuthContext with permissive client-certificate settings; low concerns crashing gRPC server handlers disclosing errors. No matching app server/handler path found. This copy belongs to the Firebase client Node tree; Admin/google-gax separately uses patched 1.14.6. | Installed Firestore 4.18.0 and checked latest 4.19.1 still pin ~1.9.0. Firebase 13.2.0 retains that constraint. Combined maintainer fixes are available in 1.13.7/1.14.6, outside the pin. No Firebase downgrade or unsupported override. |
| `uuid 9.0.1`, **moderate**, production tree | Advisory affects v3/v5/v6 output-buffer bounds. Inspected google-gax, teeny-request and three affected gaxios copies use v4 without an output buffer; app IDs use crypto.randomUUID. No matching application call found. | Fixed 11.1.1+ crosses all parents' ^9 constraints. Latest checked Google SDK/gaxios/teeny versions within current majors are already installed. Admin 13.10.0 is latest checked v13; npm's 14.5.0 suggestion is a separate major-risk decision. |
| `@opentelemetry/core 1.30.1`, **moderate**, development only | Oversized inbound baggage extraction; no app propagator/public request path identified. Present through Pub/Sub used by Firebase CLI. Hostile tooling input remains relevant. | Latest Pub/Sub v5 is still 5.3.1 with core ^1.30.1. Fixed core 2.8.0 is outside that range; CLI 15.35.0 still selects Pub/Sub v5. |
| `glob 10.5.0`, **moderate**, development only | Cancellation may fail to stop filesystem traversal. Used by CLI/archive/tooling, with no app traversal endpoint found. Local/CI resource exhaustion remains possible under hostile workloads. | Fixed >=14.0.2 is outside ^10 consumers, including checked CLI 15.35.0. No forced major substitution. |
| `minimatch 9.0.9 / 10.2.6`, **moderate**, development only | Pattern amplification at optimizationLevel>=2; glob sets level 2. No public pattern endpoint found. Maintainer reproduction is 10.2.6; npm also flags 9.0.9 under >=7 <11.0.1. v9 exploitability was not independently reproduced. | Fixed 11.0.1 is outside ^9/^10 constraints; checked typescript-estree 8.72.2 still uses ^10.2.2. No Next/eslint downgrade. |

Primary sources: [gRPC high](https://github.com/grpc/grpc-node/security/advisories/GHSA-m9gg-hp2v-232j), [gRPC low](https://github.com/grpc/grpc-node/security/advisories/GHSA-f596-whhp-79r4), [UUID](https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq), [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-8988-4f7v-96qf), [glob](https://github.com/isaacs/node-glob/security/advisories/GHSA-3g3m-2fjr-6pw4), [minimatch](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249). Findings retain their audit severity; lack of a demonstrated application path is neither automatic risk acceptance nor removal of the advisory.

### Regressions and preserved work

| Check | Actual new result |
| --- | --- |
| `node --test tests/dependency-security.test.mjs` | **5 passed / 0 failed**: installed lock match, SDK imports without app initialization, multipart XML, UTF-8/CRLF and a bounded malformed-stop-node subprocess (about 48ms, 2s deadline). |
| `npm.cmd run test:admin-api` | **22 passed / 0 failed**, Firebase/Auth/Firestore/Cloudinary boundaries mocked; no environment files loaded by these tests. |
| `npm.cmd run build` | PASS, including TypeScript and **26/26** static pages; inert process-only backend configuration. |
| Targeted ESLint for the new dependency test | PASS. |
| Phase 5B navigation browser suite | **33 passed / 0 failed remains prior evidence**, preserved, deliberately not rerun. No UI/client dependency changes justify repetition. |

No full unit/browser/public-API/rules/audit-release suite was repeated without a relevant change. No Firebase CLI service command was run. Catalog stays false. Safe rollback is to restore only the two reviewed lock entries from the ignored lock snapshot and re-resolve/install those generated dependencies, then repeat relevant checks; do not reset the user's tree or copy stale hidden install metadata.

### Decision and next actions

**Preview release approval remains BLOCKED.** The high finding has no matching server path in the review, but official findings remain. Await supported parent fixes, or separately review a deliberate SDK migration/explicit scoped risk decision; do not run npm audit fix --force. Treat development/CI inputs as potentially hostile while tooling advisories remain.

At that dependency-review checkpoint, Java/emulator, Vercel root/Git and resource-isolation gates were not rechecked. The reconciliation above supersedes missing-Java/old-Preview claims. No new project, credential change, catalog activation, commit, push, deployment or live resource access. The staging manifest must be refreshed and reviewed before any later approved commit.

## Firebase Rules gate update - 2026-11-11

**VERIFIED:** `npm.cmd run test:rules` invoked via new `scripts/verify-rules-local.mjs` from v2: **1 passed / 0 failed / 0 skipped, exit 0**, twice for the same case, 18 assertions per run. Java 21.0.13; cached Firestore 1.22.0 and Storage rules runtime 1.1.3 match installed metadata hashes. Only demo-golesta-v2/local emulators and mock identities; clean environment/CLI config, Node loopback guards, no credentials/project creation/live service use. Two nonexistent .npmrc probes were blocked before read; no remote attempts observed. All emulators shut down. No existing rules/config/tests/package changes, no unrelated test suite repeated.

Evidence and exact reproduction: VERIFICATION_RESULTS.json / PREVIEW_READINESS.md. The new runner corrects a first-run log-redirection defect: the old ignored root firestore-debug.log was overwritten and could not be recovered; corrected run redirected and preserved root bytes. This exception remains explicit; app/source/tests/lock and unrelated tracked/untracked files are preserved. Safe checkpoint list now 19 files, 15 held; no staging.

Independent release gates remain: residual dependency release decision BLOCKED, actual Vercel settings and Firebase/Cloudinary isolation REQUIRES OWNER CONFIRMATION, physical/live integration QA and undeployed local Preview BLOCKED. No commit/push/deploy or live rules changes.
