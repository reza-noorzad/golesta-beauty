import {test} from "node:test";
import assert from "node:assert/strict";
import {contentSchema,initialContent} from "../src/lib/content";
import {productSlug,uniqueProductSlug,setFeaturedOrder,selectedFeatured,visibleFeatured,validateProductChanges} from "../src/lib/product-management";
function fixture(){
  const data=structuredClone(initialContent);
  data.categories=[{id:"hair",name:"Pflege",published:true,sortOrder:0}];
  data.products=Array.from({length:5},(_,i)=>({id:`p${i}`,slug:`pflege-${i}`,name:`Pflege ${i}`,description:"",price:null,currency:"EUR" as const,categoryId:"hair",images:["/images/gallery-01.jpg"],published:i!==4,featured:false,sortOrder:i,variants:[]}));
  return data;
}
test("German slugs are automatic, collision-safe and preserve the current product",()=>{
  const data=fixture();assert.equal(productSlug("Größe M – Öl & Pflege"),"groesse-m-oel-pflege");
  assert.equal(uniqueProductSlug("Pflege 0",data.products),"pflege-0-2");
  assert.equal(uniqueProductSlug("Pflege 0",data.products,"p0"),"pflege-0");
});
test("legacy records keep images and unrelated content; availability stays optional",()=>{
  const data=fixture();const parsed=contentSchema.parse(data);
  assert.equal(Object.hasOwn(parsed.products[0],"available"),false);
  assert.equal(Object.hasOwn(parsed.products[0],"featuredOrder"),false);
  parsed.products[0].available=false;
  parsed.products[0].variants=[{id:"text",name:"Größe M / 1 Liter",price:28.5,available:true}];
  const saved=contentSchema.parse(parsed);
  assert.equal(saved.products[0].available,false);assert.equal(saved.products[0].variants[0].name,"Größe M / 1 Liter");
  assert.deepEqual(saved.gallery,data.gallery);assert.deepEqual(saved.products[0].images,data.products[0].images);
  delete saved.products[0].available;assert.equal(Object.hasOwn(contentSchema.parse(saved).products[0],"available"),false);
  saved.products[0].price=-1;assert.equal(contentSchema.safeParse(saved).success,false);
});
test("featured ordering is independent, limited and excludes unpublished content",()=>{
  const data=fixture();const original=data.products.map(p=>p.id);setFeaturedOrder(data,["p2","p0","p1"]);
  assert.deepEqual(selectedFeatured(data).map(p=>p.id),["p2","p0","p1"]);
  assert.deepEqual(data.products.map(p=>p.id),original);assert.doesNotThrow(()=>validateProductChanges(fixture(),data));
  setFeaturedOrder(data,["p0","p1","p2","p3"]);assert.throws(()=>validateProductChanges(fixture(),data),/höchstens 3/);
  setFeaturedOrder(data,["p4"]);assert.throws(()=>validateProductChanges(fixture(),data),/veröffentlicht/);
  setFeaturedOrder(data,["p0"]);data.categories[0].published=false;assert.deepEqual(visibleFeatured(data),[]);
});
test("unchanged legacy selection is preserved; new blank variants are rejected",()=>{
  const before=fixture();setFeaturedOrder(before,["p0","p1","p2","p4"]);
  before.products[0].variants=[{id:"old",name:"",price:null,available:true}];
  const next=structuredClone(before);next.settings.salonName="Test";
  assert.doesNotThrow(()=>validateProductChanges(before,next));assert.equal(selectedFeatured(next).length,4);
  next.products[1].variants.push({id:"new",name:" ",price:null,available:true});
  assert.throws(()=>validateProductChanges(before,next),/Variante/);
});
