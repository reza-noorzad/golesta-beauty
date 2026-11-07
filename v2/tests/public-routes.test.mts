import { test, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { failure, HttpError, json, limitedBody, readDeadline } from "../src/lib/server/http";
import { initialContent } from "../src/lib/content";
import { initialServices } from "../src/lib/services";

// No credentials are loaded; this module boundary cannot access a real database.
process.env.FIREBASE_PROJECT_ID="demo-golesta-public-tests";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-golesta-public-tests";
const records=new Map<string,Record<string,unknown>>();
let calls=0;let outage=false;
const backend=() => {calls++;return {db:{doc:(path:string) => ({get:async () => {if(outage)throw Error("PRIVATE_BACKEND_DETAIL");return {exists:records.has(path),data:() => structuredClone(records.get(path))};}})}};};
const moduleMock=mock as typeof mock & {module:(name:URL,options:{exports:Record<string,unknown>;cache:boolean}) => void};
moduleMock.module(new URL("../src/lib/server/firebase.ts",import.meta.url),{cache:true,exports:{backend,failure,HttpError,json,limitedBody,readDeadline}});
const content=await import("../src/app/api/content/route");
const services=await import("../src/app/api/services/route");
const reviews=await import("../src/app/api/reviews/route");
beforeEach(() => {records.clear();calls=0;outage=false;records.set("golestaV2/content",{data:structuredClone(initialContent)});records.set("publicServices/current",{categories:initialServices()});});
test("public content does not expose published catalog records while the switch is off",async () => {
  const source=structuredClone(initialContent);
  source.categories=[{id:"hair",name:"Hair",published:true,sortOrder:0}];
  source.products=[{id:"product",name:"Hidden catalog product",slug:"hidden-product",description:"Test",price:20,currency:"EUR",categoryId:"hair",images:["/images/gallery-01.jpg"],published:true,featured:true,sortOrder:0,variants:[]}];
  records.set("golestaV2/content",{data:source});
  const response=await content.GET();assert.equal(response.status,200);
  const publicData=await response.json();assert.deepEqual(publicData.products,[]);assert.deepEqual(publicData.categories,[]);
  assert.equal(JSON.stringify(publicData).includes("Hidden catalog product"),false);
  assert.deepEqual(records.get("golestaV2/content")?.data,source);
});
test("public services read stored categories/prices and use originals only for an absent document",async () => {
  const categories=initialServices().reverse().map((category,index) => ({...category,sortOrder:index}));
  records.set("publicServices/current",{categories});
  const response=await services.GET();assert.equal(response.status,200);assert.deepEqual((await response.json()).categories,categories);
  records.delete("publicServices/current");
  assert.deepEqual((await (await services.GET()).json()).categories,initialServices());
});
test("service failures return safe JSON rather than silently replacing stored data",async (context) => {
  const before=structuredClone(records);context.mock.method(console,"error",() => {});outage=true;
  const response=await services.GET();assert.equal(response.status,500);
  assert.deepEqual(await response.json(),{error:"Serverfehler. Bitte erneut versuchen."});assert.deepEqual(records,before);
});
test("paused public reviews return JSON 404 before any database access or mutation",async () => {
  const before=structuredClone(records);
  for(const [handler,method] of [[reviews.GET,"GET"],[reviews.POST,"POST"]] as const) {
    const response=await handler(new Request("http://localhost/api/reviews?productId=product",{method}));
    assert.equal(response.status,404);assert.equal(typeof (await response.json()).error,"string");
  }
  assert.equal(calls,0);assert.deepEqual(records,before);
});
