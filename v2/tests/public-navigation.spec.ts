import { test, expect, type Page } from "@playwright/test";
import { publicFixture } from "./support/public-browser";
import { PRODUCTS_COMING_SOON, PUBLIC_CATALOG_ENABLED } from "../src/lib/public-config";

test.use({
  baseURL: process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3117",
  launchOptions: { channel: process.env.GOLESTA_TEST_BROWSER_CHANNEL },
});
const widths = [390, 1024, 1280, 1440];
const sources = ["/leistungen", "/produkte"];
const anchors = [["Team", "team"], ["Galerie", "galerie"], ["Gutschein", "gutschein"], ["Kontakt", "kontakt"]];

async function navigation(page: Page, width: number) {
  const header = page.locator(".public-header");
  if (width < 1024) {
    await expect(header.getByRole("button", { name: "Menü öffnen", exact: true })).toBeVisible();
    await header.getByRole("button", { name: "Menü öffnen", exact: true }).click();
    await expect(header.getByRole("button", { name: "Menü schließen", exact: true })).toHaveAttribute("aria-expanded", "true");
  }
  const nav = header.getByRole("navigation", { name: width < 1024 ? "Mobile Navigation" : "Hauptnavigation", exact: true });
  await expect(nav).toBeVisible();
  return nav;
}

