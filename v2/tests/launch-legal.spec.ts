import { expect, test } from "@playwright/test";
import { publicFixture } from "./support/public-browser";
import { publishedLegal } from "./support/legal-fixture";

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
    for (const [route, title] of [["/impressum", "Impressum"], ["/datenschutz", "Datenschutzerklärung"]]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: title, exact: true, level: 1 })).toBeVisible();
      await expect(page.getByRole("main")).toContainText("Noch keine freigegebene Fassung veröffentlicht.");
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

test("public pages render only the published snapshot as safe plain text", async ({ page }) => {
  const fixture = await publicFixture(page, baseURL);
  fixture.update(data => {
    data.legal = publishedLegal();
    data.legal.privacy!.draft!.content.sections[0].body = "PRIVATE_UNPUBLISHED_DRAFT";
    data.legal.privacy!.published!.content.sections[0].body = '<script>window.legalInjected=true</script>\nApproved plain text';
    data.legal.impressum!.draft!.content.proprietor = "PRIVATE_IMPRINT_DRAFT";
  });
  await page.goto("/datenschutz");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Freigegebener Datenschutzhinweis" })).toBeVisible();
  await expect(main).toContainText("Approved plain text");
  await expect(main).not.toContainText("PRIVATE_UNPUBLISHED_DRAFT");
  expect(await page.evaluate(() => "legalInjected" in window)).toBe(false);
  await page.goto("/impressum");
  await expect(main).toContainText("Testinhaber des Testsalons");
  await expect(main).not.toContainText("PRIVATE_IMPRINT_DRAFT");
});

test("failed public loads show a safe status without draft or fabricated legal text", async ({ page }) => {
  await publicFixture(page, baseURL);
  await page.route("**/api/content", route => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
  await page.goto("/impressum");
  await expect(page.getByRole("heading", { name: "Impressum", level: 1, exact: true })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Die rechtlichen Informationen konnten gerade nicht geladen werden.");
  await expect(page.getByRole("main").getByRole("link", { name: "Kontakt zum Salon", exact: true })).toHaveAttribute("href", "/#kontakt");
  await expect(page.getByRole("main")).not.toContainText("Entwurf");
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
