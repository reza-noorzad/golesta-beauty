import assert from "node:assert/strict";
const base = process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3102";
assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(new URL(base).hostname), "Use a local production build only.");
for (const [path, methods] of [["session",["GET"]],["content",["GET","PUT"]],["services",["GET","PUT"]],["reviews",["GET","PATCH"]],["users",["GET","POST","PATCH"]],["upload",["POST"]]]) {
  for (const method of methods) {
    const response = await fetch(`${base}/api/admin/${path}`, {method,signal:AbortSignal.timeout(20_000)});
    assert.equal(response.status, 401, `${method} ${path}`);
    assert.equal(typeof (await response.json()).error, "string");
    assert.equal(response.headers.get("cache-control"), "no-store");
    console.log(`${method} /api/admin/${path}: JSON 401 PASS`);
  }
}
const invalid = await fetch(`${base}/api/admin/session`, {headers:{authorization:"Bearer invalid-token"},signal:AbortSignal.timeout(20_000)});
assert.equal(invalid.status, 401);
assert.equal(typeof (await invalid.json()).error, "string");
console.log("Invalid token through actual Firebase Admin initialization: JSON 401 PASS");
const response = await fetch(`${base}/api/content`, {signal:AbortSignal.timeout(20_000)});
assert.equal(response.status, 200);
const data = await response.json();
assert.ok(data.settings && Array.isArray(data.products) && Array.isArray(data.gallery));
console.log("Public content through compiled API and configured Firebase: JSON 200 PASS (read only)");
