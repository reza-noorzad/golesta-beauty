import {test,expect,type Page} from "@playwright/test";
import {readFileSync} from "node:fs";
import sharp from "sharp";
import {adminFixture,signIn,noOverflow} from "./support/admin-fixture";
import type {Content} from "../src/lib/content";
test.use({baseURL:process.env.GOLESTA_TEST_BASE_URL||"http://127.0.0.1:3000",launchOptions:{channel:process.env.GOLESTA_TEST_BROWSER_CHANNEL}});
const rows=(page:Page)=>page.locator("[data-product-id]");
const save=(page:Page)=>page.getByRole("button",{name:"Änderungen speichern",exact:true});
test("renaming a searched product keeps the editor mounted until the next explicit search",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!);await signIn(page,"/admin/produkte");const search=page.getByRole("searchbox",{name:"Suche",exact:true});await search.fill("Pflegeshampoo");await rows(page).first().locator("summary").first().click();const name=page.getByRole("textbox",{name:"Produktname",exact:true});await name.fill("Neue Pflege");await expect(name).toBeVisible();await expect(name).toHaveValue("Neue Pflege");await saved(page);expect(fixture.content().products[0].name).toBe("Neue Pflege");await search.fill("Gesichtspflege");await expect(name).toHaveCount(0);await expect(rows(page)).toHaveCount(1);
});
test("a custom product link accepts a hyphen typed on the keyboard",async({page,baseURL})=>{
  await adminFixture(page,baseURL!);await signIn(page,"/admin/produkte");await rows(page).first().locator("summary").first().click();const link=page.getByRole("textbox",{name:"Produktlink",exact:true});await link.fill("");await link.pressSequentially("meine-pflege");await expect(link).toHaveValue("meine-pflege");await saved(page);
});
async function saved(page:Page){await save(page).click();await expect(page.getByRole("status").filter({hasText:"Deine Änderungen wurden gespeichert"})).toBeVisible();}
function large(data:Content){
  const template=data.products[0];
  data.products=Array.from({length:45},(_,i)=>({...structuredClone(template),id:`product-${i}`,slug:`produkt-${i}`,name:`Pflege ${i}`,brand:i===40?"Spezialmarke":"Salonpflege",published:i%2===0,featured:i===0,categoryId:i%3===0?"skin":"hair",sortOrder:i}));
  data.gallery=Array.from({length:60},(_,i)=>({...structuredClone(data.gallery[0]),id:`photo-${i}`,alt:`Salonfoto ${i}`,homepage:i<8,published:i!==2,sortOrder:i}));
}
test("large product collections search by brand/name, filter and mount only one editor",async({page,baseURL})=>{
  await adminFixture(page,baseURL!,{configure:large});await signIn(page,"/admin/produkte");
  await expect(rows(page)).toHaveCount(15);await expect(page.getByRole("textbox",{name:"Produktname",exact:true})).toHaveCount(0);
  await rows(page).nth(0).locator("summary").first().click();await rows(page).nth(1).locator("summary").first().click();
  await expect(page.getByRole("textbox",{name:"Produktname",exact:true})).toHaveCount(1);
  await expect(rows(page).nth(0)).not.toHaveAttribute("open","");
  await rows(page).nth(1).locator("summary").first().click();await expect(page.getByRole("textbox",{name:"Produktname",exact:true})).toHaveCount(0);
  const search=page.getByRole("searchbox",{name:"Suche",exact:true});await search.fill("Spezialmarke");await expect(rows(page)).toHaveCount(1);await expect(rows(page)).toContainText("Pflege 40");
  await search.fill("Pflege 44");await expect(rows(page)).toHaveCount(1);
  await search.fill("");await page.getByRole("combobox",{name:"Kategorie",exact:true}).selectOption("skin");await expect(rows(page)).toHaveCount(15);
  await page.getByRole("combobox",{name:"Status",exact:true}).selectOption("draft");await expect(rows(page)).toHaveCount(7);
  await page.getByRole("combobox",{name:"Kategorie",exact:true}).selectOption("all");await page.getByRole("combobox",{name:"Status",exact:true}).selectOption("all");
  await page.getByRole("navigation",{name:"Produktseiten"}).getByRole("button",{name:"Nächste",exact:true}).click();await expect(rows(page).first()).toHaveAttribute("data-product-id","product-15");
});
test("new product stays visible, name updates its heading, slug is unique and manual links survive renaming",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!);await signIn(page,"/admin/produkte");
  await page.getByRole("searchbox",{name:"Suche",exact:true}).fill("nothing");await page.getByRole("button",{name:"+ Neues Produkt (Entwurf)",exact:true}).click();
  await expect(page.getByRole("textbox",{name:"Produktname",exact:true})).toHaveValue("");
  await page.getByRole("textbox",{name:"Produktname",exact:true}).fill("Öl Pflege");await expect(rows(page).first().locator("summary").first()).toContainText("Öl Pflege");
  await expect(page.getByRole("textbox",{name:"Produktlink",exact:true})).toHaveValue("oel-pflege");
  await page.getByRole("textbox",{name:"Produktlink",exact:true}).fill("mein-produkt");await page.getByRole("textbox",{name:"Produktname",exact:true}).fill("Pflege Neu");
  await expect(page.getByRole("textbox",{name:"Produktlink",exact:true})).toHaveValue("mein-produkt");await saved(page);
  expect(fixture.content().products[0].name).toBe("Pflege Neu");expect(fixture.content().products[0]).not.toHaveProperty("available");
});
test("text variants and optional availability round-trip; failed non-JSON save retains draft",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!);await signIn(page,"/admin/produkte");await rows(page).first().locator("summary").first().click();
  const available=page.getByRole("combobox",{name:"Verfügbarkeit (optional)",exact:true});await expect(available).toHaveValue("");await available.selectOption("false");
  await page.locator("summary").filter({hasText:"Größen & Varianten"}).click();
  await page.getByRole("textbox",{name:"Größe / Inhalt",exact:true}).fill("1 Liter");await page.getByRole("button",{name:"+ Variante",exact:true}).click();
  await page.getByRole("textbox",{name:"Größe / Inhalt",exact:true}).last().fill("Größe M");
  fixture.failNextSave(502);await save(page).click();await expect(page.locator(".admin-app [role=alert]")).toBeVisible();
  await expect(page.getByRole("textbox",{name:"Größe / Inhalt",exact:true}).last()).toHaveValue("Größe M");expect(fixture.writes).toHaveLength(0);
  await saved(page);expect(fixture.content().products[0].available).toBe(false);expect(fixture.content().products[0].variants.map(v=>v.name)).toEqual(["1 Liter","Größe M"]);
  await available.selectOption("true");await saved(page);expect(fixture.content().products[0].available).toBe(true);
  await available.selectOption("");await saved(page);expect(fixture.content().products[0]).not.toHaveProperty("available");expect(fixture.errors).toEqual([]);
});
test("blank new variants and negative prices show validation without losing edits",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!);await signIn(page,"/admin/produkte");await rows(page).first().locator("summary").first().click();
  await page.locator("summary").filter({hasText:"Größen & Varianten"}).click();await page.getByRole("button",{name:"+ Variante",exact:true}).click();
  await save(page).click();await expect(page.locator(".admin-app [role=alert]")).toContainText("Variante");
  await page.getByRole("textbox",{name:"Größe / Inhalt",exact:true}).last().fill("500 ml");
  await page.getByRole("spinbutton",{name:"Preis in EUR (leer = auf Anfrage)",exact:true}).fill("-1");await save(page).click();await expect(page.locator(".admin-app [role=alert]")).toBeVisible();expect(fixture.writes).toHaveLength(0);
  await page.getByRole("spinbutton",{name:"Preis in EUR (leer = auf Anfrage)",exact:true}).fill("25");await saved(page);
});
test("categories create, rename, publish, move and safely prevent deleting occupied categories",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!);await signIn(page,"/admin/produkte");
  await page.getByRole("button",{name:/Produktkategorien/}).click();await page.locator("summary").filter({hasText:"Haarpflege"}).click();
  await expect(page.getByRole("button",{name:"Kategorie entfernen",exact:true})).toBeDisabled();
  await page.getByRole("button",{name:"+ Kategorie",exact:true}).click();const name=page.getByRole("textbox",{name:"Kategoriename",exact:true});await expect(name).toHaveValue("");await name.fill("Körperpflege");
  await page.getByRole("checkbox",{name:"Kategorie veröffentlichen",exact:true}).check();await page.getByRole("spinbutton",{name:"Position der Kategorie",exact:true}).fill("1");await page.getByRole("button",{name:"Verschieben",exact:true}).click();await saved(page);
  expect(fixture.content().categories[0].name).toBe("Körperpflege");expect(fixture.content().categories[0].published).toBe(true);
  page.once("dialog",d=>void d.dismiss());await page.getByRole("button",{name:"Kategorie entfernen",exact:true}).click();await expect(name).toHaveValue("Körperpflege");
  page.once("dialog",d=>void d.accept());await page.getByRole("button",{name:"Kategorie entfernen",exact:true}).click();await saved(page);expect(fixture.content().categories).toHaveLength(2);
});
test("cover image is explicit, ordered and removal is confirmed without remote deletion",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!,{configure:data=>{data.products[0].images.push("/images/gallery-02.jpg");}});await signIn(page,"/admin/produkte");
  await rows(page).first().locator("summary").first().click();await page.locator("summary").filter({hasText:"Produktbilder"}).click();
  await expect(page.getByText("Titelbild",{exact:true})).toHaveCount(1);await page.getByRole("button",{name:"Als Titelbild",exact:true}).nth(1).click();await saved(page);
  expect(fixture.content().products[0].images).toEqual(["/images/gallery-02.jpg","/images/gallery-01.jpg"]);
  page.once("dialog",d=>void d.dismiss());await page.getByRole("button",{name:"Produktbild entfernen",exact:true}).first().click();await expect(page.getByRole("button",{name:"Als Titelbild",exact:true})).toHaveCount(2);
  page.once("dialog",d=>void d.accept());await page.getByRole("button",{name:"Produktbild entfernen",exact:true}).last().click();await saved(page);expect(fixture.content().products[0].images).toEqual(["/images/gallery-02.jpg"]);
});
test("featured products have an independent order, eligible choices and a strict display limit",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!,{configure:large});await signIn(page,"/admin/produkte");
  const featured=page.locator("#admin-featured-products");await featured.getByRole("button",{name:/Produkte auf der Startseite/}).click();
  const choices=featured.getByRole("combobox");expect(await choices.locator("option").allTextContents()).not.toContain("Pflege 1");
  for(const id of ["product-2","product-4"]){await choices.selectOption(id);await featured.getByRole("button",{name:"Hinzufügen",exact:true}).click();}
  await expect(choices).toBeDisabled();await expect(featured.getByText("3 ausgewählt · maximal 3",{exact:true})).toBeVisible();
  await featured.getByRole("button",{name:"Reihenfolge bearbeiten",exact:true}).click();await featured.getByRole("button",{name:"Nach unten",exact:true}).first().click();await saved(page);
  expect(fixture.content().products[0].id).toBe("product-0");expect(fixture.content().products.find(p=>p.id==="product-2")?.featuredOrder).toBe(0);
  await featured.getByRole("button",{name:"Pflege 0 von der Startseite entfernen",exact:true}).click();await saved(page);expect(fixture.content().products[0].featured).toBe(false);
  await page.goto("/produkte");await expect(page.getByRole("heading",{name:"Unsere Produkte – Bald verfügbar",exact:true})).toBeVisible();
});
test("gallery pages, homepage selection, cross-page ordering and confirmed deletion save safely",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!,{configure:large});await signIn(page,"/admin/galerie");await expect(page.locator(".admin-gallery-card")).toHaveCount(24);
  await expect(page.locator(".admin-gallery-card").nth(2).getByRole("checkbox",{name:"Für die Startseite auswählen",exact:true})).toBeEnabled();
  await page.getByRole("tab",{name:/^Startseite/}).click();await expect(page.locator(".admin-gallery-card")).toHaveCount(8);
  await page.locator(".admin-gallery-card").first().getByRole("checkbox",{name:"Für die Startseite auswählen",exact:true}).click();await expect(page.locator(".admin-gallery-card")).toHaveCount(7);
  await page.getByRole("tab",{name:/^Gesamte Galerie/}).click();const first=page.locator(".admin-gallery-card").first();await first.locator("summary").click();
  await first.getByRole("spinbutton",{name:"Position in der gesamten Galerie",exact:true}).fill("50");await first.getByRole("button",{name:"Verschieben",exact:true}).click();
  await expect(page.locator(".admin-gallery-card")).toHaveCount(12);await saved(page);expect(fixture.content().gallery[49].id).toBe("photo-0");expect(fixture.content().gallery[49].homepage).toBe(false);
  const moved=page.locator(".admin-gallery-card").nth(1);if(await moved.locator("details").getAttribute("open")===null)await moved.locator("summary").click();
  page.once("dialog",d=>void d.dismiss());await moved.getByRole("button",{name:"Entfernen",exact:true}).click();await expect(page.locator(".admin-gallery-card")).toHaveCount(12);
  page.once("dialog",d=>void d.accept());await moved.getByRole("button",{name:"Entfernen",exact:true}).click();await saved(page);expect(fixture.content().gallery).toHaveLength(59);
});
test("uploads report progress, block saves and retain ordered partial success",async({page,baseURL})=>{
  let calls=0;let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
  const fixture=await adminFixture(page,baseURL!,{upload:async route=>{calls++;if(calls===1){await pending;await route.fulfill({json:{url:"https://res.cloudinary.com/test/image/upload/v1/golesta-v2/first.webp"}});}else await route.fulfill({status:502,json:{error:"Bild konnte nicht gespeichert werden."}});}});
  const original=structuredClone(fixture.content().products[0].images);await signIn(page,"/admin/produkte");await rows(page).first().locator("summary").first().click();await page.locator("summary").filter({hasText:"Produktbilder"}).click();
  const buffer=readFileSync("public/images/gallery-01.jpg");await page.getByLabel("Bilder auswählen",{exact:true}).setInputFiles([{name:"one.jpg",mimeType:"image/jpeg",buffer},{name:"two.jpg",mimeType:"image/jpeg",buffer}]);
  await expect(page.getByText(/Wird hochgeladen: Bild 1 von 2/)).toBeVisible();await expect(save(page)).toBeDisabled();release();
  await expect(page.locator(".admin-app [role=alert]")).toContainText("Ein bereits übernommenes Bild bleibt erhalten");await saved(page);
  expect(fixture.content().products[0].images).toEqual([...original,"https://res.cloudinary.com/test/image/upload/v1/golesta-v2/first.webp"]);expect(calls).toBe(2);expect(fixture.errors).toEqual([]);
});
test("large originals are reduced to WebP in the browser before upload",async({page,baseURL})=>{
  let received:Buffer|undefined;
  await adminFixture(page,baseURL!,{upload:async route=>{received=route.request().postDataBuffer()!;await route.fulfill({json:{url:"https://res.cloudinary.com/test/image/upload/v1/golesta-v2/reduced.webp"}});}});
  await signIn(page,"/admin/galerie");
  const buffer=Buffer.concat([readFileSync("public/images/gallery-01.jpg"),Buffer.alloc(4*1024*1024)]);
  await page.getByLabel("+ Mehrere Fotos auswählen",{exact:true}).setInputFiles({name:"large.jpg",mimeType:"image/jpeg",buffer});
  await expect(page.getByRole("status").filter({hasText:"1 Bild übernommen"})).toBeVisible();
  expect(received!.length).toBeLessThan(4*1024*1024);const meta=await sharp(received!).metadata();expect(meta.format).toBe("webp");expect(Math.max(meta.width!,meta.height!)).toBeLessThanOrEqual(1800);
  await saved(page);
});
test("desktop drag and arbitrary cross-page moves retain the selected product",async({page,baseURL})=>{
  const fixture=await adminFixture(page,baseURL!,{configure:large});await signIn(page,"/admin/produkte");
  const source=rows(page).nth(0).locator("..").locator("..").getByRole("button",{name:"Zum Sortieren ziehen",exact:true});
  await source.dragTo(rows(page).nth(1));await expect(rows(page).nth(1)).toHaveAttribute("data-product-id","product-0");
  await rows(page).nth(1).locator("summary").first().click();await page.locator("summary").filter({hasText:"Reihenfolge im Sortiment"}).click();
  await page.getByRole("spinbutton",{name:"Position im Sortiment",exact:true}).fill("45");await page.getByRole("button",{name:"Verschieben",exact:true}).click();
  await expect(page.getByRole("textbox",{name:"Produktname",exact:true})).toHaveValue("Pflege 0");await saved(page);expect(fixture.content().products[44].id).toBe("product-0");
});
test("gallery multi-upload preserves selection order and drafts; invalid types never upload",async({page,baseURL})=>{
  let calls=0;const fixture=await adminFixture(page,baseURL!,{upload:async route=>{calls++;await route.fulfill({json:{url:`https://res.cloudinary.com/test/image/upload/v1/golesta-v2/photo-${calls}.webp`}});}});
  const count=fixture.content().gallery.length;await signIn(page,"/admin/galerie");const picker=page.getByLabel("+ Mehrere Fotos auswählen",{exact:true});
  await picker.setInputFiles({name:"bad.svg",mimeType:"image/svg+xml",buffer:Buffer.from("<svg/>")});await expect(page.locator(".admin-app [role=alert]")).toContainText("JPG");expect(calls).toBe(0);
  const buffer=readFileSync("public/images/gallery-01.jpg");await picker.setInputFiles([{name:"a.jpg",mimeType:"image/jpeg",buffer},{name:"b.jpg",mimeType:"image/jpeg",buffer}]);
  await expect(page.getByRole("status").filter({hasText:"2 Bilder übernommen"})).toBeVisible();await saved(page);
  const added=fixture.content().gallery.slice(count);expect(added.map(p=>p.image)).toEqual([1,2].map(i=>`https://res.cloudinary.com/test/image/upload/v1/golesta-v2/photo-${i}.webp`));expect(added.every(p=>!p.published&&!p.homepage)).toBe(true);
});
for(const width of [375,430,768,1280,1440])test(`new product and gallery controls fit ${width}px`,async({page,baseURL})=>{
  await page.setViewportSize({width,height:850});const fixture=await adminFixture(page,baseURL!,{configure:large});await signIn(page,"/admin/produkte");
  await page.getByRole("button",{name:/Produkte auf der Startseite/}).click();await page.getByRole("button",{name:/Produktkategorien/}).click();await rows(page).first().locator("summary").first().click();
  for(const text of ["Produktbilder","Größen & Varianten","Reihenfolge im Sortiment"])await page.locator("summary").filter({hasText:text}).click();await noOverflow(page);
  await page.goto("/admin/galerie");await expect(page.locator(".admin-gallery-card")).toHaveCount(24);await page.getByRole("button",{name:"Reihenfolge bearbeiten",exact:true}).click();await page.locator(".admin-gallery-card").first().locator("summary").click();await noOverflow(page);expect(fixture.errors).toEqual([]);
});
