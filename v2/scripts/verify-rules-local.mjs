import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import net from "node:net";
import dns from "node:dns";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import assert from "node:assert/strict";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const project = "demo-golesta-v2";
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const hash = (file) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function installGuard() {
  const run = path.resolve(process.env.GOLESTA_RULES_RUN_DIR || "");
  assert.ok(run.startsWith(path.join(app, "test-results") + path.sep), "Missing isolated artifact directory");
  const evidence = { pid: process.pid, localConnections: {}, blockedRemote: 0, blockedCredentialReads: 0, blockedCredentialPaths: [] };
  const originalRead = fs.readFileSync.bind(fs);
  const originalWrite = fs.writeFileSync.bind(fs);
  const checkFile = (file) => {
    if (typeof file === "number") return;
    const name = path.resolve(file instanceof URL ? fileURLToPath(file) : String(file));
    const normalized = name.replaceAll("\\", "/");
    const privateFile = /(?:^|\/)\.env(?:\.|$)|(?:credentials|service.?account|firebase-adminsdk|client_secret)[^/]*\.json$|\.(?:pem|key|p12|pfx|jks)$|(?:^|\/)\.npmrc$|\/configstore\/firebase-tools\.json$/i;
    if (privateFile.test(normalized) && !name.startsWith(run + path.sep)) {
      evidence.blockedCredentialReads++;
      evidence.blockedCredentialPaths.push({ name: path.basename(name), exists: fs.existsSync(name) });
      throw new Error("Rules isolation blocked a credential-file read");
    }
  };
  for (const method of ["readFileSync", "readFile", "createReadStream"]) {
    const original = fs[method].bind(fs);
    fs[method] = (file, ...args) => { checkFile(file); return original(file, ...args); };
  }
  const asyncRead = fs.promises.readFile.bind(fs.promises);
  fs.promises.readFile = async (file, ...args) => { checkFile(file); return asyncRead(file, ...args); };
  // Preserve the pre-existing historical emulator log in the application root.
  const redirectLog = (file) => path.resolve(String(file)) === path.join(app, "firestore-debug.log") ? path.join(run, "firestore-debug.log") : file;
  for (const method of ["open", "openSync"]) {
    const original = fs[method].bind(fs);
    fs[method] = (file, ...args) => { checkFile(file); return original(redirectLog(file), ...args); };
  }
  const stream = fs.createWriteStream.bind(fs);
  fs.createWriteStream = (file, ...args) => stream(
    path.resolve(String(file)) === path.join(app, "firestore-debug.log") ? path.join(run, "firestore-debug.log") : file, ...args);
  const allow = (host) => {
    const value = String(host || "localhost").toLowerCase();
    if (!localHosts.has(value)) {
      evidence.blockedRemote++;
      throw new Error("Rules isolation blocked a non-loopback connection");
    }
    return value;
  };
  const connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    const first = Array.isArray(args[0]) ? args[0][0] : args[0];
    if (!(first && typeof first === "object" && first.path)) {
      const host = allow(first && typeof first === "object" ? first.host : typeof args[1] === "string" ? args[1] : undefined);
      evidence.localConnections[host] = (evidence.localConnections[host] || 0) + 1;
    }
    return Reflect.apply(connect, this, args);
  };
  for (const method of ["lookup", "resolve", "resolve4", "resolve6", "resolveAny", "resolveCname", "resolveTxt", "resolveSrv"]) {
    const original = dns[method].bind(dns);
    dns[method] = (host, ...args) => { allow(host); return original(host, ...args); };
    if (dns.promises[method]) {
      const originalPromise = dns.promises[method].bind(dns.promises);
      dns.promises[method] = async (host, ...args) => { allow(host); return originalPromise(host, ...args); };
    }
  }
  syncBuiltinESMExports();
  // This report records only counts/loopback hosts, never environment values or tokens.
  process.on("exit", () => {
    originalWrite(path.join(run, "guard-" + process.pid + ".json"), JSON.stringify(evidence, null, 2) + "\n");
  });
  // Read the empty isolated config once to prove this process cannot see the normal CLI account store.
  assert.deepEqual(JSON.parse(originalRead(path.join(run, "config", "configstore", "firebase-tools.json"), "utf8")), { usage: false });
}

