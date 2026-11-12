import { expect, test, type Page } from "@playwright/test";
import { changeLegal, legalActionSchema, type Legal } from "../src/lib/legal";
import type { AdminRole } from "../src/lib/admin-session";
import { isolate, login, uid } from "./support/admin-browser";
import { testImprint } from "./support/legal-fixture";

const baseURL = process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3119";
if (new URL(baseURL).protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(new URL(baseURL).hostname)) throw Error("Legal editor checks require loopback");
test.use({ baseURL, launchOptions: { channel: process.env.GOLESTA_TEST_BROWSER_CHANNEL } });
async function fixture(page: Page, role: AdminRole) {
  let legal: Legal = {}; let revision = 7; let conflict = false;
  const writes: string[] = [];
  const errors = await isolate(page, baseURL, {
    session: async route => { await route.fulfill({ json: { uid, role } }); },
    legal: async route => {
      if (route.request().method() === "GET") return route.fulfill({ json: { legal, revision } });
      if (conflict) { conflict = false; return route.fulfill({ status: 409, json: { error: "Zwischenzeitlich geändert. Dein Entwurf bleibt erhalten." } }); }
      const action = legalActionSchema.parse(route.request().postDataJSON());
      if (action.revision !== revision) return route.fulfill({ status: 409, json: { error: "Konflikt" } });
      if (action.action === "publish" && role !== "superadmin") return route.fulfill({ status: 403, json: { error: "Nur Salonleitung" } });
      try { legal = changeLegal(legal, action, uid, new Date().toISOString()); revision++; writes.push(action.action); return route.fulfill({ json: { legal, revision } }); }
      catch { return route.fulfill({ status: 400, json: { error: "Bitte Pflichtangaben vervollständigen." } }); }
    },
  });
  await page.goto("/admin/rechtliches");
  await expect(page.getByRole("heading", { name: "Anmeldung", exact: true })).toBeVisible();
  await login(page);
  return { errors, writes, legal: () => legal, conflict: () => { conflict = true; } };
}

for (const width of [390, 1280]) test(`owner drafts, previews and explicitly publishes each document at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const state = await fixture(page, "superadmin");
  await expect(page.getByRole("heading", { name: "Rechtliches & Datenschutz", exact: true })).toBeVisible();
  const imprint = page.getByRole("region", { name: "Impressum", exact: true });
  const privacy = page.getByRole("region", { name: "Datenschutzerklärung", exact: true });
  await expect(imprint.getByRole("button", { name: "Veröffentlichen", exact: true })).toBeDisabled();
  await privacy.getByRole("button", { name: "Abschnitt hinzufügen" }).click();
  await privacy.getByRole("textbox", { name: "Abschnitt 1: Überschrift" }).fill("Geprüfter Datenschutz");
  await privacy.getByRole("textbox", { name: "Abschnitt 1: Text" }).fill("Owner-approved isolated privacy text");
  await imprint.getByRole("textbox", { name: /^Rechtliche Inhaberin/ }).fill(testImprint.proprietor);
  await imprint.getByRole("textbox", { name: /^Rechtsform/ }).fill(testImprint.legalForm);
  await imprint.getByRole("textbox", { name: /^Offizielle Geschäftsanschrift/ }).fill(testImprint.address);
  await imprint.getByRole("textbox", { name: /^Kontakt-E-Mail/ }).fill(testImprint.email);
  await imprint.getByRole("textbox", { name: /^Kontakt-Telefon/ }).fill(testImprint.phone);
  await imprint.getByRole("button", { name: "Vorschau", exact: true }).click();
  await expect(imprint.getByRole("region", { name: "Vorschau Impressum" })).toContainText(testImprint.proprietor);
  expect(state.writes).toEqual([]);
  await imprint.getByRole("button", { name: "Entwurf speichern", exact: true }).click();
  await expect(page.getByText("Entwurf gespeichert. Die öffentliche Fassung bleibt unverändert.", { exact: true })).toBeVisible();
  expect(state.legal().impressum?.published).toBeUndefined();
  await expect(privacy.getByRole("textbox", { name: "Abschnitt 1: Text" })).toHaveValue("Owner-approved isolated privacy text");
  const approval = imprint.getByRole("checkbox");
  await expect(approval).not.toBeChecked(); await approval.check();
  await imprint.getByRole("button", { name: "Veröffentlichen", exact: true }).click();
  await expect(imprint.getByText("Veröffentlicht", { exact: true })).toBeVisible();
  expect(state.legal().impressum?.published?.approved).toBe(true);
  expect(state.legal().privacy?.published).toBeUndefined();
  await imprint.getByRole("textbox", { name: /^Rechtliche Inhaberin/ }).fill("UNPUBLISHED_NEW_OWNER_TEXT");
  await expect(imprint.getByRole("checkbox")).not.toBeChecked();
  await imprint.getByRole("button", { name: "Entwurf speichern", exact: true }).click();
  await expect(imprint.getByText("Veröffentlicht · neuer Entwurf", { exact: true })).toBeVisible();
  expect(state.legal().impressum?.published?.content.proprietor).toBe(testImprint.proprietor);
  await privacy.getByRole("button", { name: "Entwurf speichern", exact: true }).click();
  await expect(privacy.getByRole("checkbox")).toBeEnabled();
  await expect(privacy.getByRole("checkbox")).not.toBeChecked();
  await privacy.getByRole("checkbox").check();
  await privacy.getByRole("button", { name: "Veröffentlichen", exact: true }).click();
  await expect(privacy.getByText("Veröffentlicht", { exact: true })).toBeVisible();
  await page.reload();
  await expect(imprint.getByRole("textbox", { name: /^Rechtliche Inhaberin/ })).toHaveValue("UNPUBLISHED_NEW_OWNER_TEXT");
  await expect(privacy).toContainText("Veröffentlicht:");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(state.errors).toEqual([]);
});

test("admin can save drafts but cannot publish, and conflict preserves local edits", async ({ page }) => {
  const state = await fixture(page, "admin");
  const imprint = page.getByRole("region", { name: "Impressum", exact: true });
  await expect(page.getByRole("navigation", { name: "Admin Navigation" }).getByRole("link", { name: "Rechtliches & Datenschutz", exact: true })).toHaveCount(1);
  await imprint.getByRole("textbox", { name: /^Rechtliche Inhaberin/ }).fill("Private incomplete draft");
  await expect(imprint.getByRole("button", { name: "Veröffentlichen", exact: true })).toHaveCount(0);
  await imprint.getByRole("button", { name: "Entwurf speichern", exact: true }).click();
  await expect(page.getByText("Entwurf gespeichert. Die öffentliche Fassung bleibt unverändert.", { exact: true })).toBeVisible();
  state.conflict();
  await imprint.getByRole("textbox", { name: /^Rechtliche Inhaberin/ }).fill("Keep this unsaved text");
  await imprint.getByRole("button", { name: "Entwurf speichern", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Zwischenzeitlich geändert" })).toBeVisible();
  await expect(imprint.getByRole("textbox", { name: /^Rechtliche Inhaberin/ })).toHaveValue("Keep this unsaved text");
  expect(state.legal().impressum?.draft?.content.proprietor).toBe("Private incomplete draft");
});

test("editor has neither the legal navigation link nor access to the legal editor", async ({ page }) => {
  await fixture(page, "editor");
  await expect(page.getByRole("link", { name: "Rechtliches & Datenschutz", exact: true })).toHaveCount(0);
  await expect(page.getByText("Für diesen Bereich fehlen Berechtigungen.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entwurf speichern", exact: true })).toHaveCount(0);
});
