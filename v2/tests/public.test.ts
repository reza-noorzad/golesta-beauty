import { test } from "node:test";
import assert from "node:assert/strict";
import { initialContent, publicContent } from "../src/lib/content";
import { PUBLIC_CATALOG_ENABLED } from "../src/lib/public-config";
import { contactLinks, publicSiteContent } from "../src/lib/public-content";

test("public catalog is paused without altering stored/admin products or images", () => {
  const source=structuredClone(initialContent);
  source.categories=[{id:"hair",name:"Haarpflege",published:true,sortOrder:0}];
  source.products=[{id:"product",name:"Isolated product",slug:"isolated-product",description:"Test",price:20,currency:"EUR",categoryId:"hair",images:["/images/gallery-01.jpg"],published:true,featured:true,sortOrder:0,variants:[]}];
  source.promotions=[{id:"sale",title:"Test sale",enabled:true,type:"percent",value:10}];
  const before=structuredClone(source);
  assert.equal(PUBLIC_CATALOG_ENABLED,false);
  const closed=publicSiteContent(source);
  assert.deepEqual(closed.products,[]);assert.deepEqual(closed.categories,[]);assert.deepEqual(closed.promotions,[]);
  assert.deepEqual(closed.team,source.team);assert.deepEqual(closed.gallery,source.gallery);assert.deepEqual(closed.settings,publicContent(source).settings);
  assert.deepEqual(source,before);
  const restored=publicSiteContent(source,true);
  assert.deepEqual(restored.products,source.products);assert.deepEqual(restored.categories,source.categories);assert.deepEqual(restored.promotions,source.promotions);
  assert.deepEqual(source,before);
});
test("contact links use current configured values and normalize telephone formatting", () => {
  const original={phone:"+43 (676) 911-1317",whatsapp:"436769111317"};
  assert.equal(contactLinks(original).phone,"tel:+436769111317");
  assert.equal(new URL(contactLinks(original).whatsapp).pathname,"/436769111317");
  const changed={phone:"+43 (676) 911-1318",whatsapp:"436769111318"};
  assert.equal(contactLinks(changed).phone,"tel:+436769111318");
  assert.equal(new URL(contactLinks(changed).whatsapp).pathname,"/436769111318");
});