async function run() {
  assert.equal(process.platform, "win32", "This checked command is the Windows npm.cmd workflow");
  const packageJson = JSON.parse(fs.readFileSync(path.join(app, "package.json"), "utf8"));
  assert.equal(packageJson.scripts["test:rules"], 'firebase emulators:exec --project demo-golesta-v2 --only firestore,storage "node --test tests/rules.test.mjs"');
  const config = JSON.parse(fs.readFileSync(path.join(app, "firebase.json"), "utf8"));
  assert.equal(config.emulators.singleProjectMode, true);
  for (const [service, port] of [["firestore", 8080], ["storage", 9199]]) {
    assert.equal(config.emulators[service].port, port);
    assert.ok(localHosts.has(config.emulators[service].host || "localhost"), "Emulator must bind loopback");
    assert.equal(config[service].rules, service + ".rules");
  }
  assert.ok(!config.functions && !config.extensions && !config.database, "Unexpected network-capable emulator configuration");
  const testSource = fs.readFileSync(path.join(app, "tests/rules.test.mjs"), "utf8");
  assert.ok(testSource.includes('projectId: "demo-golesta-v2"'));
  assert.ok(!/firebase-admin|dotenv|applicationDefault|cert\(/.test(testSource), "Unexpected credential or application initialization");
  const cached = path.join(os.homedir(), ".cache", "firebase", "emulators");
  const info = JSON.parse(fs.readFileSync(path.join(app, "node_modules", "firebase-tools", "lib", "emulator", "downloadableEmulatorInfo.json"), "utf8"));
  const jars = ["firestore", "storage"].map((name) => {
    const file = path.join(cached, info[name].downloadPathRelativeToCacheDir);
    assert.equal(hash(file), info[name].expectedChecksumSHA256, "Cached emulator checksum must match installed CLI metadata");
    return { name, version: info[name].version, sha256: info[name].expectedChecksumSHA256 };
  });
  for (const port of [8080, 9199, 4400, 9150]) {
    for (const host of ["127.0.0.1", "::1"]) {
      await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once("error", reject);
        server.listen(port, host, () => server.close(resolve));
      });
    }
  }
  const artifactRoot = path.join(app, "test-results");
  fs.mkdirSync(artifactRoot, { recursive: true });
  const artifact = fs.mkdtempSync(path.join(artifactRoot, "phase5b-rules-"));
  fs.mkdirSync(path.join(artifact, "config", "configstore"), { recursive: true });
  fs.writeFileSync(path.join(artifact, "config", "configstore", "firebase-tools.json"), '{"usage":false}\n');
  fs.writeFileSync(path.join(artifact, "user.npmrc"), "");
  fs.writeFileSync(path.join(artifact, "global.npmrc"), "");
  const env = {};
  for (const name of ["PATH", "SystemRoot", "WINDIR", "ComSpec", "PATHEXT", "TEMP", "TMP"]) {
    const actual = Object.keys(process.env).find((key) => key.toLowerCase() === name.toLowerCase());
    if (actual) env[name] = process.env[actual];
  }
  Object.assign(env, {
    CI: "true", NO_UPDATE_NOTIFIER: "1", npm_config_update_notifier: "false",
    npm_config_ignore_scripts: "true", npm_config_userconfig: path.join(artifact, "user.npmrc"),
    npm_config_globalconfig: path.join(artifact, "global.npmrc"), npm_config_cache: path.join(artifact, "npm-cache"),
    XDG_CONFIG_HOME: path.join(artifact, "config"), APPDATA: path.join(artifact, "appdata"),
    LOCALAPPDATA: path.join(artifact, "localappdata"), FIREBASE_EMULATORS_PATH: cached,
    FIREBASE_DEBUG_PATH: path.join(artifact, "firebase-debug.log"),
    GCLOUD_PROJECT: project, GOOGLE_CLOUD_PROJECT: project,
    GOLESTA_RULES_ISOLATED: "1", GOLESTA_RULES_RUN_DIR: artifact,
    NODE_OPTIONS: "--import=" + pathToFileURL(fileURLToPath(import.meta.url)).href
  });
  const java = spawnSync("java", ["-version"], { env, encoding: "utf8", windowsHide: true });
  assert.equal(java.status, 0, "Java must run under the credential-free environment");
  const javaVersion = (java.stderr + java.stdout).match(/version "([^"]+)"/)?.[1];
  assert.ok(Number(javaVersion?.split(".")[0]) >= 21, "Java 21+ required");
  const inputs = Object.fromEntries(["package.json", "package-lock.json", "firebase.json", "firestore.rules", "storage.rules", "tests/rules.test.mjs", "scripts/verify-rules-local.mjs"].map((name) => [name, hash(path.join(app, name))]));
  const historicalLog = path.join(app, "firestore-debug.log");
  const previousLog = fs.existsSync(historicalLog) ? { bytes: fs.readFileSync(historicalLog), stat: fs.statSync(historicalLog) } : null;
  if (previousLog) fs.writeFileSync(path.join(artifact, "preserved-root-firestore-debug.log"), previousLog.bytes);
  const startedAt = new Date().toISOString();
  const child = spawn(env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npm.cmd run test:rules"], { cwd: app, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (data) => { output += data.toString("utf8"); });
  child.stderr.on("data", (data) => { output += data.toString("utf8"); });
  const timer = setTimeout(() => {
    // Only the process tree launched by this runner can be stopped.
    spawnSync("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
  }, 240_000);
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  }).finally(() => clearTimeout(timer));
  const logPreservation = { previousLogExisted: Boolean(previousLog), fallbackRestoreNeeded: false, rootBytesPreserved: true };
  if (previousLog && (!fs.existsSync(historicalLog) || !fs.readFileSync(historicalLog).equals(previousLog.bytes))) {
    logPreservation.fallbackRestoreNeeded = true;
    if (fs.existsSync(historicalLog)) fs.copyFileSync(historicalLog, path.join(artifact, "emulator-root-firestore-debug.log"));
    fs.writeFileSync(historicalLog, previousLog.bytes);
    fs.utimesSync(historicalLog, previousLog.stat.atime, previousLog.stat.mtime);
    logPreservation.rootBytesPreserved = fs.readFileSync(historicalLog).equals(previousLog.bytes);
  }
  const sanitized = output.replace(/\u001b\[[0-9;]*[A-Za-z]/g, "")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[redacted token]")
    .replace(/Bearer\s+\S+/g, "Bearer [redacted]");
  fs.writeFileSync(path.join(artifact, "test-output.log"), sanitized);
  const value = (label) => Number(sanitized.match(new RegExp("(?:#|\\u2139)\\s+" + label + "\\s+(\\d+)"))?.[1] ?? 0);
  const guards = fs.readdirSync(artifact).filter((name) => /^guard-\d+\.json$/.test(name)).map((name) => JSON.parse(fs.readFileSync(path.join(artifact, name), "utf8")));
  const result = {
    command: "npm.cmd run test:rules", cwd: "v2", project, startedAt, finishedAt: new Date().toISOString(),
    exitCode, tests: value("tests"), passed: value("pass"), failed: value("fail"), skipped: value("skipped"),
    javaVersion, jars, inputSha256: inputs, logPreservation,
    isolation: { inheritedCredentials: false, normalCliConfigUsed: false, externalConnectionsBlockedInNode: true,
      cachedJarsVerified: true, noDownloadsRequired: true, guards,
      limitations: "Node CLI/SDK sockets and DNS are guarded; Java runs the checksum-verified local emulator JARs. This is not an OS-wide network sandbox or deployed resource-isolation proof." },
    artifact: path.relative(path.join(app, ".."), artifact).replaceAll("\\", "/"),
    logSha256: hash(path.join(artifact, "test-output.log"))
  };
  fs.writeFileSync(path.join(artifact, "result.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
  if (exitCode || result.tests === 0 || result.failed) {
    console.log(sanitized.split(/\r?\n/).slice(-65).join("\n"));
    process.exitCode = exitCode || 1;
  }
}

if (process.env.GOLESTA_RULES_ISOLATED === "1") installGuard();
else await run();
