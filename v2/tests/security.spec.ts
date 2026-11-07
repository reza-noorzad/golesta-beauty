import {test,expect} from "@playwright/test";
import {publicFixture} from "./support/public-browser";
test.use({baseURL:process.env.GOLESTA_TEST_BASE_URL||"http://127.0.0.1:3000",launchOptions:{channel:process.env.GOLESTA_TEST_BROWSER_CHANNEL}});
test("public/admin/static/API responses enforce framing, MIME and referrer protections",async({request})=>{
  for(const path of ["/","/admin/login","/produkte","/leistungen","/links.html","/api/admin/content"]){
    const response=await request.get(path);const headers=response.headers();
    expect(headers["x-frame-options"],path).toBe("DENY");expect(headers["x-content-type-options"],path).toBe("nosniff");expect(headers["referrer-policy"],path).toBe("strict-origin-when-cross-origin");expect(headers["content-security-policy"],path).toContain("frame-ancestors 'none'");
    if(path.startsWith("/api/")){expect(response.status()).toBe(401);expect(headers["cache-control"]).toBe("no-store");expect(typeof(await response.json()).error).toBe("string");}
  }
});
test("environment, repository and backup paths are not served as public files",async({request})=>{
  for(const path of ["/.env.local","/.git/config","/backup/.env.local","/v2/.env.local","/v2-backup-before-complete/.env.local"]){const response=await request.get(path);expect(response.status(),path).toBe(404);expect(await response.text()).not.toContain("BEGIN PRIVATE KEY");}
});
test("stored public text is escaped rather than interpreted as markup",async({page,baseURL})=>{
  const fixture=await publicFixture(page,baseURL!);const payload='<img data-xss="true" src=x onerror="window.xss=true">';
  fixture.update(data=>{data.team[0].name=payload;data.team[0].bio=payload;data.announcements=[{id:"escape",type:"info",enabled:true,title:"Hinweis",message:payload}];});
  await page.goto("/");await expect(page.locator("#team").getByRole("heading",{name:payload,exact:true})).toBeVisible();await expect(page.getByRole("complementary",{name:"Aktuelle Meldungen"})).toContainText(payload);await expect(page.locator("[data-xss]")).toHaveCount(0);expect(await page.evaluate(()=>"xss" in window)).toBe(false);expect(fixture.errors).toEqual([]);
});
