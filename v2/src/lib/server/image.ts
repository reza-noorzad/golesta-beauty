import sharp from "sharp";
/** Decode raster bytes before storing; strips metadata and rejects SVG/animated inputs. */
export async function optimizeImage(bytes: Buffer): Promise<Buffer> {
  if (bytes.length === 0 || bytes.length > 4 * 1024 * 1024)
    throw Error("Invalid size");
  const pipeline = sharp(bytes, {
    limitInputPixels: 25000000,
    animated: false,
  });
  const meta = await pipeline.metadata();
  if (
    !["jpeg", "png", "webp"].includes(meta.format || "") ||
    (meta.pages || 1) > 1
  )
    throw Error("Invalid format");
  return pipeline
    .rotate()
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
}
