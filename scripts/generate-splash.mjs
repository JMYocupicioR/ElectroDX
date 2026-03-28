/**
 * generate-splash.mjs
 * Generates all iOS splash screen images and additional icon sizes
 * using the existing icon-512x512.png as source.
 * 
 * Uses `sharp` (already in devDependencies).
 * 
 * Usage: node scripts/generate-splash.mjs
 */

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const ICONS_DIR = join(ROOT, 'public', 'icons');
const SPLASH_DIR = join(ICONS_DIR, 'splash');
const SOURCE_ICON = join(ICONS_DIR, 'icon-512x512.png');

// Background color matching manifest.json
const BG_COLOR = { r: 15, g: 23, b: 42, alpha: 1 }; // #0f172a

// ── Splash screen sizes (width × height in pixels) ──
const SPLASH_SIZES = [
  [640, 1136],    // iPhone SE
  [750, 1334],    // iPhone 8
  [1242, 2208],   // iPhone 8+
  [1125, 2436],   // iPhone X/XS
  [828, 1792],    // iPhone XR
  [1242, 2688],   // iPhone XS Max
  [1080, 2340],   // iPhone 12 mini
  [1170, 2532],   // iPhone 12/13/14
  [1284, 2778],   // iPhone 12 Pro Max
  [1179, 2556],   // iPhone 14 Pro
  [1290, 2796],   // iPhone 14 Pro Max
  [1320, 2868],   // iPhone 16 Pro Max
  [1620, 2160],   // iPad 10.2"
  [1640, 2360],   // iPad Air/Pro 11"
  [2048, 2732],   // iPad Pro 12.9"
];

// ── Additional icon sizes needed ──
const ICON_SIZES = [72, 96, 120, 128, 144, 152, 180, 384];

async function generateSplashScreens() {
  // Ensure splash directory exists
  if (!existsSync(SPLASH_DIR)) {
    mkdirSync(SPLASH_DIR, { recursive: true });
  }

  console.log('🎨 Generating iOS splash screens...\n');

  for (const [width, height] of SPLASH_SIZES) {
    const filename = `splash-${width}x${height}.png`;
    const outputPath = join(SPLASH_DIR, filename);

    // Logo size: 25% of the smallest dimension
    const logoSize = Math.round(Math.min(width, height) * 0.25);

    // Create centered logo on dark background
    const resizedLogo = await sharp(SOURCE_ICON)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([
        {
          input: resizedLogo,
          gravity: 'centre',
        },
      ])
      .png()
      .toFile(outputPath);

    console.log(`  ✓ ${filename} (${width}×${height})`);
  }
}

async function generateIcons() {
  console.log('\n🔷 Generating additional icon sizes...\n');

  for (const size of ICON_SIZES) {
    let filename;
    if (size === 180) {
      filename = `apple-touch-icon-180x180.png`;
    } else {
      filename = `icon-${size}x${size}.png`;
    }

    const outputPath = join(ICONS_DIR, filename);

    await sharp(SOURCE_ICON)
      .resize(size, size, { fit: 'contain' })
      .png()
      .toFile(outputPath);

    console.log(`  ✓ ${filename} (${size}×${size})`);
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  iOS PWA Asset Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    await generateSplashScreens();
    await generateIcons();
    console.log('\n✅ All assets generated successfully!');
    console.log(`   Splash screens: ${SPLASH_DIR}`);
    console.log(`   Icons: ${ICONS_DIR}`);
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main();
