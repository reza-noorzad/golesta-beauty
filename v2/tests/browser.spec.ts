import { test, expect } from "@playwright/test";
import { PRODUCTS_COMING_SOON } from "../src/lib/public-config";
import { publicFixture } from "./support/public-browser";
test.use({baseURL:process.env.GOLESTA_TEST_BASE_URL||"http://127.0.0.1:3000",launchOptions:{channel:process.env.GOLESTA_TEST_BROWSER_CHANNEL}});
for(const width of [390,1440])test(`public site and admin boundary at ${width}px`,async ({page,request,baseURL}) => {
  await page.setViewportSize({width,height:900});
  await publicFixture(page,baseURL!);
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Unsere Produkte",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Unser Team",exact:true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width===390){await page.getByRole("button",{name:"Menü öffnen",exact:true}).click();await expect(page.getByRole("navigation",{name:"Mobile Navigation",exact:true})).toBeVisible();}
  await page.goto("/produkte");
  await expect(page.getByRole("heading",{name:PRODUCTS_COMING_SOON.title,exact:true})).toBeVisible();
  await page.goto("/admin/produkte");
  await expect(page.getByRole("button",{name:"+ Neues Produkt (Entwurf)",exact:true})).toHaveCount(0);
  for(const [path,method] of [["content","GET"],["content","PUT"],["upload","POST"],["services","GET"],["services","PUT"],["session","GET"]]) {
    const response=await request.fetch(`${baseURL}/api/admin/${path}`,{method});
    expect(response.status()).toBe(401);
    expect(typeof (await response.json()).error).toBe("string");
  }
});
