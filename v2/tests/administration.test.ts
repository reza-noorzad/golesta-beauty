import {test} from "node:test";
import assert from "node:assert/strict";
import {initialContent} from "../src/lib/content";
import {validateAdministrationChanges} from "../src/lib/administration";
import {isActivePeriod,productPrice} from "../src/lib/pricing";
test("changed announcements validate dates, publication and complete optional links without rewriting legacy records",()=>{
  const before=structuredClone(initialContent),next=structuredClone(before);
  next.announcements=[{id:"a",enabled:true,type:"holiday",title:"Urlaub",message:"Geschlossen",startsAt:"2026-12-01T12:00:00Z",endsAt:"2026-11-01T12:00:00Z"}];
  assert.throws(()=>validateAdministrationChanges(before,next),/Ende/);
  assert.doesNotThrow(()=>validateAdministrationChanges(next,structuredClone(next)));
  next.announcements[0].endsAt="2027-01-01T12:00:00Z";next.announcements[0].linkUrl="/leistungen";
  assert.throws(()=>validateAdministrationChanges(before,next),/gemeinsam/);
  next.announcements[0].linkLabel="Leistungen";assert.doesNotThrow(()=>validateAdministrationChanges(before,next));
  next.announcements[0].message=" ";assert.throws(()=>validateAdministrationChanges(before,next),/Nachricht/);
});
test("schedule boundaries honor offsets, activation and expiration; malformed periods stay hidden",()=>{
  const period={enabled:true,startsAt:"2026-12-24T09:00:00+01:00",endsAt:"2026-12-24T10:00:00+01:00"};
  assert.equal(isActivePeriod(period,Date.parse("2026-12-24T07:59:59Z")),false);
  assert.equal(isActivePeriod(period,Date.parse("2026-12-24T08:00:00Z")),true);
  assert.equal(isActivePeriod(period,Date.parse("2026-12-24T09:00:00Z")),false);
  assert.equal(isActivePeriod({...period,enabled:false},Date.parse("2026-12-24T08:30:00Z")),false);
  assert.equal(isActivePeriod({enabled:true,startsAt:"invalid"}),false);
  assert.equal(isActivePeriod({...period,startsAt:period.endsAt,endsAt:period.startsAt}),false);
});
test("global/category/fixed/product offers do not stack and exclusions do not change availability",()=>{
  const product={id:"p",name:"Pflege",slug:"pflege",description:"",currency:"EUR" as const,categoryId:"hair",price:50,published:true,sortOrder:0,images:[],featured:false,available:false,variants:[{id:"v",name:"1 Liter",price:100,available:true}],discount:{enabled:true,type:"percent" as const,value:10}};
  const promotions=[{id:"sale",title:"Angebot",enabled:true,type:"fixed" as const,value:20,categoryIds:["skin"],excludeProductIds:[] as string[],startsAt:"",endsAt:""}];
  assert.equal(productPrice(product,promotions).current,45);
  promotions[0].categoryIds=[];assert.equal(productPrice(product,promotions).current,30);
  assert.equal(productPrice(product,promotions,"v").current,80);
  promotions[0].excludeProductIds=["p"];assert.equal(productPrice(product,promotions).current,45);assert.equal(product.available,false);
  promotions[0].excludeProductIds=[];promotions[0].endsAt="2000-01-01T00:00:00Z";assert.equal(productPrice(product,promotions).current,45);
  promotions[0].endsAt="";promotions[0].value=1000;assert.equal(productPrice(product,promotions).current,0);
  assert.equal(productPrice({...product,price:null},promotions).current,null);
});
test("active promotion, social and voucher validation preserve unchanged records",()=>{
  const before=structuredClone(initialContent),next=structuredClone(before);
  next.promotions=[{id:"sale",title:"",enabled:true,type:"percent",value:0}];assert.throws(()=>validateAdministrationChanges(before,next),/Aktive Aktionen/);
  next.promotions=[];next.settings.socials=[{id:"network",name:"",url:"",published:true}];assert.throws(()=>validateAdministrationChanges(before,next),/Profil-Link/);
  next.settings.socials=[];next.voucher.description="";assert.throws(()=>validateAdministrationChanges(before,next),/Gutscheinbeschreibung/);
});
