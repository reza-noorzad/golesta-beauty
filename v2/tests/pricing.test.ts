import { test } from "node:test";
import assert from "node:assert/strict";
import { initialContent, parseStoredContent, contentSchema } from "../src/lib/content";
import { discountedPrice, isActivePeriod, productPrice } from "../src/lib/pricing";

test("old documents migrate gallery homepage flags without losing existing data", () => {
  const legacy=structuredClone(initialContent);
  legacy.gallery.forEach(g=>delete g.homepage);
  delete legacy.announcements;delete legacy.promotions;
  const loaded=parseStoredContent(legacy);
  assert.equal(loaded.gallery.length,18);
  assert.equal(loaded.gallery.filter(g=>g.homepage).length,6);
  assert.deepEqual(loaded.announcements,[]);
  assert.deepEqual(loaded.promotions,[]);
});
test("scheduled announcements are only active inside the correct interval",()=>{
  const a={enabled:true,startsAt:"2026-12-24T08:00:00+01:00",endsAt:"2027-01-02T08:00:00+01:00"};
  assert.equal(isActivePeriod(a,Date.parse("2026-12-23T09:00:00Z")),false);
  assert.equal(isActivePeriod(a,Date.parse("2026-12-25T09:00:00Z")),true);
  assert.equal(isActivePeriod(a,Date.parse("2027-01-03T09:00:00Z")),false);
});
test("discounts apply once, lowest valid price wins, no stacking",()=>{
  const product={...initialContent.products[0],id:"test",slug:"test",name:"test",description:"",price:50,currency:"EUR" as const,categoryId:"abc",images:[],published:true,featured:false,sortOrder:0,variants:[],
    discount:{enabled:true,type:"percent" as const,value:10}};
  const promotions=[{id:"sale",title:"Sale",enabled:true,type:"percent" as const,value:20,categoryIds:["abc"],excludeProductIds:[] as string[]}];
  const price=productPrice(product,promotions);
  assert.equal(price.original,50);assert.equal(price.current,40);
  promotions[0].excludeProductIds=["test"];
  assert.equal(productPrice(product,promotions).current,45);
  assert.equal(discountedPrice(50,{enabled:false,type:"fixed",value:30}),50);
});
test("Cloudinary URLs allowed, unrelated domains forbidden",()=>{
  const data=structuredClone(initialContent);
  data.team[0].image="https://res.cloudinary.com/demo/image/upload/v1234/golesta-v2/12345678-1234-1234-1234-123456789012.webp";
  assert.equal(contentSchema.safeParse(data).success,true);
  data.team[0].image="https://evil.invalid/a.webp";
  assert.equal(contentSchema.safeParse(data).success,false);
});
