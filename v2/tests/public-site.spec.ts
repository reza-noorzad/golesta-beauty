import { test, expect, type Page } from "@playwright/test";
import { initialServices } from "../src/lib/services";
import { PRODUCTS_COMING_SOON } from "../src/lib/public-config";
import { contactLinks } from "../src/lib/public-content";
import { publicFixture } from "./support/public-browser";

test.use({baseURL:process.env.GOLESTA_TEST_BASE_URL||"http://127.0.0.1:3000",launchOptions:{channel:process.env.GOLESTA_TEST_BROWSER_CHANNEL}});
async function noOverflow(page:Page) {expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
for(const width of [320,375,430,768,1024,1280,1440])for(const banner of [false,true]) {
  test(`public sticky navigation and contact at ${width}px, banner ${banner}`,async ({page,baseURL,isMobile},testInfo) => {
    await page.setViewportSize({width,height:800});
    const fixture=await publicFixture(page,baseURL!,banner);
    for(const path of ["/","/leistungen","/produkte"]) {
      await page.goto(path);
      const header=page.locator(".public-header");
      await expect(header).toHaveCount(1);
      const phone=header.getByRole("link",{name:/Salon anrufen/});
      const whatsapp=header.getByRole("link",{name:"WhatsApp kontaktieren",exact:true});
      await expect(phone).toBeVisible();await expect(whatsapp).toBeVisible();
      await expect(phone).toHaveAttribute("href",contactLinks(fixture.content().settings).phone);
      await expect(whatsapp).toHaveAttribute("href",contactLinks(fixture.content().settings).whatsapp);
      if(banner)await expect(page.getByRole("complementary",{name:"Aktuelle Meldungen"})).toBeVisible();
      else await expect(page.getByRole("complementary",{name:"Aktuelle Meldungen"})).toHaveCount(0);
      await expect(page.getByText("Abgelaufene Meldung",{exact:true})).toHaveCount(0);
      const initial=(await header.boundingBox())!.height;
      await page.evaluate(() => window.scrollTo(0,document.documentElement.scrollHeight));
      if(await page.evaluate(() => window.scrollY>64)) {
        await expect(header).toHaveAttribute("data-compact","true");
        await expect.poll(async () => (await header.boundingBox())!.height).toBeLessThan(initial);
      }
      await expect.poll(async () => Math.round((await header.boundingBox())!.y)).toBe(0);
      await expect(phone).toBeInViewport();await expect(whatsapp).toBeInViewport();
      if(width>=1024){await expect(header.getByRole("navigation",{name:"Hauptnavigation",exact:true})).toBeVisible();await expect(phone.locator("span")).toBeVisible();}
      else {
        const toggle=header.locator(".public-menu-toggle");
        if(isMobile)await toggle.tap();else await toggle.click();await expect(toggle).toHaveAttribute("aria-expanded","true");
        await expect(header.getByRole("navigation",{name:"Mobile Navigation",exact:true})).toBeVisible();
        await page.keyboard.press("Escape");await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute("aria-expanded","false");
        for(const action of [phone,whatsapp,toggle])expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await noOverflow(page);
      await expect(page.getByText("CATALOG MUST STAY HIDDEN",{exact:true})).toHaveCount(0);
      if(path==="/produkte") {
        await expect(page.getByRole("heading",{name:PRODUCTS_COMING_SOON.title,exact:true})).toBeVisible();
        await expect(page.locator('meta[name="description"]')).toHaveAttribute("content",PRODUCTS_COMING_SOON.description);
        await expect(page.getByRole("searchbox",{name:"Produkte suchen"})).toHaveCount(0);
      }
    }
    await page.goto("/produkte/catalog-must-stay-hidden");
    await expect(page).toHaveURL(/\/produkte$/);
    await expect(page.getByRole("heading",{name:PRODUCTS_COMING_SOON.title,exact:true})).toBeVisible();
    await expect(page.getByText("CATALOG MUST STAY HIDDEN",{exact:true})).toHaveCount(0);
    if((width===375||width===1440)&&!banner){await page.evaluate(() => window.scrollTo(0,0));await page.screenshot({path:testInfo.outputPath(`public-coming-soon-${width}.png`),fullPage:true});}
    expect(fixture.errors).toEqual([]);expect(fixture.imagesFailed).toEqual([]);
  });
}
for(const width of [375,1440]) {
  test(`public anchors, configured contacts and images stay usable at ${width}px`,async ({page,baseURL,isMobile}) => {
    await page.setViewportSize({width,height:800});const fixture=await publicFixture(page,baseURL!,true);
    await page.goto("/");
    const header=page.locator(".public-header");
    for(const [name,id] of [["Team","team"],["Galerie","galerie"],["Gutschein","gutschein"],["Kontakt","kontakt"]]) {
      const toggle=header.getByRole("button",{name:"Menü öffnen",exact:true});if(await toggle.isVisible())await toggle.click();
      const nav=header.getByRole("navigation",{name:width<1024?"Mobile Navigation":"Hauptnavigation",exact:true});
      await nav.getByRole("link",{name,exact:true}).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect.poll(async () => {const top=(await page.locator(`#${id}`).boundingBox())!.y;const bottom=(await header.boundingBox())!.height;return top-bottom;}).toBeGreaterThanOrEqual(0);
      expect((await page.locator(`#${id}`).boundingBox())!.y-(await header.boundingBox())!.height).toBeLessThan(100);
      await noOverflow(page);
    }
    const calls=fixture.contentCalls();
    fixture.update((data) => {data.settings.phone="+43 676 9111318";data.settings.whatsapp="436769111318";data.voucher.published=false;});
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect.poll(() => fixture.contentCalls()).toBeGreaterThan(calls);
    await expect(header.getByRole("link",{name:/Salon anrufen/})).toHaveAttribute("href","tel:+436769111318");
    await expect(header.getByRole("link",{name:"WhatsApp kontaktieren",exact:true})).toHaveAttribute("href",/wa\.me\/436769111318/);
    await expect(page.locator("footer").getByRole("link",{name:"+43 676 9111318",exact:true})).toHaveAttribute("href","tel:+436769111318");
    await expect(page.locator('#gutschein')).toHaveCount(0);
    const toggle=header.getByRole("button",{name:"Menü öffnen",exact:true});if(await toggle.isVisible())await toggle.click();
    await expect(header.getByRole("link",{name:"Gutschein",exact:true})).toHaveCount(0);
    await page.keyboard.press("Escape");
    const invalidLinks=await page.locator('a[href^="/#"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")!).filter((href) => !document.getElementById(href.slice(2))));
    expect(invalidLinks).toEqual([]);
    await page.locator("#galerie").scrollIntoViewIfNeeded();
    const first=page.getByRole("button",{name:"Galeriebild 1 vergrößern",exact:true});if(isMobile)await first.tap();else await first.click();
    const dialog=page.getByRole("dialog",{name:"Galeriebild anzeigen",exact:true});await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button",{name:"Galerie schließen",exact:true})).toBeFocused();
    await page.keyboard.press("ArrowRight");await expect(dialog.locator("figcaption")).toHaveText("2 / 6");
    await page.keyboard.press("Escape");await expect(dialog).toHaveCount(0);await expect(first).toBeFocused();
    // Restored focus must support keyboard reopening and pointer dismissal too.
    await first.press("Enter");await expect(dialog).toBeVisible();
    const close=dialog.getByRole("button",{name:"Galerie schließen",exact:true});if(isMobile)await close.tap();else await close.click();
    await expect(dialog).toHaveCount(0);await expect(first).toBeFocused();
    await page.getByRole("button",{name:"Mehr Bilder ansehen",exact:true}).click();
    await expect(page.locator('#galerie button[aria-label$="vergrößern"]')).toHaveCount(18);
    await page.getByRole("button",{name:"Weniger anzeigen",exact:true}).click();
    await expect(page.locator('#galerie button[aria-label$="vergrößern"]')).toHaveCount(6);
    await expect.poll(async () => page.locator(".public-site img").evaluateAll((images) => images.filter((image) => {const element=image as HTMLImageElement;const box=element.getBoundingClientRect();return box.width>0&&element.complete&&element.naturalWidth===0;}).map((image) => (image as HTMLImageElement).src))).toEqual([]);
    expect(fixture.errors).toEqual([]);expect(fixture.imagesFailed).toEqual([]);
  });
}
test("homepage and services search share the current stored service response",async ({page,baseURL}) => {
  const fixture=await publicFixture(page,baseURL!);
  const custom=initialServices().reverse().map((category,index) => ({...category,sortOrder:index,items:category.items.slice(-1)}));
  fixture.setServices(custom);
  await page.goto("/leistungen");
  await expect(page.getByText(`${custom.length} Leistungen gefunden`,{exact:true})).toBeVisible();
  await page.getByRole("combobox",{name:"Kategorie",exact:true}).selectOption(custom[0].id);
  const search=page.getByRole("searchbox",{name:"Leistung suchen",exact:true});
  await search.fill(`  ${custom[0].items[0].name.toLocaleUpperCase("de")}  `);
  await expect(page.locator("details")).toHaveCount(1);await expect(page.locator("details dt")).toHaveText([custom[0].items[0].name]);await expect(page.locator("details dd")).toHaveText([custom[0].items[0].price]);
  await page.goto("/");
  const category=page.locator("#leistungen").getByRole("button",{name:new RegExp(custom[0].title.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))}).filter({visible:true});
  await category.click();
  await expect(page.locator("#leistungen").getByText(custom[0].items[0].price,{exact:true}).filter({visible:true})).toBeVisible();
  expect(fixture.errors).toEqual([]);
});
test("failed services show a clear fallback notice and paused detail routes redirect before loading products",async ({page,request,baseURL}) => {
  const fixture=await publicFixture(page,baseURL!);fixture.failServices();await page.goto("/leistungen");
  await expect(page.getByRole("status").filter({hasText:"Die aktuellen Leistungen können gerade nicht geladen werden"})).toBeVisible();
  await expect(page.locator("details")).toHaveCount(initialServices().length);
  const response=await request.get(`${baseURL}/produkte/anything`,{maxRedirects:0});expect(response.status()).toBe(307);expect(response.headers().location).toBe("/produkte");
  const html=await (await request.get(`${baseURL}/produkte`)).text();expect(html).toContain(PRODUCTS_COMING_SOON.title);expect(html).not.toContain("CATALOG MUST STAY HIDDEN");
  const admin=await (await request.get(`${baseURL}/admin/login`)).text();expect(admin).toContain("viewport-fit=auto");
});
