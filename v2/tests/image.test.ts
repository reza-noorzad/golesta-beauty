import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { optimizeImage } from "../src/lib/server/image";

test("EXIF orientation is applied before metadata is removed", async () => {
  const input=await sharp({create:{width:120,height:60,channels:3,background:"#ccc"}}).jpeg().withMetadata({orientation:6}).toBuffer();
  const meta=await sharp(await optimizeImage(input)).metadata();
  assert.equal(meta.width,60);assert.equal(meta.height,120);assert.equal(meta.exif,undefined);
});
test("raster upload resized to WebP without metadata", async () => {
  const png = await sharp({
    create: { width: 2200, height: 1100, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  const out = await optimizeImage(png);
  const meta = await sharp(out).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 1800);
  assert.equal(meta.height, 900);
  assert.equal(meta.exif, undefined);
});
test("SVG, spoofed bytes, empty and oversize uploads rejected", async () => {
  for (const bytes of [
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
    ),
    Buffer.from("not really a png"),
    Buffer.alloc(0),
    Buffer.alloc(4 * 1024 * 1024 + 1),
  ])
    await assert.rejects(() => optimizeImage(bytes));
});
