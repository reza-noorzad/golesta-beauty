import type { Page } from "@playwright/test";
import { initialContent, type Content } from "../../src/lib/content";
import { initialServices } from "../../src/lib/services";

export async function publicFixture(page:Page,baseURL:string,banner=false) {
  let data:Content=structuredClone(initialContent);
  // Synthetic catalog records verify that paused public views never display them.
  data.categories=[{id:"fixture",name:"Test category",published:true,sortOrder:0}];
  data.products=[{id:"fixture-product",name:"CATALOG MUST STAY HIDDEN",slug:"catalog-must-stay-hidden",description:"Private release fixture",price:25,currency:"EUR",categoryId:"fixture",images:["/images/gallery-01.jpg"],published:true,featured:true,sortOrder:0,variants:[]}];
  data.announcements=banner?[{id:"active",enabled:true,type:"hours",title:"Hinweis aus dem Salon",message:"Aktuelle Informationen zu unseren Öffnungszeiten.",startsAt:"",endsAt:""},{id:"expired",enabled:true,type:"info",title:"Abgelaufene Meldung",message:"Nicht mehr anzeigen.",endsAt:"2000-01-01T00:00:00.000Z"}]:[];
  let services=initialServices();
  let serviceFailure=false;
  let contentCalls=0;
  const errors:string[]=[];const imagesFailed:string[]=[];
  page.on("pageerror",(error) => errors.push(error.message));
  page.on("response",(response) => {if(response.request().resourceType()==="image"&&response.status()>=400)imagesFailed.push(response.url());});
  await page.route("**/*",async (route) => {
    const url=new URL(route.request().url());
    if(url.origin!==new URL(baseURL).origin)return route.abort();
    if(url.pathname==="/_next/image"&&/^https?:/.test(url.searchParams.get("url")||""))return route.fulfill({path:"public/images/gallery-01.jpg",contentType:"image/jpeg"});
    if(url.pathname==="/api/content"){contentCalls++;return route.fulfill({json:data});}
    if(url.pathname==="/api/services")return route.fulfill(serviceFailure?{status:503,json:{error:"Vorübergehend nicht verfügbar."}}:{json:{categories:services}});
    if(url.pathname.startsWith("/api/"))return route.abort();
    return route.continue();
  });
  return {errors,imagesFailed,content:() => data,contentCalls:() => contentCalls,update:(mutate:(draft:Content) => void) => {data=structuredClone(data);mutate(data);},setServices:(value:ReturnType<typeof initialServices>) => {services=value;},failServices:() => {serviceFailure=true;}};
}
