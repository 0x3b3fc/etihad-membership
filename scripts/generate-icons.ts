import sharp from "sharp";
import path from "path";
import fs from "fs";

const INPUT = path.join(process.cwd(), "public", "logo.png");
const OUTPUT_DIR = path.join(process.cwd(), "public", "icons");

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 192x192
  await sharp(INPUT)
    .resize(192, 192, { fit: "contain", background: "#ffffff" })
    .png()
    .toFile(path.join(OUTPUT_DIR, "icon-192.png"));
  console.log("✓ icon-192.png");

  // 512x512
  await sharp(INPUT)
    .resize(512, 512, { fit: "contain", background: "#ffffff" })
    .png()
    .toFile(path.join(OUTPUT_DIR, "icon-512.png"));
  console.log("✓ icon-512.png");

  // 512x512 maskable (with 20% safe-zone padding)
  const inner = await sharp(INPUT)
    .resize(400, 400, { fit: "contain", background: "#ffffff" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toFile(path.join(OUTPUT_DIR, "icon-maskable-512.png"));
  console.log("✓ icon-maskable-512.png");

  console.log("Done!");
}

main().catch(console.error);
