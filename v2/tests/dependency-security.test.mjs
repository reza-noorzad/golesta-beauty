import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const packageJson = (name) => JSON.parse(fs.readFileSync(path.join(root, "node_modules", name, "package.json"), "utf8"));
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

test("installed XML parser and required helper match the reviewed lockfile", () => {
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  for (const name of ["fast-xml-parser", "is-unsafe"]) {
    assert.equal(packageJson(name).version, lock.packages["node_modules/" + name].version);
  }
  const [major, minor] = packageJson("fast-xml-parser").version.split(".").map(Number);
  assert.equal(major, 5);
  assert.ok(minor >= 12, "the stop-node fix starts at 5.12.0");
  const storageRequire = createRequire(require.resolve("@google-cloud/storage"));
  assert.equal(storageRequire.resolve("fast-xml-parser"), require.resolve("fast-xml-parser"));
});

test("Firebase Admin and Cloud Storage still load without initializing remote services", () => {
  for (const [name, method] of [["app", "initializeApp"], ["auth", "getAuth"], ["firestore", "getFirestore"], ["storage", "getStorage"]]) {
    assert.equal(typeof require("firebase-admin/" + name)[method], "function");
  }
  assert.equal(typeof require("@google-cloud/storage").TransferManager, "function");
  assert.equal(require("firebase-admin/app").getApps().length, 0);
});

test("Cloud Storage style multipart XML builder and default parser remain compatible", () => {
  const input = { CompleteMultipartUpload: { Part: [{ PartNumber: 1, ETag: '"part-one"' }, { PartNumber: 2, ETag: '"part-two"' }] } };
  const xml = new XMLBuilder({ arrayNodeName: "Part" }).build(input);
  assert.deepEqual(new XMLParser().parse(xml), input);
  const response = '<CompleteMultipartUploadResult><Bucket>synthetic-only</Bucket><Key>photo.webp</Key><ETag>"result"</ETag></CompleteMultipartUploadResult>';
  assert.equal(new XMLParser().parse(response).CompleteMultipartUploadResult.Key, "photo.webp");
});

test("UTF-8 byte input and CRLF XML preserve text and normal entity decoding", () => {
  const text = "Gr\u00fc\u00dfe \u2013 \u06af\u0644\u0633\u062a\u0627";
  const xml = "<root>\r\n<name>" + text + "</name>\r\n<note>A &amp; B</note>\r\n</root>";
  const result = new XMLParser().parse(new Uint8Array(Buffer.from(xml, "utf8")));
  assert.equal(result.root.name, text);
  assert.equal(result.root.note, "A & B");
});

test("malformed stop-node input rejects inside a bounded isolated process", () => {
  const script = 'const {XMLParser}=require(process.argv[1]); const parser=new XMLParser({stopNodes:["*.script"]}); try { parser.parse("<root><script>"+"<a ".repeat(100000)); process.exitCode=1; } catch { process.stdout.write("rejected"); }';
  const output = execFileSync(process.execPath, ["-e", script, require.resolve("fast-xml-parser")], {
    timeout: 2000,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(output, "rejected");
});
