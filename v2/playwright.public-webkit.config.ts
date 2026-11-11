import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

const baseURL = process.env.GOLESTA_TEST_BASE_URL || "http://127.0.0.1:3117";
const target = new URL(baseURL);
if (target.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(target.hostname)) {
  throw new Error("Public WebKit QA requires an isolated local HTTP server.");
}
if (process.env.GOLESTA_TEST_BROWSER_CHANNEL) {
  throw new Error("Unset GOLESTA_TEST_BROWSER_CHANNEL for WebKit QA; Chromium channels cannot select Safari.");
}

export default defineConfig({
  ...base,
  testMatch: ["**/public-navigation.spec.ts", "**/public-site.spec.ts", "**/services.spec.ts"],
  outputDir: "./test-results/public-webkit",
  workers: 1,
  retries: 0,
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"], browserName: "webkit" } },
    // Existing specs set 375/390/430px widths; retain touch, scale and mobile UA.
    { name: "webkit-iphone", grep: /390px|375px|430px/, use: { ...devices["iPhone 13"], browserName: "webkit" } },
  ],
});
