import { beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { initialContent, parseStoredContent, publicContent } from "../src/lib/content";
import { emptyImprint, emptyPrivacy, publicLegal } from "../src/lib/legal";
import { authorizeAdmin, bearerToken } from "../src/lib/server/authorization";
import { failure, HttpError, json, readDeadline, readJson } from "../src/lib/server/http";
import { LegalDocumentBody } from "../src/components/public/LegalDocumentBody";
import { legalTime, publishedLegal, testImprint, testPrivacy } from "./support/legal-fixture";
import type { AdminRole } from "../src/lib/admin-session";

// Only the Firebase boundary is mocked. All persistence is an in-memory Map;
// the real route, authorization, schema, transaction and public projection run.
const records = new Map<string, Record<string, unknown>>();
let role: AdminRole = "admin";
function ref(path: string) { return { path, get: async () => snapshot(path) }; }
function snapshot(path: string) { return { id: path.split("/").at(-1), exists: records.has(path), data: () => structuredClone(records.get(path)) }; }
const db = { doc: ref, runTransaction: async <T,>(fn: (tx: { get: (value: ReturnType<typeof ref>) => Promise<ReturnType<typeof snapshot>>; set: (value: ReturnType<typeof ref>, data: Record<string, unknown>) => void }) => Promise<T>) => {
  const pending = new Map<string, Record<string, unknown>>();
  const result = await fn({ get: async value => snapshot(value.path), set: (value, data) => { pending.set(value.path, structuredClone(data)); } });
  for (const [path, data] of pending) records.set(path, data);
  return result;
} };
async function requireAdmin(request: Request, roles?: AdminRole[]) {
  const identity = await authorizeAdmin(bearerToken(request), { verify: async token => { if (token !== "valid") throw { code: "auth/id-token-expired" }; return { uid: "actor" }; }, administrator: async () => ({ active: true, role }) }, roles);
  return { ...identity, db };
}
const moduleMock = mock as typeof mock & { module: (url: URL, options: { exports: Record<string, unknown>; cache: boolean }) => void };
moduleMock.module(new URL("../src/lib/server/firebase.ts", import.meta.url), { cache: true, exports: { backend: () => ({ db }), requireAdmin, failure, HttpError, json, readDeadline, readJson } });
const legal = await import("../src/app/api/admin/legal/route");
const general = await import("../src/app/api/admin/content/route");
const publicRoute = await import("../src/app/api/content/route");
process.env.FIREBASE_PROJECT_ID = "demo-legal-tests";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demo-legal-tests";
function request(method = "GET", body?: unknown, token: string | null = "valid") {
  return new Request("http://localhost/api/admin/legal", { method, headers: token ? { authorization: `Bearer ${token}` } : {}, body: body === undefined ? undefined : JSON.stringify(body) });
}
const saved = () => records.get("golestaV2/content")!;
const currentData = () => saved().data as typeof initialContent;
function setRole(value: AdminRole) { role = value; records.set("admins/actor", { active: true, role: value }); }
async function draft(document: "impressum" | "privacy", content: unknown, revision = Number(saved().revision)) { return legal.PATCH(request("PATCH", { action: "save-draft", document, content, revision })); }
async function publish(document: "impressum" | "privacy", revision = Number(saved().revision)) { return legal.PATCH(request("PATCH", { action: "publish", document, approved: true, revision })); }
beforeEach(() => { records.clear(); setRole("admin"); records.set("golestaV2/content", { data: structuredClone(initialContent), revision: 7, retainedMetadata: { note: "preserve" } }); });

test("legal endpoints reject anonymous, expired and editor access without writes", async () => {
  const before = structuredClone(records);
  for (const handler of [legal.GET, legal.PATCH]) for (const token of [null, "expired"]) assert.equal((await handler(request(handler === legal.GET ? "GET" : "PATCH", undefined, token))).status, 401);
  assert.deepEqual(records, before);
  setRole("editor"); const editorBefore = structuredClone(records);
  assert.equal((await legal.GET(request())).status, 403);
  assert.equal((await draft("impressum", testImprint)).status, 403);
  assert.deepEqual(records, editorBefore);
});

test("legacy content loads without migration, prefilled legal text or publication", async () => {
  assert.deepEqual(parseStoredContent(initialContent), initialContent);
  const response = await legal.GET(request());
  assert.deepEqual(await response.json(), { legal: {}, revision: 7 });
  assert.equal(currentData().legal, undefined);
});

test("admin draft save preserves every unrelated business/document field and stays private", async () => {
  const beforeData = structuredClone(currentData());
  records.set("golestaV2/content", { ...saved(), data: { ...beforeData, futureField: { mustSurvive: true } } });
  assert.equal((await draft("impressum", { ...emptyImprint, proprietor: "PRIVATE_DRAFT" })).status, 200);
  const { legal: privateLegal, ...afterData } = currentData() as typeof initialContent & { futureField: unknown };
  assert.deepEqual(afterData, { ...beforeData, futureField: { mustSurvive: true } });
  assert.deepEqual(saved().retainedMetadata, { note: "preserve" });
  assert.equal(privateLegal?.impressum?.published, undefined);
  assert.equal(privateLegal?.impressum?.draft?.updatedBy, "actor");
  assert.equal(saved().revision, 8);
});

test("only superadmin can publish, and every document requires explicit approval", async () => {
  await draft("impressum", testImprint);
  const before = structuredClone(records);
  assert.equal((await publish("impressum")).status, 403);
  assert.deepEqual(records, before);
  setRole("superadmin");
  for (const approved of [undefined, false]) assert.equal((await legal.PATCH(request("PATCH", { action: "publish", document: "impressum", revision: 8, approved }))).status, 400);
  assert.equal((await publish("impressum")).status, 200);
  assert.equal(currentData().legal?.impressum?.published?.approvedBy, "actor");
  assert.equal(currentData().legal?.privacy?.published, undefined);
});

test("missing drafts, incomplete imprint and empty privacy cannot be published", async () => {
  setRole("superadmin");
  assert.equal((await publish("privacy")).status, 400);
  assert.equal((await draft("impressum", emptyImprint)).status, 200);
  assert.equal((await publish("impressum")).status, 400);
  assert.equal((await draft("privacy", emptyPrivacy)).status, 200);
  assert.equal((await publish("privacy")).status, 400);
  await draft("privacy", { sections: [{ id: "a", title: "Missing body", body: "  " }] });
  assert.equal((await publish("privacy")).status, 400);
});

test("draft updates preserve the published snapshot and public API strips drafts/audit UIDs", async () => {
  records.set("golestaV2/content", { ...saved(), data: { ...initialContent, legal: publishedLegal() } });
  await draft("privacy", { sections: [{ id: "new", title: "PRIVATE_DRAFT", body: "PRIVATE_UNAPPROVED_TEXT" }] });
  const storedBefore = structuredClone(records);
  const response = await publicRoute.GET();
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.legal.privacy.published.content, testPrivacy);
  assert.equal(JSON.stringify(data).includes("PRIVATE_"), false);
  assert.equal(JSON.stringify(data.legal).includes("test-owner"), false);
  assert.equal(JSON.stringify(data.legal).includes("updatedBy"), false);
  assert.equal(JSON.stringify(data.legal).includes("approvedBy"), false);
  assert.deepEqual(publicContent(data).legal, data.legal);
  assert.deepEqual(records, storedBefore);
});

