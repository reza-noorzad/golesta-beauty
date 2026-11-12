import { expect, test } from "@playwright/test";
import { publicFixture } from "./support/public-browser";

const baseURL = process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3119";
if (new URL(baseURL).protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(new URL(baseURL).hostname)) {
  throw new Error("Launch legal checks require a local HTTP server");
}
test.use({ baseURL, launchOptions: { channel: process.env.GOLESTA_TEST_BROWSER_CHANNEL } });

for (const width of [390, 1280]) {
  test(`legal pages and persistent footer links at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    const fixture = await publicFixture(page, baseURL);
    fixture.update(data => { data.voucher.published = false; });
    for (const [route, title] of [["/impressum", "Impressum"], ["/datenschutz", "Datenschutz"]]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: title, exact: true, level: 1 })).toBeVisible();
      await expect(page.getByRole("complementary", { name: "Freigabestatus" })).toContainText("noch nicht zur Veröffentlichung freigegeben");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
      const footer = page.getByRole("contentinfo");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer.getByRole("link", { name: "Impressum", exact: true })).toBeVisible();
      await expect(footer.getByRole("link", { name: "Impressum", exact: true })).toHaveAttribute("href", "/impressum");
      await expect(footer.getByRole("link", { name: "Datenschutz", exact: true })).toBeVisible();
      await expect(footer.getByRole("link", { name: "Datenschutz", exact: true })).toHaveAttribute("href", "/datenschutz");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: "Impressum", exact: true }).click();
    await expect(page).toHaveURL(`${baseURL}/impressum`);
    await page.getByRole("contentinfo").getByRole("link", { name: "Datenschutz", exact: true }).click();
    await expect(page).toHaveURL(`${baseURL}/datenschutz`);
    expect(fixture.errors).toEqual([]);
  });
}

test("privacy draft discloses the actual providers and unresolved legal decisions", async ({ page }) => {
  await publicFixture(page, baseURL);
  await page.goto("/datenschutz");
  const main = page.getByRole("main");
  for (const heading of [/Vercel/, /Google Firebase/, /Cloudinary und Firebase Storage/, /Browserspeicher/, /Datenschutzrechte/]) {
    await expect(main.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(main).toContainText("auch mit öffentlichen Seiten initialisiert");
  await expect(main).toContainText("IndexedDB");
  await expect(main).toContainText("Rechtsgrundlagen je Verarbeitung");
  await expect(main).toContainText("Einwilligungen");
  await expect(main).not.toContainText("Wir verwenden keine Cookies");
});

test("legal text remains readable when public data cannot be loaded", async ({ page }) => {
  await publicFixture(page, baseURL);
  await page.route("**/api/content", route => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
  await page.goto("/impressum");
  await expect(page.getByRole("heading", { name: "Impressum", level: 1, exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "info@golestabeauty.com", exact: true })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("rechtliche Bezeichnung");
});

test("review redirects use the approved URL and ignore untrusted query data", async ({ request }) => {
  const response = await request.get("/review?next=https://example.invalid&email=synthetic@example.invalid", { maxRedirects: 0 });
  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe("https://search.google.com/local/writereview?placeid=ChIJu9YCaU-BcEcRATRKa-dAT4A");
  expect(await response.text()).toBe("");
  const head = await request.head("/review?next=//example.invalid", { maxRedirects: 0 });
  expect(head.status()).toBe(302);
  expect(head.headers().location).toBe("https://search.google.com/local/writereview?placeid=ChIJu9YCaU-BcEcRATRKa-dAT4A");
  expect(await head.text()).toBe("");
});
