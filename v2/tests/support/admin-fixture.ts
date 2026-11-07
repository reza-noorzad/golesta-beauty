import { expect, type Page, type Route } from "@playwright/test";
import { contentSchema, initialContent, type Content } from "../../src/lib/content";
import { initialServices } from "../../src/lib/services";
import type { AdminRole } from "../../src/lib/admin-session";
import type { AdminReview, AdminUser } from "../../src/lib/admin-api";
import { uid, email, isolate, login } from "./admin-browser";

export async function adminFixture(page:Page,baseURL:string,options:{configure?:(data:Content)=>void;upload?:(route:Route)=>Promise<void>;role?:AdminRole;configureUsers?:(users:AdminUser[])=>void;configureReviews?:(reviews:AdminReview[])=>void;newPassword?:string}={}) {
  let data:Content=structuredClone(initialContent);
  data.categories=[{id:"hair",name:"Haarpflege",published:true,sortOrder:0},{id:"skin",name:"Gesichtspflege",published:true,sortOrder:1}];
  data.products=["Pflegeshampoo","Haarmaske mit einem besonders langen Produktnamen","Gesichtspflege"].map((name,index) => ({id:`product-${index}`,name,slug:`test-product-${index}`,brand:"Salonpflege",description:"Eine ausführliche Beschreibung zur Prüfung des Editors.",price:24+index,currency:"EUR",categoryId:index===2?"skin":"hair",images:["/images/gallery-01.jpg"],published:index!==1,featured:index===0,sortOrder:index,variants:[{id:`variant-${index}`,name:"250 ml",price:24,available:true}]}));
  data.team[0]={...data.team[0],role:"Stylistin",experience:"Langjährige Erfahrung im Friseurhandwerk",bio:"Persönliche Beratung und Freude am Beruf.",specialties:["Farbe & Styling"]};
  data.announcements=[{id:"active",enabled:true,type:"info",title:"Aktuelle Meldung",message:"Neuigkeiten aus dem Salon.",startsAt:"",endsAt:""},{id:"future",enabled:true,type:"holiday",title:"Geplante Meldung",message:"Zukünftige Neuigkeit.",startsAt:"2099-01-01T12:00:00.000Z",endsAt:""},{id:"expired",enabled:true,type:"hours",title:"Beendete Meldung",message:"Historische Neuigkeit.",startsAt:"",endsAt:"2000-01-01T12:00:00.000Z"}];
  data.promotions=[{id:"sale",enabled:true,title:"Aktuelles Angebot",type:"percent",value:10,startsAt:"",endsAt:""},{id:"future-sale",enabled:true,title:"Geplantes Angebot",type:"fixed",value:5,startsAt:"2099-01-01T12:00:00.000Z",endsAt:""},{id:"expired-sale",enabled:true,title:"Beendetes Angebot",type:"percent",value:5,startsAt:"",endsAt:"2000-01-01T12:00:00.000Z"}];
  data.voucher.values=[25,50];
  options.configure?.(data);
  let saveFailure=0;let reviewSaveFailure=0;let reviewLoadFailure=0;let userSaveFailure=0;
  let revision=7;
  let categories=initialServices();
  let serviceTime="2026-11-01T12:00:00.000Z";
  const reviews:AdminReview[]=[{id:"pending",productId:"product-0",name:"Ein besonders langer Kundenname für die mobile Ansicht",rating:5,comment:"Eine ausführliche Rückmeldung aus der isolierten Testumgebung.",status:"pending",createdAt:"2026-11-01T12:00:00.000Z"},{id:"approved",productId:"product-0",name:"Testkundin",rating:4,comment:"Eine bereits freigegebene Rückmeldung.",status:"approved",createdAt:"2026-11-01T12:00:00.000Z"}];
  const users:AdminUser[]=[{uid,email,role:"superadmin",active:true},{uid:"other",email:"lange-adresse.fuer-responsive-tests@example.invalid",role:"editor",active:true}];
  options.configureUsers?.(users);options.configureReviews?.(reviews);
  const writes:{path:string;body:unknown}[]=[];
  const errors=await isolate(page,baseURL,{
    session:async (route) => {await route.fulfill({json:{uid,role:options.role||"superadmin"}});},
    content:async (route) => {
      if(route.request().method()==="PUT") {
        if(saveFailure){const status=saveFailure;saveFailure=0;return route.fulfill({status,contentType:"text/html",body:"<h1>Temporary failure</h1>"});}
        const body=route.request().postDataJSON();const parsed=contentSchema.safeParse(body.data);
        if(!parsed.success)return route.fulfill({status:400,json:{error:"Bitte Eingaben prüfen."}});
        writes.push({path:"content",body});data=parsed.data;revision++;
        return route.fulfill({json:{revision}});
      }
      await route.fulfill({json:{data,revision}});
    },
    services:async (route) => {
      if(route.request().method()==="PUT"){const body=route.request().postDataJSON();writes.push({path:"services",body});categories=body.categories;serviceTime=new Date().toISOString();return route.fulfill({json:{updatedAt:serviceTime}});}
      await route.fulfill({json:{categories,isLive:true,updatedAt:serviceTime}});
    },
    reviews:async (route) => {
      if(route.request().method()==="PATCH"&&reviewSaveFailure){const status=reviewSaveFailure;reviewSaveFailure=0;return route.fulfill({status,contentType:"text/html",body:"<h1>Temporary failure</h1>"});}
      if(route.request().method()==="GET"&&reviewLoadFailure){const status=reviewLoadFailure;reviewLoadFailure=0;return route.fulfill({status,json:{error:"Liste vorübergehend nicht verfügbar."}});}
      if(route.request().method()==="PATCH"){const body=route.request().postDataJSON();writes.push({path:"reviews",body});const review=reviews.find((review) => review.id===body.id);if(review)review.status=body.status;return route.fulfill({json:{ok:true}});}
      await route.fulfill({json:{reviews,counts:{pending:reviews.filter(review=>review.status==="pending").length,approved:reviews.filter(review=>review.status==="approved").length,rejected:reviews.filter(review=>review.status==="rejected").length}}});
    },
    users:async (route) => {
      if(route.request().method()==="PATCH"&&userSaveFailure){const status=userSaveFailure;userSaveFailure=0;return route.fulfill({status,json:{error:"Konto vorübergehend nicht verfügbar."}});}
      if(route.request().method()==="PATCH"){const body=route.request().postDataJSON();writes.push({path:"users",body});const found=users.find((user) => user.uid===body.uid);if(found)Object.assign(found,body);return route.fulfill({json:{ok:true}});}
      if(route.request().method()==="POST"){const body=route.request().postDataJSON();writes.push({path:"users",body});users.push({uid:"new-user",email:body.email,role:body.role,active:true});return route.fulfill({json:{uid:"new-user",temporaryPassword:options.newPassword||null}});}
      await route.fulfill({json:{users}});
    },
    upload:options.upload|| (async (route) => {await route.fulfill({status:503,json:{error:"Vorübergehend nicht verfügbar."}});}),
  });
  return {errors,writes,failNextSave:(status:number)=>{saveFailure=status;},failNextReviewSave:(status:number)=>{reviewSaveFailure=status;},failNextReviewLoad:(status:number)=>{reviewLoadFailure=status;},failNextUserSave:(status:number)=>{userSaveFailure=status;},content:() => data,services:() => categories,reviews:() => reviews,users:() => users};
}
export async function signIn(page:Page,path="/admin") {
  await page.goto(path);
  await expect(page.getByRole("heading",{name:"Anmeldung",exact:true})).toBeVisible();
  await login(page);
  await expect(page.getByRole("heading",{name:"Anmeldung",exact:true})).toHaveCount(0);
}
export async function navigate(page:Page,name:string) {
  const menu=page.getByRole("button",{name:"Navigation öffnen",exact:true});
  if(await menu.isVisible())await menu.click();
  await page.getByRole("navigation",{name:"Admin Navigation",exact:true}).getByRole("link",{name,exact:true}).click();
}
export async function noOverflow(page:Page) {
  expect(await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth}))).toEqual({width:page.viewportSize()!.width,scroll:page.viewportSize()!.width});
  const clipped=await page.locator(".admin-app input:not([type=file]),.admin-app textarea,.admin-app select").evaluateAll((elements) => elements.filter((element) => {
    const rect=element.getBoundingClientRect();return rect.width>0&&rect.height>0&&(rect.left<-.5||rect.right>innerWidth+.5);
  }).map((element) => element.outerHTML.slice(0,120)));
  expect(clipped).toEqual([]);
}
