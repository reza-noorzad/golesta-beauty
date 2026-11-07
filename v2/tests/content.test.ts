import { test } from "node:test";
import assert from "node:assert/strict";
import {
  contentSchema,
  initialContent,
  publicContent,
} from "../src/lib/content";
test("initial data is valid and contains no products", () => {
  assert.equal(contentSchema.safeParse(initialContent).success, true);
  assert.equal(initialContent.products.length, 0);
});
test("unpublished team, gallery and voucher are removed", () => {
  const d = structuredClone(initialContent);
  d.team[0].published = false;
  d.gallery[0].published = false;
  d.voucher.published = false;
  const visible = publicContent(d);
  assert.equal(visible.team.length, 1);
  assert.equal(visible.gallery.length, 17);
  assert.equal(visible.voucher.description, "");
  assert.deepEqual(visible.voucher.values, []);
});
test("unsafe links and images are rejected", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:image/svg+xml,evil",
    "https://evil.example/picture.png",
  ]) {
    const d = structuredClone(initialContent);
    d.team[0].image = url;
    assert.equal(contentSchema.safeParse(d).success, false);
  }
  const d = structuredClone(initialContent);
  d.settings.instagram = "javascript:alert(1)";
  assert.equal(contentSchema.safeParse(d).success, false);
});
test("unknown keys and duplicate IDs rejected", () => {
  assert.equal(
    contentSchema.safeParse({ ...initialContent, admin: true }).success,
    false,
  );
  const d = structuredClone(initialContent);
  d.team.push(d.team[0]);
  assert.equal(contentSchema.safeParse(d).success, false);
});
test("products require category, unique slug and valid variant prices", () => {
  const d = structuredClone(initialContent);
  d.categories.push({
    id: "test-category",
    name: "Test only",
    published: true,
    sortOrder: 0,
  });
  d.products.push({
    id: "test-only",
    slug: "test-only",
    name: "TEST FIXTURE ONLY",
    description: "",
    price: null,
    currency: "EUR",
    categoryId: "test-category",
    images: [],
    published: true,
    featured: false,
    sortOrder: 0,
    variants: [{ id: "v", name: "Test", price: 20, available: true }],
  });
  assert.equal(contentSchema.safeParse(d).success, true);
  d.categories[0].published = false;
  assert.equal(publicContent(d).products.length, 0);
  d.categories[0].published = true;
  d.products[0].published = false;
  assert.equal(publicContent(d).products.length, 0);
  d.products[0].variants[0].price = -1;
  assert.equal(contentSchema.safeParse(d).success, false);
  d.products[0].variants[0].price = 20;
  d.products.push({ ...d.products[0], id: "other" });
  assert.equal(contentSchema.safeParse(d).success, false);
  d.products.pop();
  d.categories = [];
  assert.equal(contentSchema.safeParse(d).success, false);
});
