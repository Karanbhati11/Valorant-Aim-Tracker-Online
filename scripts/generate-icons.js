/**
 * PWA Icon Generator
 * Generates all required icon sizes from the source favicon.
 * Run: node scripts/generate-icons.js
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SOURCE_ICON = path.join(__dirname, "..", "public", "assets", "favicon.png");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "icons");

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Source icon: ${SOURCE_ICON}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE_ICON)
      .resize(size, size, { fit: "contain", background: { r: 15, g: 15, b: 35, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with padding for safe zone)
  for (const size of [192, 512]) {
    const outputPath = path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`);
    const padding = Math.round(size * 0.1); // 10% padding for maskable safe zone
    const innerSize = size - padding * 2;

    await sharp(SOURCE_ICON)
      .resize(innerSize, innerSize, { fit: "contain", background: { r: 15, g: 15, b: 35, alpha: 1 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 15, g: 15, b: 35, alpha: 1 },
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-maskable-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  const appleTouchPath = path.join(OUTPUT_DIR, "apple-touch-icon.png");
  await sharp(SOURCE_ICON)
    .resize(180, 180, { fit: "contain", background: { r: 15, g: 15, b: 35, alpha: 1 } })
    .png()
    .toFile(appleTouchPath);
  console.log("Generated: apple-touch-icon.png");

  console.log("\nAll icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
