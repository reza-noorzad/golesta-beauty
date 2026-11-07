import { test } from "node:test";
import assert from "node:assert/strict";
import { adminDestination, monitorAdminSession, type SessionState, type SessionUser, type AdminRole } from "../src/lib/admin-session";
import { authorizeAdmin, bearerToken } from "../src/lib/server/authorization";
import { HttpError } from "../src/lib/server/http";
import { ApiError } from "../src/lib/request";

const user = { uid: "manager", email: "manager@example.invalid" };
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));
function monitor(authorize: (user: SessionUser) => Promise<{uid: string; role: AdminRole}>, timeoutMs = 500) {
  const states: SessionState[] = [];
  let emit!: (user: SessionUser | null) => void;
  let fail!: () => void;
  let unsubscribed = false;
  const stop = monitorAdminSession({ timeoutMs, authorize, changed: (state) => states.push(state),
    subscribe: (next, error) => { emit = next; fail = error; return () => { unsubscribed = true; }; } });
  return { states, emit: (value: SessionUser | null) => emit(value), fail: () => fail(), stop, unsubscribed: () => unsubscribed };
}
test("initial auth callback and authorization each have a finite deadline", async () => {
  for (const emitUser of [false, true]) {
    const instance = monitor(() => new Promise(() => {}), 5);
    try {
      if (emitUser) instance.emit(user);
      await new Promise((resolve) => setTimeout(resolve, 20));
      assert.equal(instance.states.at(-1)?.status, "error");
      assert.match(JSON.stringify(instance.states.at(-1)), /dauert zu lange/);
      assert.equal(instance.states.some((state) => state.status === "allowed"), false);
    } finally { instance.stop(); }
  }
});
test("late authorization after timeout cannot grant access", async () => {
  let grant!: (value: {uid: string; role: AdminRole}) => void;
  const instance = monitor(() => new Promise((resolve) => { grant = resolve; }), 5);
  try {
    instance.emit(user);
    await new Promise((resolve) => setTimeout(resolve, 20));
    grant({ uid: user.uid, role: "admin" });
    await flush();
    assert.equal(instance.states.at(-1)?.status, "error");
  } finally { instance.stop(); }
});
test("logout/user switch invalidates pending checks and disposal unsubscribes", async () => {
  let grant!: (value: {uid: string; role: AdminRole}) => void;
  const instance = monitor(() => new Promise((resolve) => { grant = resolve; }));
  instance.emit(user);
  instance.emit(null);
  grant({ uid: user.uid, role: "superadmin" });
  await flush();
  assert.equal(instance.states.at(-1)?.status, "anonymous");
  instance.stop();
  assert.equal(instance.unsubscribed(), true);
  const size = instance.states.length;
  instance.emit(user);
  instance.fail();
  assert.equal(instance.states.length, size);
});
test("expired/revoked sessions are denied; errors never authorize", async () => {
  for (const status of [401, 403, 503]) {
    const instance = monitor(async () => { throw new ApiError("Bitte erneut versuchen.", status); });
    try { instance.emit(user); await flush(); assert.equal(instance.states.at(-1)?.status, status === 503 ? "error" : "denied"); }
    finally { instance.stop(); }
  }
});
test("normal token refresh keeps the same authorized editor mounted; observer failure closes access", async () => {
  const instance = monitor(async () => ({ uid: user.uid, role: "editor" }));
  try {
    instance.emit(user); await flush();
    const offset = instance.states.length;
    instance.emit(user); await flush();
    assert.equal(instance.states.slice(offset).some((state) => state.status === "checking"), false);
    instance.fail();
    assert.equal(instance.states.at(-1)?.status, "error");
  } finally { instance.stop(); }
});
test("mismatched server identity and redirect destinations fail safely", async () => {
  const instance = monitor(async () => ({ uid: "other", role: "admin" }));
  try { instance.emit(user); await flush(); assert.equal(instance.states.at(-1)?.status, "error"); }
  finally { instance.stop(); }
  assert.equal(adminDestination("/admin/produkte"), "/admin/produkte");
  for (const value of [null, "//evil.example", "/admin/login", "/admin/../login", "/admin\\evil", "https://evil.example"]) assert.equal(adminDestination(value), "/admin");
});
test("missing/malformed authorization headers are 401", () => {
  for (const value of [null, "Basic abc", "Bearer a b", "Bearer"]) {
    const request = new Request("https://example.invalid", { headers: value ? { authorization: value } : {} });
    assert.throws(() => bearerToken(request), (error) => error instanceof HttpError && error.status === 401);
  }
});
test("active admins, legacy admins and role restrictions are checked server-side", async () => {
  const verify = async () => ({ uid: user.uid });
  for (const role of [undefined, "", "admin", "superadmin", "editor"]) {
    const result = await authorizeAdmin("token", { verify, administrator: async () => ({ active: true, role }) });
    assert.equal(result.role, role || "admin");
  }
  for (const admin of [undefined, { active: false, role: "admin" }, { active: true, role: "unknown" }]) {
    await assert.rejects(authorizeAdmin("token", { verify, administrator: async () => admin }), (error) => error instanceof HttpError && error.status === 403);
  }
  await assert.rejects(authorizeAdmin("token", { verify, administrator: async () => ({ active: true, role: "editor" }) }, ["superadmin"]), (error) => error instanceof HttpError && error.status === 403);
});
test("invalid tokens are 401, backend outages/timeouts are 503", async () => {
  for (const code of ["auth/id-token-expired", "auth/id-token-revoked", "auth/invalid-id-token", "auth/user-disabled"]) {
    await assert.rejects(authorizeAdmin("token", { verify: async () => { throw { code }; }, administrator: async () => undefined }), (error) => error instanceof HttpError && error.status === 401);
  }
  await assert.rejects(authorizeAdmin("token", { verify: async () => { throw Error("offline"); }, administrator: async () => undefined }), (error) => error instanceof HttpError && error.status === 503);
  await assert.rejects(authorizeAdmin("token", { verify: () => new Promise(() => {}), administrator: async () => undefined }, undefined, 5), (error) => error instanceof HttpError && error.status === 503);
});
