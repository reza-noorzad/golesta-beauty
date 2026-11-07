import { test, expect } from "@playwright/test";
import siteData from "../src/data/site-data.json";
import { initialContent } from "../src/lib/content";
import { initialServices } from "../src/lib/services";

// Run against a separately built local app. All external requests are blocked.
// Example: GOLESTA_TEST_BASE_URL=http://127.0.0.1:3102
// Set GOLESTA_TEST_BROWSER_CHANNEL=msedge to use an installed Edge browser.
test.use({
  baseURL: process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3000",
  launchOptions: { channel: process.env.GOLESTA_TEST_BROWSER_CHANNEL },
});

for (const width of [320, 390, 1440]) {
  test(`services search, prices and QR page at ${width}px`, async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(baseURL!).origin) return route.abort();
      if (url.pathname === "/api/services") return route.fulfill({ json: { categories: initialServices() } });
      if (url.pathname.startsWith("/api/")) {
        if (url.pathname === "/api/content") {
          return route.fulfill({ json: initialContent });
        }
        return route.abort();
      }
      return route.continue();
    });

    await page.goto("/leistungen");
    await expect(page.getByRole("heading", { name: "Leistungen & Preise", exact: true })).toBeVisible();
    const total = siteData.prices.reduce((count, category) => count + category.items.length, 0);
    await expect(page.getByText(`${total} Leistungen gefunden`, { exact: true })).toBeVisible();

    const details = page.locator("details");
    await expect(details).toHaveCount(siteData.prices.length);
    const firstSummary = details.first().locator("summary");
    await firstSummary.focus();
    await page.keyboard.press("Enter");
    await expect(details.first()).toHaveAttribute("open", "");
    for (const [index, [name, price]] of siteData.prices[0].items.entries()) {
      await expect(details.first().locator("dt").nth(index)).toHaveText(name);
      await expect(details.first().locator("dd").nth(index)).toHaveText(price);
    }
    await firstSummary.press("Enter");
    await expect(details.first()).not.toHaveAttribute("open");

    const search = page.getByRole("searchbox", { name: "Leistung suchen" });
    await search.fill("  HAARSCHNITT  ");
    const searchCount = siteData.prices.flatMap((category) => category.items)
      .filter(([name]) => name.toLocaleLowerCase("de").includes("haarschnitt")).length;
    await expect(page.getByText(`${searchCount} Leistungen gefunden`, { exact: true })).toBeVisible();
    await expect(page.locator("details:not([open])")).toHaveCount(0);

    await page.getByRole("combobox", { name: "Kategorie", exact: true }).selectOption("category-1");
    await expect(details).toHaveCount(1);
    const expected = siteData.prices[0].items.filter(([name]) => name.toLocaleLowerCase("de").includes("haarschnitt"));
    await expect(details.locator("dt")).toHaveText(expected.map(([name]) => name));
    await expect(details.locator("dd")).toHaveText(expected.map(([, price]) => price));
    await expect(page.getByRole("link", { name: "Termin per WhatsApp anfragen" }))
      .toHaveAttribute("href", `https://wa.me/${initialContent.settings.whatsapp}?text=${encodeURIComponent("Hallo Golesta Beauty, ich möchte einen Termin vereinbaren.")}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await search.fill("keine-leistung-zu-dieser-suche");
    await expect(page.getByText("Keine Leistungen gefunden", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Filter zurücksetzen" }).click();
    await expect(search).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Kategorie", exact: true })).toHaveValue("all");
    await expect(details).toHaveCount(siteData.prices.length);

    const qr = await page.goto("/links.html");
    expect(qr?.status()).toBe(200);
    await expect(page).toHaveTitle("Golesta Beauty – Links");
    expect(errors).toEqual([]);
  });
}
