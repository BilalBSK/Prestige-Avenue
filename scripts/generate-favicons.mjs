// Génère les favicons du site à partir du monogramme transparent source.
// Compose le « PA » champagne sur le noir signature #000 (charte du site) avec
// une marge d'air, pour une lisibilité parfaite sur tout fond (onglet clair/
// sombre, écran d'accueil iOS, raccourci Windows).
//
// Source  : public/favicons/favicon_256x256.png (monogramme RGBA transparent)
// Sorties : src/app/icon.png (256), src/app/apple-icon.png (180),
//           src/app/favicon.ico (16+32)  — convention de fichiers Next.js 15.
//
// Lance : node scripts/generate-favicons.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "public/favicons/favicon_256x256.png";
const BG = { r: 0, g: 0, b: 0, alpha: 1 }; // #000 — fond noir signature
const MARGIN = 0.12; // 12 % d'air autour du monogramme

// Compose le monogramme centré sur un carré noir de `size` px, logo redimensionné
// pour occuper (1 - 2*MARGIN) de la largeur. Retourne un Buffer PNG.
async function compose(size) {
  const inner = Math.round(size * (1 - 2 * MARGIN));
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

// --- PNG modernes (convention Next.js) ---
writeFileSync("src/app/icon.png", await compose(256));
writeFileSync("src/app/apple-icon.png", await compose(180));

// --- favicon.ico multi-résolution (16 + 32) ---
// L'ICO embarque plusieurs PNG ; on construit l'en-tête ICONDIR + ICONDIRENTRY
// à la main (sharp ne sort pas de .ico).
async function pngFor(size) {
  return sharp(await compose(size)).resize(size, size).png().toBuffer();
}
function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4);
  const entries = [];
  const datas = [];
  let offset = 6 + count * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
    datas.push(data);
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

const ico = buildIco([
  { size: 16, data: await pngFor(16) },
  { size: 32, data: await pngFor(32) },
]);
writeFileSync("src/app/favicon.ico", ico);

console.log("✅ Favicons générés sur fond noir :");
console.log("   src/app/icon.png        256x256");
console.log("   src/app/apple-icon.png  180x180");
console.log("   src/app/favicon.ico     16 + 32");
