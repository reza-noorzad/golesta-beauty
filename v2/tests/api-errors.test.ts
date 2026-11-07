import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiError, requestJson, withTimeout } from "../src/lib/request";
import { authenticatedRequest, validateAdminResponse } from "../src/lib/admin-api";
import { failure, HttpError, readJson } from "../src/lib/server/http";

test("HTML, empty and truncated error responses preserve HTTP status with safe messages", async (context) => {
  for (const [status, body] of [[502, "<html>private stack trace</html>"], [401, ""], [500, '{"error":'], [503, '{"error":"SECRET"}']] as const) {
    const fetch = context.mock.method(globalThis, "fetch", async () => new Response(body, { status }));
    try { await assert.rejects(requestJson("/api/admin/content"), (error) => error instanceof ApiError && error.status === status && !/SECRET|stack|JSON/.test(error.message)); }
    finally { fetch.mock.restore(); }
  }
});
test("malformed successes and wrong response shapes are rejected before rendering", async (context) => {
  for (const body of ["", "<html>unavailable</html>", "null", "[]", '{"data":']) {
    const fetch = context.mock.method(globalThis, "fetch", async () => new Response(body));
    try { await assert.rejects(requestJson("/api/admin/content"), ApiError); }
    finally { fetch.mock.restore(); }
  }
  assert.throws(() => validateAdminResponse("/api/admin/content", "GET", { data: {}, revision: 1 }), ApiError);
  assert.throws(() => validateAdminResponse("/api/admin/reviews", "GET", { reviews: {} }), ApiError);
  assert.throws(() => validateAdminResponse("/api/admin/session", "GET", { uid: "a", role: "unknown" }), ApiError);
});
test("network failure has German recovery text and mutations are attempted once", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () => { throw new TypeError("SECRET network details"); });
  await assert.rejects(requestJson("/api/admin/content", { method: "PUT" }), (error) => error instanceof ApiError && /Verbindung/.test(error.message) && !error.message.includes("SECRET"));
  assert.equal(fetch.mock.callCount(), 1);
});
test("request and token deadlines settle; late token resolution cannot issue a request", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", (_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
    options.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  await assert.rejects(requestJson("/api/admin/content", { method: "PUT" }, 5), (error) => error instanceof ApiError && /bereits übernommen/.test(error.message));
  await assert.rejects(withTimeout(new Promise(() => {}), 5, "Sitzung dauert zu lange"), /Sitzung dauert zu lange/);
  let resolveToken!: (token: string) => void;
  context.mock.timers.enable({apis:["setTimeout"]});
  const pending = authenticatedRequest({getIdToken: () => new Promise((resolve) => {resolveToken=resolve;})}, "/api/admin/session");
  const rejected = assert.rejects(pending, /Sitzung/);
  context.mock.timers.tick(10_001);
  await rejected;
  resolveToken("late-token");
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(fetch.mock.callCount(), 1);
});
test("authentication headers support Headers objects and response validation", async (context) => {
  context.mock.method(globalThis, "fetch", async (_url: string, options: RequestInit) => {
    const headers = new Headers(options.headers);
    assert.equal(headers.get("authorization"), "Bearer fresh-token");
    assert.equal(headers.get("x-test"), "retained");
    return Response.json({ uid: "manager", role: "admin" });
  });
  const result = await authenticatedRequest<{uid:string;role:string}>({ getIdToken: async () => "fresh-token" }, "/api/admin/session", { headers: new Headers({ "x-test": "retained" }) });
  assert.equal(result.role, "admin");
});
test("JSON parsing and size errors are structured 400/413; internal errors are redacted", async (context) => {
  for (const body of ["", "{broken"]) await assert.rejects(readJson(new Request("https://example.invalid", { method: "POST", body }), 100), (error) => error instanceof HttpError && error.status === 400);
  await assert.rejects(readJson(new Request("https://example.invalid", { method: "PATCH", body: "123456" }), 3), (error) => error instanceof HttpError && error.status === 413);
  context.mock.method(console, "error", () => {});
  const response = failure(new Error("SECRET credentials / path / stack"));
  assert.equal(response.status, 500);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { error: "Serverfehler. Bitte erneut versuchen." });
});