async function headerGeometry(page: Page, width: number) {
  await page.evaluate(() => document.fonts.ready);
  const issues = await page.locator(".public-header").evaluate((header) => {
    const visible = (node: Element) => { const box = node.getBoundingClientRect(); return box.width > 0 && box.height > 0; };
    const nodes = Array.from(header.querySelectorAll<HTMLElement>(".public-brand, .public-desktop-nav a, .public-phone, .public-whatsapp, .public-menu-toggle")).filter(visible);
    const problems: string[] = [];
    for (const [index, node] of nodes.entries()) {
      const box = node.getBoundingClientRect(), name = node.getAttribute("aria-label") || node.textContent?.trim() || node.className;
      if (box.left < -1 || box.right > innerWidth + 1) problems.push(name + ": outside viewport");
      for (const other of nodes.slice(index + 1)) {
        const next = other.getBoundingClientRect();
        if (Math.min(box.right, next.right) - Math.max(box.left, next.left) > 1 &&
            Math.min(box.bottom, next.bottom) - Math.max(box.top, next.top) > 1) problems.push(name + ": overlaps " + (other.textContent?.trim() || other.className));
      }
      if (node.matches(".public-desktop-nav a")) {
        const range = document.createRange(); range.selectNodeContents(node);
        if (range.getBoundingClientRect().height > parseFloat(getComputedStyle(node).lineHeight) + 1) problems.push(name + ": wrapped navigation label");
      }
    }
    if (document.documentElement.scrollWidth > innerWidth + 1) problems.push("horizontal document overflow");
    if (header.scrollWidth > header.clientWidth + 1) problems.push("horizontal header overflow");
    return problems;
  });
  expect(issues, "header collisions, wrapping and overflow at " + width + "px").toEqual([]);
  const header = page.locator(".public-header");
  await expect(header.locator(".public-desktop-nav")).toBeVisible({ visible: width >= 1024 });
  await expect(header.locator(".public-menu-toggle")).toBeVisible({ visible: width < 1024 });
  for (const action of [".public-phone", ".public-whatsapp"]) {
    const link = header.locator(action);
    await expect(link).toBeInViewport();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
}

for (const width of widths) for (const source of sources) {
  test("subpage navigation from " + source + " at " + width + "px", async ({ page, baseURL }) => {
    test.setTimeout(60_000);
    expect(PUBLIC_CATALOG_ENABLED).toBe(false);
    await page.setViewportSize({ width, height: 900 });
    const fixture = await publicFixture(page, baseURL!, true);
    await page.goto(source);
    const header = page.locator(".public-header");
    if (source === "/produkte") {
      await expect(page.getByRole("heading", { name: PRODUCTS_COMING_SOON.title, exact: true })).toBeVisible();
      await expect(page.locator(".public-coming-soon-emblem")).toHaveCount(0);
      await expect(page.locator(".public-coming-soon").getByText(/^g$/, { exact: true })).toHaveCount(0);
      await expect(page.locator(".public-coming-soon-inner > p").first()).toHaveText("Beauty & Pflege · Golesta Beauty");
    }
    let nav = await navigation(page, width);
    const home = nav.getByRole("link", { name: "Startseite", exact: true });
    await expect(home).toBeVisible(); await expect(home).toHaveAttribute("href", "/");
    await home.click(); await expect(page).toHaveURL(baseURL! + "/");
    await expect(page.locator("#start")).toBeInViewport();
    if (width < 1024) {
      await expect(header.locator("#public-mobile-navigation")).toBeHidden();
      await navigation(page, width); await page.keyboard.press("Escape");
      await expect(header.getByRole("button", { name: "Menü öffnen", exact: true })).toBeFocused();
      nav = await navigation(page, width);
      await nav.getByRole("link", { name: "Produkte", exact: true }).click();
      await expect(page).toHaveURL(baseURL! + "/produkte");
      await expect(header.locator("#public-mobile-navigation")).toBeHidden();
      nav = await navigation(page, width);
      await nav.getByRole("link", { name: "Leistungen", exact: true }).click();
      await expect(page).toHaveURL(baseURL! + "/leistungen");
      await expect(header.locator("#public-mobile-navigation")).toBeHidden();
    }
    for (const [name, id] of anchors) {
      await page.goto(source); nav = await navigation(page, width);
      await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", "/#" + id);
      await nav.getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(baseURL! + "/#" + id);
      await expect(page.locator("#" + id)).toBeInViewport();
      await expect.poll(async () => (await page.locator("#" + id).boundingBox())!.y - (await header.boundingBox())!.height).toBeGreaterThanOrEqual(-1);
      expect((await page.locator("#" + id).boundingBox())!.y - (await header.boundingBox())!.height).toBeLessThan(100);
      if (width < 1024) await expect(header.locator("#public-mobile-navigation")).toBeHidden();
    }
    fixture.update(data => { data.voucher.published = false; });
    await page.goto(source);
    await expect(header.getByRole("link", { name: "Gutschein", exact: true })).toHaveCount(0);
    await navigation(page, width);
    await expect(header.getByRole("link", { name: "Gutschein", exact: true })).toHaveCount(0);
    expect(fixture.errors).toEqual([]); expect(fixture.imagesFailed).toEqual([]);
  });
}

for (const width of widths) {
  test("responsive header geometry at " + width + "px", async ({ page, baseURL }, testInfo) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    const fixture = await publicFixture(page, baseURL!);
    for (const published of [true, false]) for (const banner of [true, false]) {
      fixture.update(data => {
        data.voucher.published = published;
        data.announcements = banner ? [{ id: "navigation-banner", type: "info", enabled: true, title: "Information", message: "Lokaler Navigationstest" }] : [];
      });
      for (const source of ["/", ...sources]) await test.step(source + ", voucher " + published + ", banner " + banner, async () => {
        await page.goto(source);
        if (banner) await expect(page.getByRole("complementary", { name: "Aktuelle Meldungen" })).toBeVisible();
        else await expect(page.getByRole("complementary", { name: "Aktuelle Meldungen" })).toHaveCount(0);
        await expect(page.locator('.public-header a[href="/#gutschein"]')).toHaveCount(published ? 2 : 0);
        await headerGeometry(page, width);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        if (await page.evaluate(() => window.scrollY > 64)) await expect(page.locator(".public-header")).toHaveAttribute("data-compact", "true");
        // A short page may not scroll the whole announcement past the viewport.
        // Sticky positioning begins only once that banner has scrolled away.
        await expect.poll(() => page.evaluate(() => {
          const header = document.querySelector(".public-header")!.getBoundingClientRect();
          const banner = document.querySelector('aside[aria-label="Aktuelle Meldungen"]')?.getBoundingClientRect();
          return Math.abs(header.y - Math.max(0, banner?.bottom || 0));
        })).toBeLessThan(1);
        await headerGeometry(page, width);
      });
    }
    await page.screenshot({ path: testInfo.outputPath("header-" + width + ".png") });
    expect(fixture.errors).toEqual([]); expect(fixture.imagesFailed).toEqual([]);
  });
}
