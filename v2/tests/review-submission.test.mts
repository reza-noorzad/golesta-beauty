import {test,mock,beforeEach} from "node:test";
import assert from "node:assert/strict";
import {initialContent} from "../src/lib/content";
import {failure,HttpError,limitedBody} from "../src/lib/server/http";
// Enabled-catalog coverage exists only in this isolated module process.
// The real release flag and real Firebase remain untouched.
const records=new Map<string,Record<string,unknown>>();let calls=0;
function snapshot(path:string){return {id:path.split("/").at(-1)!,exists:records.has(path),data:()=>records.get(path)};}
type Query={where:(field:string,operator:string,value:string)=>Query;limit:(n:number)=>Query;get:()=>Promise<{docs:ReturnType<typeof snapshot>[]}>;add:(data:Record<string,unknown>)=>Promise<void>};
function query(path:string,filters:[string,string][]=[],limit=200):Query{return {
  where:(field,_,value)=>query(path,[...filters,[field,value]],limit),limit:n=>query(path,filters,n),get:async()=>({docs:[...records.keys()].filter(key=>key.startsWith(path+"/")&&filters.every(([field,value])=>records.get(key)?.[field]===value)).slice(0,limit).map(snapshot)}),add:async data=>{records.set(`${path}/review-${records.size}`,structuredClone(data));}
};}
const db={doc:(path:string)=>({path,get:async()=>snapshot(path)}),collection:query,runTransaction:async(operation:(tx:{get:(ref:{path:string})=>Promise<ReturnType<typeof snapshot>>;set:(ref:{path:string},data:Record<string,unknown>)=>void})=>Promise<void>)=>operation({get:async ref=>snapshot(ref.path),set:(ref,data)=>{records.set(ref.path,structuredClone(data));}})};
const moduleMock=mock as typeof mock&{module:(name:URL,options:{exports:Record<string,unknown>;cache:boolean})=>void};
moduleMock.module(new URL("../src/lib/server/firebase.ts",import.meta.url),{cache:true,exports:{backend:()=>{calls++;return {db};},failure,HttpError,limitedBody}});
moduleMock.module(new URL("../src/lib/public-config.ts",import.meta.url),{cache:true,exports:{PUBLIC_CATALOG_ENABLED:true}});
const reviews=await import("../src/app/api/reviews/route");
function request(body:unknown,origin="http://localhost"){return new Request("http://localhost/api/reviews",{method:"POST",headers:{origin,"x-forwarded-for":"192.0.2.1"},body:typeof body==="string"?body:JSON.stringify(body)});}
const submission={productId:"p",name:"Testkundin",rating:5,comment:"Eine ausführliche Rückmeldung."};
beforeEach(()=>{calls=0;records.clear();const data=structuredClone(initialContent);data.categories=[{id:"hair",name:"Pflege",published:true,sortOrder:0}];data.products=[{id:"p",name:"Pflege",slug:"pflege",description:"",price:25,currency:"EUR",images:[],categoryId:"hair",sortOrder:0,published:true,featured:false,variants:[],allowReviews:true}];records.set("golestaV2/content",{data});});
test("review submission requires same origin, valid input and a clean honeypot before database access",async()=>{
  const before=structuredClone(records);
  assert.equal((await reviews.POST(request(submission,"https://foreign.invalid"))).status,403);
  assert.equal((await reviews.POST(request(submission,"not-an-origin"))).status,403);
  assert.equal((await reviews.POST(request(submission,"https://localhost"))).status,403);
  assert.equal((await reviews.POST(request({...submission,rating:6}))).status,400);
  assert.equal((await reviews.POST(request("x".repeat(5000)))).status,413);
  assert.equal((await reviews.POST(request({...submission,website:"spam"}))).status,200);
  assert.equal(calls,0);assert.deepEqual(records,before);
});
test("new submissions remain pending and daily rate limiting prevents a fourth review",async()=>{
  for(let i=0;i<3;i++)assert.equal((await reviews.POST(request(submission))).status,201);
  const submitted=[...records.entries()].filter(([key])=>key.startsWith("golestaV2Reviews/"));assert.equal(submitted.length,3);assert.equal(submitted.every(([,data])=>data.status==="pending"),true);
  assert.equal((await reviews.POST(request(submission))).status,429);
  const publicResponse=await reviews.GET(new Request("http://localhost/api/reviews?productId=p"));assert.deepEqual(await publicResponse.json(),{reviews:[]});
});
test("public review reads expose only approved reviews on eligible published products",async()=>{
  for(const status of ["pending","approved","rejected"])records.set(`golestaV2Reviews/${status}`,{...submission,status,createdAt:"2026-11-01T12:00:00Z"});
  const response=await reviews.GET(new Request("http://localhost/api/reviews?productId=p"));assert.equal(response.status,200);assert.deepEqual((await response.json()).reviews.map((r:{id:string})=>r.id),["approved"]);
  const data=records.get("golestaV2/content")!.data as typeof initialContent;data.products[0].published=false;
  assert.equal((await reviews.GET(new Request("http://localhost/api/reviews?productId=p"))).status,404);assert.equal((await reviews.POST(request(submission))).status,403);
  data.products[0].published=true;data.categories[0].published=false;assert.equal((await reviews.POST(request(submission))).status,403);
});
