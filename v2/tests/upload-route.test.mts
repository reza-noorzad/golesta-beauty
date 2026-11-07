import {test,mock,beforeEach} from "node:test";
import assert from "node:assert/strict";
import {Writable} from "node:stream";
import sharp from "sharp";
import {failure,HttpError,limitedBody,json} from "../src/lib/server/http";
// Both remote boundaries are replaced before importing the real upload handler.
// These synthetic credentials never leave this process. No .env file is loaded.
process.env.CLOUDINARY_CLOUD_NAME="isolated";
process.env.CLOUDINARY_API_KEY="isolated";
process.env.CLOUDINARY_API_SECRET="isolated";
let count=0;let calls=0;let fail=false;let uploaded=Buffer.alloc(0);let options:Record<string,unknown>={};
const moduleMock=mock as typeof mock & {module:(name:URL|string,options:{exports:Record<string,unknown>;cache:boolean})=>void};
moduleMock.module(new URL("../src/lib/server/firebase.ts",import.meta.url),{cache:true,exports:{failure,HttpError,limitedBody,json,
  requireAdmin:async(request:Request)=>{
    if(request.headers.get("authorization")!=="Bearer isolated")throw new HttpError(401,"Bitte erneut anmelden.");
    return {uid:"fixture",db:{doc:()=>({}),runTransaction:async(operation:(tx:unknown)=>Promise<void>)=>{
      let next=count;await operation({get:async()=>({data:()=>({start:Date.now(),count})}),set:(_:unknown,data:{count:number})=>{next=data.count;}});count=next;
    }}};
  }
}});
moduleMock.module("cloudinary",{cache:true,exports:{v2:{config:()=>{},uploader:{upload_stream:(settings:Record<string,unknown>,callback:(error:Error|null,result?:{secure_url:string})=>void)=>{
  calls++;options=settings;const chunks:Buffer[]=[];
  return new Writable({write(chunk,_,done){chunks.push(Buffer.from(chunk));done();},final(done){uploaded=Buffer.concat(chunks);callback(fail?new Error("private upstream details"):null,{secure_url:"https://res.cloudinary.com/isolated/image/upload/v1/golesta-v2/test.webp"});done();}});
}}}}});
const {POST}=await import("../src/app/api/admin/upload/route");
const request=(bytes:Buffer,authorized=true)=>new Request("http://localhost/api/admin/upload",{method:"POST",headers:authorized?{authorization:"Bearer isolated"}:{},body:new Uint8Array(bytes)});
beforeEach(()=>{count=0;calls=0;fail=false;uploaded=Buffer.alloc(0);options={};});
test("upload handler optimizes raster bytes and passes non-destructive Cloudinary options",async()=>{
  const bytes=await sharp({create:{width:2200,height:1100,channels:3,background:"#ccc"}}).jpeg().withMetadata({orientation:6}).toBuffer();
  const response=await POST(request(bytes));assert.equal(response.status,200);assert.match((await response.json()).url,/golesta-v2/);
  const meta=await sharp(uploaded).metadata();assert.equal(meta.format,"webp");assert.equal(meta.width,900);assert.equal(meta.height,1800);assert.equal(meta.exif,undefined);
  assert.equal(options.folder,"golesta-v2");assert.equal(options.overwrite,false);assert.equal(options.resource_type,"image");assert.equal(count,1);assert.equal(calls,1);
});
test("unauthorized, spoofed, empty and oversized uploads cannot reach Cloudinary",async()=>{
  for(const [bytes,authorized,status] of [[Buffer.from("fake image"),false,401],[Buffer.from("fake image"),true,400],[Buffer.alloc(0),true,400],[Buffer.alloc(4*1024*1024+1),true,413]] as const){
    const response=await POST(request(bytes,authorized));assert.equal(response.status,status);assert.equal(typeof(await response.json()).error,"string");
  }
  assert.equal(calls,0);assert.equal(count,0);
});
test("upload limits and upstream failures return safe JSON and never delete assets",async()=>{
  const bytes=await sharp({create:{width:10,height:10,channels:3,background:"#fff"}}).png().toBuffer();
  count=60;assert.equal((await POST(request(bytes))).status,429);assert.equal(calls,0);
  count=0;fail=true;const response=await POST(request(bytes));assert.equal(response.status,502);assert.doesNotMatch(JSON.stringify(await response.json()),/private upstream/);
  assert.equal(calls,1);assert.equal(count,1);
});
