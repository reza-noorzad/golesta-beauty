import { test, expect } from "@playwright/test";
import { uid, isolate, login } from "./support/admin-browser";
test.use({
  baseURL: process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3000",
  launchOptions: { channel: process.env.GOLESTA_TEST_BROWSER_CHANNEL },
});
async function openAccountMenu(page: import("@playwright/test").Page) {
  const toggle=page.getByRole("button",{name:"Navigation öffnen",exact:true});
  if(await toggle.isVisible())await toggle.click();
}
for (const width of [390, 1440]) {
  test(`direct admin access, login persistence and logout at ${width}px`, async ({page,baseURL}) => {
    await page.setViewportSize({width,height:900});
    const errors = await isolate(page,baseURL!);
    await page.goto("/admin/produkte");
    await expect(page).toHaveURL(/\/admin\/login\?next=/);
    await expect(page.getByRole("button", {name:"+ Neues Produkt (Entwurf)",exact:true})).toHaveCount(0);
    await login(page);
    await expect(page).toHaveURL(/\/admin\/produkte$/);
    await expect(page.getByRole("button", {name:"+ Neues Produkt (Entwurf)",exact:true})).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", {name:"+ Neues Produkt (Entwurf)",exact:true})).toBeVisible();
    await openAccountMenu(page);
    await page.getByRole("button", {name:"Abmelden",exact:true}).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await login(page);
    await expect(page.getByRole("button", {name:"+ Neues Produkt (Entwurf)",exact:true})).toBeVisible();
    await openAccountMenu(page);
    await page.getByRole("button", {name:"Abmelden",exact:true}).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.reload();
    await expect(page.getByRole("heading", {name:"Anmeldung",exact:true})).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test("denied administrators receive recovery text without redirect loops or protected controls", async ({page,baseURL}) => {
  let calls = 0;
  await isolate(page,baseURL!, {session:async (route) => {calls++;await route.fulfill({status:403,json:{error:"Keine Admin-Berechtigung."}});}});
  await page.goto("/admin/login"); await login(page);
  await expect(page.getByRole("alert").filter({hasText:"Berechtigungen"})).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/produkte");
  await expect(page.getByRole("button", {name:"Erneut versuchen",exact:true})).toBeVisible();
  await expect(page.getByRole("button", {name:"+ Neues Produkt (Entwurf)",exact:true})).toHaveCount(0);
  expect(calls).toBeLessThanOrEqual(3);
});
test("a stalled session recovers after its deadline and retry can authorize", async ({page,baseURL}) => {
  let calls = 0;
  await page.clock.install();
  await isolate(page,baseURL!, {session: async (route) => {
    calls++;
    if (calls === 1) return; // Deliberately leave this request pending.
    await route.fulfill({json:{uid,role:"admin"}});
  }});
  await page.goto("/admin/login"); await login(page);
  await expect.poll(()=>calls).toBe(1);
  await page.clock.runFor(16_000);
  await expect(page.getByRole("alert").filter({hasText:"Zugriffsprüfung dauert zu lange"})).toBeVisible();
  await expect(page.getByRole("button", {name:"Anmelden",exact:true})).toBeEnabled();
  await page.getByRole("button", {name:"Erneut versuchen",exact:true}).click();
  await expect(page.getByRole("heading", {name:"Übersicht",exact:true})).toBeVisible();
});
for (const mode of ["html", "invalid-json", "network"] as const) {
  test(`content ${mode} errors stay recoverable and do not crash the editor`, async ({page,baseURL}) => {
    const errors = await isolate(page,baseURL!, {content:async (route) => {
      if (mode === "network") return route.abort();
      await route.fulfill(mode === "html" ? {status:502,contentType:"text/html",body:"<html>private upstream error</html>"} : {status:200,json:{data:{},revision:7}});
    }});
    await page.goto("/admin/produkte"); await login(page);
    await expect(page.getByRole("button", {name:"Erneut versuchen",exact:true})).toBeVisible();
    await expect(page.getByRole("button", {name:"+ Neues Produkt (Entwurf)",exact:true})).toHaveCount(0);
    await expect(page.getByText(/private upstream|Unexpected end|JSON input/)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
test("expired API sessions close protected access without repeatedly redirecting", async ({page,baseURL}) => {
  let calls = 0;
  await isolate(page,baseURL!, {
    session:async (route) => {calls++; await route.fulfill(calls === 1 ? {json:{uid,role:"admin"}} : {status:401,json:{error:"Sitzung abgelaufen."}});},
    content:async (route) => {await route.fulfill({status:401,json:{error:"Sitzung abgelaufen."}});},
  });
  await page.goto("/admin/produkte"); await login(page);
  await expect(page.getByRole("alert").filter({hasText:"Sitzung ist abgelaufen"})).toBeVisible();
  await expect(page.getByRole("button", {name:"+ Neues Produkt (Entwurf)",exact:true})).toHaveCount(0);
  expect(calls).toBeLessThanOrEqual(3);
});
test("unavailable browser storage falls back to a session in memory", async ({page,baseURL}) => {
  await page.addInitScript(() => {
    for (const key of ["indexedDB","localStorage","sessionStorage"]) Object.defineProperty(window,key,{configurable:true,get(){throw new DOMException("Storage disabled","SecurityError");}});
  });
  const errors = await isolate(page,baseURL!);
  await page.goto("/admin/login"); await login(page);
  await expect(page.getByRole("heading", {name:"Übersicht",exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", {name:"Anmeldung",exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
