import { test, expect, type APIRequestContext } from "@playwright/test";
const verifiedReview = "https://search.google.com/local/writereview?placeid=ChIJu9YCaU-BcEcRATRKa-dAT4A";
const baseURL = process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3119";
if (new URL(baseURL).protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(new URL(baseURL).hostname)) {
  throw new Error("Legacy link checks require a local HTTP server");
}
test.use({ baseURL });

async function followLocal(request: APIRequestContext, pathname: string) {
  let url = new URL(pathname, baseURL);
  for (let hop = 0; hop < 5; hop++) {
    const response = await request.get(url.href, { maxRedirects: 0 });
    if (![301, 302, 303, 307, 308].includes(response.status())) return { response, url };
    const location = new URL(response.headers().location, url);
    if (location.origin !== new URL(baseURL).origin) return { response, url: location };
    url = location;
  }
  throw new Error("Local redirect loop");
}

test("legacy scan QR URLs reach the retained links page", async ({ request }) => {
  for (const path of ["/scan", "/scan/", "/scan/index.html"]) {
    const { response, url } = await followLocal(request, path);
    expect(response.status(), path).toBe(200);
    expect(url.pathname).toBe("/links.html");
    expect(await response.text()).toContain("Golesta Beauty");
  }
});

test("review QR URLs use the owner-approved destination without forwarding query data", async ({ request }) => {
  for (const path of ["/review", "/review/", "/review/index.html"]) {
    const { response, url } = await followLocal(request, path + "?name=synthetic-privacy-probe");
    expect(response.status()).toBe(302);
    expect(url.href).toBe(verifiedReview);
    expect(url.href).not.toContain("synthetic-privacy-probe");
    expect(url.href).not.toContain("CQEXAMPLE");
  }
  const head = await request.head("/review", { maxRedirects: 0 });
  expect(head.status()).toBe(302);
  expect(head.headers().location).toBe(verifiedReview);
  expect(await head.text()).toBe("");
});

test("legacy voucher thank-you URL leads to contact without claiming an order", async ({ request }) => {
  const response = await request.get("/thanks.html?Abholung=email", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const destination = new URL(response.headers().location, baseURL);
  expect(destination.origin).toBe(new URL(baseURL).origin);
  expect(destination.pathname).toBe("/");
  expect(destination.hash).toBe("#kontakt");
});
