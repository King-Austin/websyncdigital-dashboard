/**
 * generate-icons.mjs
 * Generates PWA icon PNGs from public/icons/icon.svg using sharp.
 * Also creates a screenshot-mobile.png placeholder.
 *
 * Usage:  node scripts/generate-icons.mjs
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const sharp = require(path.join(root, 'node_modules', 'sharp'));

const SVG_SRC = path.join(root, 'public', 'icons', 'icon.svg');
const OUT_DIR = path.join(root, 'public', 'icons');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true });

async function generateIcons() {
  const svgBuffer = fs.readFileSync(SVG_SRC);

  for (const size of ICON_SIZES) {
    const outPath = path.join(OUT_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`  created ${path.relative(root, outPath)} (${size}x${size})`);
  }

  // Screenshot placeholder: 390x844 solid #F4F7FB
  const screenshotPath = path.join(OUT_DIR, 'screenshot-mobile.png');
  await sharp({
    create: {
      width: 390,
      height: 844,
      channels: 3,
      background: { r: 244, g: 247, b: 251 },
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(screenshotPath);
  console.log(`  created ${path.relative(root, screenshotPath)} (390x844)`);

  console.log('\nAll icons generated successfully.');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
