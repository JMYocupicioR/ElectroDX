const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  const svgPath = path.join(__dirname, 'logo-mark.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const outDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Also write favicon.svg to public/
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), svgBuffer);
  fs.writeFileSync(path.join(outDir, 'icon.svg'), svgBuffer);

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'icon-72x72.png', size: 72 },
    { name: 'icon-96x96.png', size: 96 },
    { name: 'icon-120x120.png', size: 120 },
    { name: 'icon-128x128.png', size: 128 },
    { name: 'icon-144x144.png', size: 144 },
    { name: 'icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-384x384.png', size: 384 },
    { name: 'icon-512x512.png', size: 512 },
  ];

  console.log('Generando iconos de marca ElectoDX...');
  for (const item of sizes) {
    const targetFile = path.join(outDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png({ quality: 95 })
      .toFile(targetFile);
    console.log(`Generado: ${item.name} (${item.size}x${item.size})`);
  }

  console.log('¡Todos los iconos de marca generados exitosamente!');
}

generateIcons().catch(err => {
  console.error('Error generando iconos:', err);
  process.exit(1);
});