test("publishing privacy copies only its saved draft, preserving the imprint", async () => {
  setRole("superadmin");
  records.set("golestaV2/content", { ...saved(), data: { ...initialContent, legal: publishedLegal() } });
  const imprint = structuredClone(currentData().legal!.impressum);
  const changed = { sections: [{ id: "new", title: "New approved privacy", body: "Owner-reviewed text" }] };
  await draft("privacy", changed);
  assert.equal((await publish("privacy")).status, 200);
  assert.deepEqual(currentData().legal?.privacy?.published?.content, changed);
  assert.deepEqual(currentData().legal?.impressum, imprint);
});

test("stale revisions and a role revoked during a transaction cannot overwrite data", async () => {
  const before = structuredClone(records);
  assert.equal((await draft("impressum", testImprint, 6)).status, 409);
  assert.deepEqual(records, before);
  role = "superadmin"; records.set("admins/actor", { active: true, role: "editor" });
  const revoked = structuredClone(records);
  assert.equal((await draft("impressum", testImprint)).status, 403);
  assert.deepEqual(records, revoked);
  records.set("admins/actor", { active: false, role: "superadmin" });
  assert.equal((await draft("impressum", testImprint)).status, 403);
});

test("general content PUT cannot forge legal content, and older clients cannot erase it", async () => {
  records.set("golestaV2/content", { ...saved(), data: { ...initialContent, legal: publishedLegal() } });
  setRole("superadmin");
  const forged = structuredClone(currentData()); forged.legal!.impressum!.published!.content.proprietor = "FORGED";
  const before = structuredClone(records);
  assert.equal((await general.PUT(request("PUT", { data: forged, revision: 7 }))).status, 403);
  assert.deepEqual(records, before);
  const oldClient = structuredClone(initialContent); oldClient.settings.salonName = "Updated ordinary setting";
  assert.equal((await general.PUT(request("PUT", { data: oldClient, revision: 7 }))).status, 200);
  assert.deepEqual(currentData().legal, publishedLegal());
  assert.deepEqual(saved().retainedMetadata, { note: "preserve" });
});

test("editor content reads omit private legal drafts while ordinary saves preserve them", async () => {
  records.set("golestaV2/content", { ...saved(), data: { ...initialContent, legal: publishedLegal() } });
  setRole("editor");
  const response = await general.GET(request());
  const data = await response.json();
  assert.equal(data.data.legal, undefined);
  assert.equal((await general.PUT(request("PUT", { data: data.data, revision: data.revision }))).status, 200);
  assert.deepEqual(currentData().legal, publishedLegal());
});

test("validation rejects forged metadata, extra fields, duplicate sections and oversized bodies", async () => {
  const before = structuredClone(records);
  assert.equal((await draft("impressum", { ...testImprint, approvedBy: "forged" })).status, 400);
  assert.equal((await draft("privacy", { sections: [testPrivacy.sections[0], testPrivacy.sections[0]] })).status, 400);
  assert.equal((await legal.PATCH(request("PATCH", { action: "save-draft", document: "privacy", revision: 7, content: testPrivacy, approved: true }))).status, 400);
  assert.equal((await draft("privacy", { sections: [{ id: "a", title: "too long", body: "x".repeat(210000) }] })).status, 413);
  assert.deepEqual(records, before);
});

test("public projection has no unpublished document and text renderer escapes HTML", () => {
  const legal = publishedLegal(); legal.privacy!.draft!.content.sections[0].body = "SECRET_DRAFT";
  const projected = publicLegal(legal);
  assert.equal(JSON.stringify(projected).includes("SECRET_DRAFT"), false);
  assert.deepEqual(publicLegal({ impressum: { draft: { content: emptyImprint, updatedAt: legalTime } } }), {});
  const html = renderToStaticMarkup(createElement(LegalDocumentBody, { document: "privacy", content: { sections: [{ id: "safe", title: "<script>bad()</script>", body: '<img src=x onerror="bad()">' }] } }));
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("<img"), false);
  assert.equal(html.includes("&lt;script&gt;"), true);
});
