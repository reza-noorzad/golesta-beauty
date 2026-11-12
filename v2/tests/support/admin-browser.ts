import type { Page, Route } from "@playwright/test";
import { initialContent } from "../../src/lib/content";
import { initialServices } from "../../src/lib/services";

export const uid = "isolated-admin";
export const email = "isolated@example.invalid";
function token() {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({alg:"RS256",typ:"JWT"})}.${encode({sub:uid,user_id:uid,email,aud:"demo-golesta-tests",iss:"https://securetoken.google.com/demo-golesta-tests",iat:now,exp:now+3600,auth_time:now,firebase:{sign_in_provider:"password",identities:{email:[email]}}})}.test-signature`;
}
export type MockOptions = { legal?: (route: Route) => Promise<void>; session?: (route: Route) => Promise<void>; content?: (route: Route) => Promise<void>; reviews?: (route: Route) => Promise<void>; users?: (route: Route) => Promise<void>; services?: (route: Route) => Promise<void>; upload?: (route: Route) => Promise<void> };
export async function isolate(page: Page, baseURL: string, options: MockOptions = {}) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "identitytoolkit.googleapis.com") {
      if (url.pathname.endsWith("accounts:signInWithPassword")) return route.fulfill({json:{localId:uid,email,idToken:token(),refreshToken:"isolated-refresh-token",expiresIn:"3600",registered:true}});
      if (url.pathname.endsWith("accounts:lookup")) return route.fulfill({json:{users:[{localId:uid,email,emailVerified:true,providerUserInfo:[{providerId:"password",email}]}]}});
      return route.abort();
    }
    if (url.hostname === "securetoken.googleapis.com") return route.fulfill({json:{id_token:token(),refresh_token:"isolated-refresh-token",expires_in:"3600",user_id:uid,token_type:"Bearer",project_id:"demo-golesta-tests"}});
    if (url.origin !== new URL(baseURL).origin) return route.abort();
    if (url.pathname === "/_next/image" && /^https?:/.test(url.searchParams.get("url") || "")) return route.fulfill({path:"public/images/gallery-01.jpg",contentType:"image/jpeg"});
    if (url.pathname === "/api/admin/legal" && options.legal) return options.legal(route);
    if (url.pathname === "/api/admin/session") return options.session ? options.session(route) : route.fulfill({json:{uid,role:"admin"}});
    if (url.pathname === "/api/admin/content") return options.content ? options.content(route) : route.fulfill({json:{data:initialContent,revision:7}});
    if (url.pathname === "/api/admin/reviews") return options.reviews ? options.reviews(route) : route.fulfill({json:{reviews:[]}});
    if (url.pathname === "/api/admin/services") return options.services ? options.services(route) : route.fulfill({json:{categories:initialServices(),isLive:true,updatedAt:"2026-11-01T12:00:00.000Z"}});
    if (url.pathname === "/api/admin/users" && options.users) return options.users(route);
    if (url.pathname === "/api/admin/upload" && options.upload) return options.upload(route);
    if (url.pathname.startsWith("/api/")) return route.abort();
    return route.continue();
  });
  return errors;
}
export async function login(page: Page) {
  await page.getByRole("textbox", {name:"E-Mail",exact:true}).fill(email);
  await page.getByLabel("Passwort", {exact:true}).fill("isolated-test-password");
  await page.getByRole("button", {name:"Anmelden",exact:true}).click();
}
