import { test, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { failure, HttpError, json, limitedBody, readJson, readDeadline } from "../src/lib/server/http";
import { authorizeAdmin, bearerToken } from "../src/lib/server/authorization";
import { initialContent } from "../src/lib/content";
import { initialServices } from "../src/lib/services";
import type { AdminRole } from "../src/lib/admin-session";

// Mock only the server boundary, never production behavior or authorization rules.
// No environment file is loaded. Every write goes to this process-local Map.
type Document = Record<string, unknown>;
const records = new Map<string, Document>();
let role: AdminRole = "admin";
function snapshot(path: string) { return { id: path.split("/").at(-1), exists: records.has(path), data: () => records.get(path) }; }
function reference(path: string) {
  return { path, get: async () => snapshot(path),
    set: async (data: Document, options?: {merge?: boolean}) => { records.set(path, structuredClone(options?.merge ? {...records.get(path), ...data} : data)); },
    update: async (data: Document) => { records.set(path, {...records.get(path), ...structuredClone(data)}); } };
}
const db = {
  doc: reference,
  collection: (path: string) => {
    type Query={where:(field:string,operator:string,value:string)=>Query;orderBy:(field:string,direction?:string)=>Query;limit:(n:number)=>Query;get:()=>Promise<{docs:ReturnType<typeof snapshot>[]}>;count:()=>{get:()=>Promise<{data:()=>{count:number}}>}};
    function query(filters:[string,string][]=[],limit=Infinity,order="",direction="asc"):Query{
      const matching=()=>[...records.keys()].filter(key=>key.startsWith(path+"/")&&filters.every(([field,value])=>records.get(key)?.[field]===value));
      return {where:(field,_,value)=>query([...filters,[field,value]],limit,order,direction),limit:n=>query(filters,n,order,direction),orderBy:(field,dir="asc")=>query(filters,limit,field,dir),count:()=>({get:async()=>({data:()=>({count:matching().length})})}),get:async()=>({docs:matching().sort((a,b)=>{const result=String(records.get(a)?.[order]||"").localeCompare(String(records.get(b)?.[order]||""));return direction==="desc"?-result:result;}).slice(0,limit).map(snapshot)})};
    }
    return query();
  },
  runTransaction: async (operation: (transaction: {get: (ref: ReturnType<typeof reference>) => Promise<ReturnType<typeof snapshot>>; set: (ref: ReturnType<typeof reference>, data: Document) => void}) => Promise<unknown>) => {
    const pending = new Map<string, Document>();
    const result = await operation({ get: async (ref) => snapshot(ref.path), set: (ref, data) => { pending.set(ref.path, structuredClone(data)); } });
    for (const [path, data] of pending) records.set(path, data);
    return result;
  },
};
let missingAccount=false;let disabledAccount=false;const createdAccounts:{email:string;password:string;disabled:boolean}[]=[];
const auth = { getUser: async () => ({ email: "test@example.invalid" }), getUserByEmail: async () => {if(missingAccount)throw {code:"auth/user-not-found"};return {uid:"target",disabled:disabledAccount};},createUser:async(input:{email:string;password:string;disabled:boolean})=>{createdAccounts.push(input);return {uid:"created-user"};} };
async function requireAdmin(request: Request, roles?: AdminRole[]) {
  const identity = await authorizeAdmin(bearerToken(request), {
    verify: async (token) => { if (token !== "valid") throw {code: "auth/id-token-expired"}; return { uid: "manager" }; },
    administrator: async () => ({ active: true, role }),
  }, roles);
  return { ...identity, db, auth };
}
const moduleMock = mock as typeof mock & { module: (name: URL, options: {exports: Record<string, unknown>; cache: boolean}) => void };
moduleMock.module(new URL("../src/lib/server/firebase.ts", import.meta.url), {
  cache: true, exports: { requireAdmin, failure, HttpError, json, limitedBody, readJson, readDeadline },
});
const content = await import("../src/app/api/admin/content/route");
const services = await import("../src/app/api/admin/services/route");
const reviews = await import("../src/app/api/admin/reviews/route");
const users = await import("../src/app/api/admin/users/route");
const upload = await import("../src/app/api/admin/upload/route");
const session = await import("../src/app/api/admin/session/route");
function request(method = "GET", body?: unknown, token: string | null = "valid") {
  return new Request("http://localhost/api/admin/test", { method, headers: token ? {authorization: `Bearer ${token}`} : {},
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body) });
}
beforeEach(() => {
  role = "admin"; records.clear();missingAccount=false;disabledAccount=false;createdAccounts.length=0;
  records.set("admins/manager",{active:true,role:"superadmin"});
  records.set("golestaV2/content", { data: structuredClone(initialContent), revision: 7 });
  records.set("publicServices/current", { categories: initialServices(), updatedAt: "2026-11-01T12:00:00.000Z" });
  records.set("golestaV2Reviews/review1", { productId: "test", name: "Test", rating: 5, comment: "Original comment", status: "pending", createdAt: "2026-11-01T12:00:00.000Z" });
});
test("every admin handler returns JSON 401 without authentication, without changing records", async () => {
  const before = structuredClone(records);
  const handlers = [[content.GET,"GET"],[content.PUT,"PUT"],[services.GET,"GET"],[services.PUT,"PUT"],[reviews.GET,"GET"],[reviews.PATCH,"PATCH"],[users.GET,"GET"],[users.POST,"POST"],[users.PATCH,"PATCH"],[upload.POST,"POST"],[session.GET,"GET"]] as const;
  for (const [handler, method] of handlers) {
    const response = await handler(request(method, undefined, null));
    assert.equal(response.status, 401);
    assert.equal(typeof (await response.json()).error, "string");
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.deepEqual(records, before);
});
test("expired session and role restrictions are enforced by handlers", async () => {
  assert.equal((await session.GET(request("GET", undefined, "expired"))).status, 401);
  role = "editor";
  assert.equal((await users.GET(request())).status, 403);
  assert.deepEqual(await (await session.GET(request())).json(), { uid: "manager", role: "editor" });
});
test("content/products/gallery load and settings save retain unrelated original data", async () => {
  const loaded = await (await content.GET(request())).json();
  assert.deepEqual(loaded.data, initialContent);
  const changed = structuredClone(loaded.data);
  changed.settings.salonName = "Isolated test salon";
  const saved = await content.PUT(request("PUT", { data: changed, revision: loaded.revision }));
  assert.equal(saved.status, 200);
  assert.deepEqual(await saved.json(), { revision: 8 });
  const after = await (await content.GET(request())).json();
  assert.deepEqual(after.data.gallery, initialContent.gallery);
  assert.deepEqual(after.data.products, initialContent.products);
  assert.equal(after.data.settings.salonName, changed.settings.salonName);
});
test("stale content revisions and editor settings changes cannot overwrite data", async () => {
  const before = structuredClone(records.get("golestaV2/content"));
  assert.equal((await content.PUT(request("PUT", {data: initialContent, revision: 6}))).status, 409);
  role = "editor";
  const changed = structuredClone(initialContent); changed.settings.salonName = "Forbidden change";
  assert.equal((await content.PUT(request("PUT", {data: changed, revision: 7}))).status, 403);
  assert.deepEqual(records.get("golestaV2/content"), before);
});
test("published and draft products with text variants round-trip through content without loss", async () => {
  const fixture = structuredClone(initialContent);
  fixture.categories = [{id:"test-category",name:"Test category",published:true,sortOrder:0}];
  fixture.products = [true,false].map((published,index) => ({id:`test-${index}`,name:`Test product ${index}`,slug:`test-product-${index}`,
    published,sortOrder:index,description:"Isolated fixture",price:25,currency:"EUR",categoryId:"test-category",images:[],featured:false,
    variants:[{id:"size",name:"250 ml",price:25,available:true}]}));
  const saved = await content.PUT(request("PUT",{data:fixture,revision:7}));
  assert.equal(saved.status,200);
  const loaded = await (await content.GET(request())).json();
  assert.deepEqual(loaded.data.products,fixture.products);
  assert.deepEqual(loaded.data.gallery,initialContent.gallery);
});
test("services load/save and optimistic concurrency preserve prices and reject stale writes", async () => {
  const loaded = await (await services.GET(request())).json();
  assert.deepEqual(loaded.categories, initialServices());
  const saved = await services.PUT(request("PUT", {categories: loaded.categories, expectedUpdatedAt: loaded.updatedAt}));
  assert.equal(saved.status, 200);
  assert.equal((await services.PUT(request("PUT", {categories: [], expectedUpdatedAt: loaded.updatedAt}))).status, 409);
  assert.deepEqual((await (await services.GET(request())).json()).categories, initialServices());
});

function productFixture() {
  const data=structuredClone(initialContent);
  data.categories=[{id:"hair",name:"Pflege",published:true,sortOrder:0}];
  data.products=Array.from({length:5},(_,i)=>({id:`p${i}`,name:`Pflege ${i}`,slug:`pflege-${i}`,description:"",price:null,currency:"EUR" as const,images:["/images/gallery-01.jpg"],categoryId:"hair",published:i!==4,featured:false,sortOrder:i,variants:[{id:`v${i}`,name:"Größe M / 1 Liter",price:25,available:true}]}));
  return data;
}
test("optional availability and independent featured ordering round-trip through actual handlers",async()=>{
  const data=productFixture();data.products[0].available=false;data.products[1].featured=true;data.products[1].featuredOrder=0;data.products[0].featured=true;data.products[0].featuredOrder=1;
  assert.equal((await content.PUT(request("PUT",{data,revision:7}))).status,200);
  const loaded=await(await content.GET(request())).json();assert.deepEqual(loaded.data.products,data.products);assert.deepEqual(loaded.data.gallery,initialContent.gallery);
  delete data.products[0].available;
  assert.equal((await content.PUT(request("PUT",{data,revision:8}))).status,200);
  assert.equal(Object.hasOwn((await(await content.GET(request())).json()).data.products[0],"available"),false);
});
test("invalid featured selections, blank new variants and referenced-category removal reject without writes",async()=>{
  const original=structuredClone(records);
  for(const kind of ["limit","draft","category","variant"]){
    const data=productFixture();
    if(kind==="limit")data.products.slice(0,4).forEach(p=>{p.featured=true;});
    if(kind==="draft")data.products[4].featured=true;
    if(kind==="category")data.categories=[];
    if(kind==="variant")data.products[0].variants[0].name=" ";
    const result=await content.PUT(request("PUT",{data,revision:7}));assert.equal(result.status,400,kind);assert.equal(typeof(await result.json()).error,"string");assert.deepEqual(records,original);
  }
});
test("unchanged legacy featured records survive unrelated saves without silent data removal",async()=>{
  const data=productFixture();data.products.forEach(p=>p.featured=true);records.set("golestaV2/content",{data:structuredClone(data),revision:7});
  data.settings.salonName="Isolated change";
  assert.equal((await content.PUT(request("PUT",{data,revision:7}))).status,200);
  assert.deepEqual((await(await content.GET(request())).json()).data.products,data.products);
});
test("review moderation only updates status/time and rejects invalid document paths", async () => {
  assert.equal((await reviews.PATCH(request("PATCH", {id: "review1", status: "approved"}))).status, 200);
  assert.equal(records.get("golestaV2Reviews/review1")?.comment, "Original comment");
  assert.equal(records.get("golestaV2Reviews/review1")?.status, "approved");
  assert.equal((await reviews.PATCH(request("PATCH", {id: "other/path/record", status: "rejected"}))).status, 400);
  assert.equal((await reviews.PATCH(request("PATCH", {id: "missing", status: "approved"}))).status, 404);
});
test("all JSON-writing handlers return 400 for malformed JSON after authorization", async () => {
  role = "superadmin";
  for (const [handler, method] of [[content.PUT,"PUT"],[services.PUT,"PUT"],[reviews.PATCH,"PATCH"],[users.POST,"POST"],[users.PATCH,"PATCH"]] as const) {
    const response = await handler(request(method, "{broken"));
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /JSON/);
  }
});
test("superadmin cannot change their own role and path injection is rejected", async () => {
  role = "superadmin";
  assert.equal((await users.PATCH(request("PATCH", {uid: "manager", role: "editor", active: false}))).status, 400);
  assert.equal((await users.PATCH(request("PATCH", {uid: "one/two/three", role: "admin", active: true}))).status, 400);
});

