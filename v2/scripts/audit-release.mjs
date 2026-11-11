import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync,spawnSync} from "node:child_process";
import {createHash,createPrivateKey} from "node:crypto";
const noCredentials=process.argv.includes("--no-credentials");
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const app=path.join(root,"v2"),reportDir=path.join(app,"release");fs.mkdirSync(reportDir,{recursive:true});
const git=(...args)=>execFileSync("git",["-c","core.safecrlf=false",...args],{cwd:root,encoding:"utf8",windowsHide:true,maxBuffer:10_000_000});
const entries=(...args)=>git(...args,"-z").split("\0").filter(Boolean);
function walk(directory,skip=new Set(["node_modules",".git",".next"])){
  if(!fs.existsSync(directory))return [];
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isSymbolicLink()?[]:entry.isDirectory()?(skip.has(entry.name)?[]:walk(path.join(directory,entry.name),skip)):[path.join(directory,entry.name)]);
}
const relative=file=>path.relative(root,file).split(path.sep).join("/");
const ignored=file=>{try{git("check-ignore","-q","--",file);return true;}catch{return false;}};
const files=walk(root),envFiles=files.filter(file=>path.basename(file).startsWith(".env"));
function parseEnv(file){
  const result={};const text=fs.readFileSync(file,"utf8");
  for(const match of text.matchAll(/^\s*([A-Za-z_][\w]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'([^']*)'|([^\r\n]*))/gm))result[match[1]]=(match[2]??match[3]??match[4]??"").trim().replace(/\\n/g,"\n");
  return result;
}
const privateValues=[];
for(const file of (noCredentials?[]:envFiles))for(const [key,value] of Object.entries(parseEnv(file))){
  if(!/(SECRET|PRIVATE_KEY|PASSWORD|TOKEN|CLIENT_EMAIL|CLOUDINARY_API_KEY)/.test(key)||value.length<8||/(your[_-]|example|replace|changeme|^<|^isolated|^demo-)/i.test(value))continue;
  privateValues.push(value,...(key.includes("PRIVATE_KEY")?value.split("\n").filter(line=>/^[A-Za-z0-9+/=]{40,}$/.test(line)):[]));
}
const candidateFiles=[...new Set(entries("ls-files","--cached","--others","--exclude-standard"))];
const findings=[];
const secretPath=/(?:^|\/)(?:\.env(?:\.|$)|[^/]*(?:credentials|service.?account|firebase-adminsdk|client_secret)[^/]*\.json$)|\.(?:pem|key|p12|pfx|jks)$/i;
const credentialPatterns=[[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]{40,}?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,"private key block"],[/\b(?:ghp_|gho_|ghu_|ghs_)[A-Za-z0-9]{36,}\b/,"GitHub credential"],[/\bAKIA[0-9A-Z]{16}\b/,"AWS access key"],[ /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,"GitHub fine-grained credential"],[/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b/,"OpenAI credential"],[/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/,"JWT-shaped token"],[/cloudinary:\/\/[^\s:]+:[^\s@]+@/,"Cloudinary credential URL"]];
function scan(file,label){
  const buffer=fs.readFileSync(file);
  const utf16=buffer[0]===255&&buffer[1]===254;if(!utf16&&buffer.includes(0))return;const text=buffer.toString(utf16?"utf16le":"utf8");
  if(privateValues.some(value=>text.includes(value)))findings.push({file:label,rule:"known private environment value (redacted)"});
  for(const match of text.matchAll(/\b(?:CLOUDINARY_API_SECRET|FIREBASE_PRIVATE_KEY|OPENAI_API_KEY|ACCESS_TOKEN|CLIENT_SECRET)\s*["']?\s*[:=]\s*["']([^"'\r\n]{16,})["']/g)){if(!/(?:your|example|replace|change|isolated|synthetic|demo|fixture|test|<)/i.test(match[1]))findings.push({file:label,rule:"suspicious literal secret assignment"});}
  for(const [pattern,rule] of credentialPatterns)if(pattern.test(text))findings.push({file:label,rule});
}
for(const file of candidateFiles){
  if(secretPath.test(file)){findings.push({file,rule:"credential-like path eligible for staging; contents not read"});continue;}
  const full=path.join(root,file);if(fs.existsSync(full)&&fs.statSync(full).isFile())scan(full,file);
}
const exposureFiles=walk(path.join(app,".next/static"),new Set()).concat(walk(path.join(app,".next/server/app"),new Set()).filter(file=>/\.(?:html|rsc)$/.test(file)));
for(const file of exposureFiles)scan(file,relative(file));
const local=!noCredentials&&fs.existsSync(path.join(app,".env.local"))?parseEnv(path.join(app,".env.local")):{};
const required=["NEXT_PUBLIC_FIREBASE_API_KEY","NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN","NEXT_PUBLIC_FIREBASE_PROJECT_ID","NEXT_PUBLIC_FIREBASE_APP_ID","NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET","NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID","FIREBASE_PROJECT_ID","FIREBASE_CLIENT_EMAIL","FIREBASE_PRIVATE_KEY","CLOUDINARY_CLOUD_NAME","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET"];
let privateKeyParses=null;if(!noCredentials)try{createPrivateKey(local.FIREBASE_PRIVATE_KEY||"");privateKeyParses=true;}catch{privateKeyParses=false;/* Only the boolean is reported. */}
const probes=["v2/.env.local","v2/v2/.env.local","v2-backup-before-complete/.env.local","backup/.env.local","Backup/config.json","v2/gcp-service-account.json","v2/client_secret.json","backup.zip","v2/node_modules/private.txt","v2/.next/static/chunk.js","v2/reference/old.txt"];
const localConfiguration=noCredentials?{checked:false,reason:"Credential retrieval prohibited; environment values and private keys were not read"}:{keys:required.map(key=>({key,present:Boolean(local[key])})),firebaseProjectIdsMatch:Boolean(local.FIREBASE_PROJECT_ID&&local.FIREBASE_PROJECT_ID===local.NEXT_PUBLIC_FIREBASE_PROJECT_ID),privateKeyParses};
const report={mode:noCredentials?"credential-free":"known-value-comparison",credentialsRead:!noCredentials,knownPrivateValueComparison:!noCredentials,scope:"Working-tree tracked/unignored files and client/static build output; no separate index-blob, Git-history or remote rotation audit",valuesRedacted:true,candidateFilesScanned:candidateFiles.length,buildFilesScanned:exposureFiles.length,findings,environmentFiles:envFiles.map(file=>({path:relative(file),ignored:ignored(relative(file)),contentsRead:!noCredentials,keyNames:noCredentials?null:Object.keys(parseEnv(file))})),localConfiguration,ignoreProbes:probes.map(file=>({path:file,ignored:ignored(file)}))};
fs.writeFileSync(path.join(reportDir,"SECURITY_SCAN.json"),JSON.stringify(report,null,2)+"\n");
if(process.argv.includes("--dependencies")){
  const audit={};for(const [scope,command] of [["all","npm.cmd audit --json"],["production","npm.cmd audit --omit=dev --json"]]){
    const result=spawnSync(process.env.ComSpec||"cmd.exe",["/d","/s","/c",command],{cwd:app,encoding:"utf8",windowsHide:true,timeout:60_000,maxBuffer:10_000_000});
    try{const data=JSON.parse(result.stdout);audit[scope]={command,exitCode:result.status,metadata:data.metadata,packages:Object.values(data.vulnerabilities||{}).map(item=>({name:item.name,severity:item.severity,direct:item.isDirect,range:item.range,fixAvailable:item.fixAvailable,nodes:item.nodes,via:item.via}))};}
    catch{audit[scope]={command,exitCode:result.status,error:"Audit unavailable; raw output omitted to protect configuration."};}
  }fs.writeFileSync(path.join(reportDir,"DEPENDENCY_AUDIT.json"),JSON.stringify(audit,null,2)+"\n");
  console.log(JSON.stringify({dependencyAudit:Object.fromEntries(Object.entries(audit).map(([scope,value])=>[scope,{exitCode:value.exitCode,counts:value.metadata?.vulnerabilities,error:value.error}]))}));
}
const changed=[...new Set([...entries("diff","--name-only"),...entries("diff","--cached","--name-only"),...entries("ls-files","--modified","--others","--exclude-standard")])].sort();
const config=/^v2\/(?:package(?:-lock)?\.json|next\.config\.ts|tsconfig\.json|eslint\.config\.mjs|playwright(?:\.public-webkit)?\.config\.ts|firebase\.json|firestore\.rules|storage\.rules)$/;
const application=changed.filter(file=>/^v2\/src\//.test(file)||config.test(file));
const tests=changed.filter(file=>/^v2\/tests\//.test(file));
const scripts=changed.filter(file=>/^v2\/scripts\//.test(file));
const documentation=[...new Set(changed.filter(file=>file===".gitignore"||file==="PROJECT_STATUS.md"||file.startsWith("v2/release/")).concat("v2/release/STAGING_PLAN.json"))].sort();
const allowed=new Set([...application,...tests,...scripts,...documentation]);
const plan={branch:git("branch","--show-current").trim(),head:git("rev-parse","--short","HEAD").trim(),stagingPerformed:false,application,tests,scripts,documentation,holdForSeparateReview:changed.filter(file=>!allowed.has(file)),note:"Explicit allowlist only; do not git add ., force-add ignored files, or deploy the whole working tree. Review held historical docs, checksums and whitespace-only assets separately.",sha256:Object.fromEntries([...allowed].filter(file=>file!=="v2/release/STAGING_PLAN.json"&&fs.existsSync(path.join(root,file))).sort().map(file=>[file,createHash("sha256").update(fs.readFileSync(path.join(root,file))).digest("hex")]))};
const reviewedReasons={"v2/scripts/verify-rules-local.mjs":"Guarded demo-only Rules execution and hash-bound emulator evidence","PROJECT_STATUS.md":"Current gates, historical/current distinction and checkpoint guidance","v2/package-lock.json":"Supported XML parser/helper fix only","v2/playwright.public-webkit.config.ts":"Loopback-only desktop/iPhone-profile WebKit QA","v2/src/app/page.tsx":"Minimal gallery opener focus restoration","v2/src/components/public/PublicHeader.tsx":"Preserve desktop Startseite link","v2/src/components/public/ProductsComingSoon.tsx":"Preserve decorative g removal","v2/tests/dependency-security.test.mjs":"Five offline dependency/SDK/XML regression cases","v2/tests/public-navigation.spec.ts":"Twelve responsive/subpage navigation and header cases","v2/tests/public-site.spec.ts":"Touch/focus regression and safe test artifact paths","v2/scripts/audit-release.mjs":"Credential-free scan mode and current manifest generation","v2/release/BLOCKER_REVIEW.md":"Reconciled blockers with historical review retained","v2/release/DEPENDENCY_AUDIT.json":"Existing current all/production audits; unchanged in reconciliation","v2/release/DEPENDENCY_TRIAGE.json":"Existing usage/version/range triage; unchanged in reconciliation","v2/release/PREVIEW_READINESS.md":"Authoritative matrix and exact checkpoint scope","v2/release/RESOURCE_ISOLATION.json":"Current metadata, unknown boundaries and historical provenance","v2/release/SECURITY_SCAN.json":"Credential-free path/pattern/build review, no private-value comparison","v2/release/STAGING_PLAN.json":"Exact recommendation, hashes and held paths; no staging","v2/release/VERIFICATION_RESULTS.json":"Current scoped QA, evidence hashes, gates and Phase 5A history"};
plan.recommendations=[...allowed].sort().map(file=>({path:file,action:"RECOMMEND",reason:reviewedReasons[file]||(application.includes(file)?"Reviewed Phase 5B application/configuration change":tests.includes(file)?"Focused regression/QA evidence":scripts.includes(file)?"Credential-free scan and safe manifest generation":"Current release/status evidence"),sha256:plan.sha256[file]||null}));
plan.held=plan.holdForSeparateReview.map(file=>({path:file,action:"HOLD",reason:file.startsWith("v2/public/")?"Inherited status/whitespace-only asset or QR change; preserve separately":file==="tatus --short"?"Untracked terminal/status capture; unrelated to the application":"Inherited historical packaging/install/version documentation or checksum; needs separate editorial review"}));
plan.authorization="Recommendation only. No staging, commit, push, deployment or release performed or authorized.";
plan.selfHashNote="STAGING_PLAN.json is included in the recommendation but has no recursive self-hash.";
fs.writeFileSync(path.join(reportDir,"STAGING_PLAN.json"),JSON.stringify(plan,null,2)+"\n");
console.log(JSON.stringify({secretFindings:findings.length,eligibleFiles:candidateFiles.length,buildFilesScanned:exposureFiles.length,environmentFiles:report.environmentFiles.map(({path,ignored})=>({path,ignored})),allIgnoreProbesPass:report.ignoreProbes.every(probe=>probe.ignored),localConfiguration:report.localConfiguration,stagingPlan:{application:application.length,tests:tests.length,scripts:scripts.length,documentation:documentation.length,held:plan.holdForSeparateReview.length}}));
if(findings.length||report.environmentFiles.some(file=>!file.ignored)||report.ignoreProbes.some(file=>!file.ignored))process.exitCode=1;