test("older pending reviews stay visible and complete counts remain consistent after moderation",async()=>{
  records.set("golestaV2Reviews/review1",{productId:"p",name:"Old pending",rating:5,comment:"Keep original text",status:"pending",createdAt:"2000-01-01T00:00:00Z"});
  for(let i=0;i<220;i++)records.set(`golestaV2Reviews/recent-${i}`,{productId:"p",name:"Recent",rating:4,comment:"Approved text",status:"approved",createdAt:"2026-11-01T12:00:00Z"});
  let loaded=await(await reviews.GET(request())).json();assert.deepEqual(loaded.counts,{pending:1,approved:220,rejected:0});assert.equal(loaded.reviews.some((r:{id:string})=>r.id==="review1"),true);
  assert.equal((await reviews.PATCH(request("PATCH",{id:"review1",status:"rejected"}))).status,200);
  loaded=await(await reviews.GET(request())).json();assert.deepEqual(loaded.counts,{pending:0,approved:220,rejected:1});assert.equal(records.get("golestaV2Reviews/review1")?.comment,"Keep original text");
});
test("ordinary administrators and editors cannot create accounts or grant themselves roles",async()=>{
  const before=structuredClone(records);
  for(const value of ["editor","admin"] as const){role=value;assert.equal((await users.POST(request("POST",{email:"other@example.invalid",role:"superadmin"}))).status,403);assert.equal((await users.PATCH(request("PATCH",{uid:"manager",role:"superadmin",active:true}))).status,403);}
  assert.deepEqual(records,before);
});
test("account attachment cannot overwrite an existing administrator; explicit changes preserve metadata",async()=>{
  role="superadmin";records.set("admins/target",{role:"editor",active:true,note:"Preserve me"});const before=structuredClone(records);
  assert.equal((await users.POST(request("POST",{email:"other@example.invalid",role:"admin"}))).status,409);assert.deepEqual(records,before);
  assert.equal((await users.PATCH(request("PATCH",{uid:"target",role:"admin",active:false}))).status,200);
  assert.equal(records.get("admins/target")?.active,false);assert.equal(records.get("admins/target")?.note,"Preserve me");
});
test("account mutations recheck acting salon lead transactionally, preventing stale authority",async()=>{
  role="superadmin";records.set("admins/target",{role:"editor",active:true});records.set("admins/manager",{role:"admin",active:true});const before=structuredClone(records);
  assert.equal((await users.PATCH(request("PATCH",{uid:"target",role:"superadmin",active:false}))).status,403);
  assert.equal((await users.POST(request("POST",{email:"new@example.invalid",role:"editor"}))).status,403);assert.deepEqual(records,before);
});
test("authorized account attachment succeeds without inventing an invitation email",async()=>{
  role="superadmin";const response=await users.POST(request("POST",{email:"existing@example.invalid",role:"editor"}));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{uid:"target",temporaryPassword:null});assert.equal(records.get("admins/target")?.role,"editor");
});
test("new accounts receive a random start password; disabled existing accounts cannot be reactivated implicitly",async()=>{
  role="superadmin";disabledAccount=true;const before=structuredClone(records);
  assert.equal((await users.POST(request("POST",{email:"disabled@example.invalid",role:"editor"}))).status,409);assert.deepEqual(records,before);
  disabledAccount=false;missingAccount=true;const response=await users.POST(request("POST",{email:"new@example.invalid",role:"editor"}));const body=await response.json();
  assert.equal(response.status,200);assert.equal(body.uid,"created-user");assert.equal(typeof body.temporaryPassword,"string");assert.equal(body.temporaryPassword.length,32);
  assert.equal(createdAccounts.length,1);assert.equal(createdAccounts[0].disabled,false);assert.equal(records.get("admins/created-user")?.role,"editor");
});
test("changed announcement dates, optional links and active offer validation are enforced by content API",async()=>{
  for(const kind of ["period","link","message","promotion"]){
    const data=structuredClone(initialContent);data.announcements=[{id:"a",enabled:true,type:"hours",title:"Hinweis",message:"Andere Öffnungszeiten"}];
    if(kind==="period")Object.assign(data.announcements[0],{startsAt:"2026-12-01T00:00:00Z",endsAt:"2026-11-01T00:00:00Z"});
    if(kind==="link")data.announcements[0].linkUrl="/leistungen";
    if(kind==="message")data.announcements[0].message="";
    if(kind==="promotion")data.promotions=[{id:"offer",title:"",enabled:true,type:"fixed",value:0}];
    const before=structuredClone(records);assert.equal((await content.PUT(request("PUT",{data,revision:7}))).status,400,kind);assert.deepEqual(records,before);
  }
});
