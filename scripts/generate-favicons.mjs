// Génère l'ensemble des favicons du site à partir d'un seul master haute
// définition — le monogramme « PA » champagne sur le noir signature #000
// (charte du site). Toutes les tailles sont dérivées par sous-échantillonnage
// Lanczos depuis le master 512 px, pour un rendu net sur tout support : onglet
// clair/sombre, écran d'accueil iOS, tuile Android/PWA, raccourci Windows.
//
// Source de vérité : assets/brand/monogram-512.png  (512×512, hors /public)
// Sorties (conventions de fichiers Next.js 15) :
//   src/app/favicon.ico     16 + 32 + 48   (onglet navigateur, legacy)
//   src/app/icon.png        512            (rel="icon" moderne, redescendu net)
//   src/app/apple-icon.png  180            (écran d'accueil iOS)
//   public/icon-192.png     192            (manifeste PWA — voir src/app/manifest.ts)
//   public/icon-512.png     512            (manifeste PWA)
//
// Lance : node scripts/generate-favicons.mjs
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const SRC = "assets/brand/monogram-512.png";
const BG = { r: 0, g: 0, b: 0, alpha: 1 }; // #000 — fond noir signature

// Rend le master à `size` px. Le master porte déjà sa marge d'air et le bon
// cadrage : on se contente de redimensionner (Lanczos3) puis d'aplatir sur le
// noir — aucune marge ré-appliquée, donc aucune perte de définition du glyphe.
async function render(size) {
  return sharp(SRC)
    .resize(size, size, { fit: "cover", kernel: "lanczos3" })
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// --- PNG modernes (convention Next.js) ---
writeFileSync("src/app/icon.png", await render(512));
writeFileSync("src/app/apple-icon.png", await render(180));

// --- Icônes du manifeste PWA (servies depuis /public) ---
mkdirSync("public", { recursive: true });
writeFileSync("public/icon-192.png", await render(192));
writeFileSync("public/icon-512.png", await render(512));

// --- favicon.ico multi-résolution (16 + 32 + 48) ---
// L'ICO embarque plusieurs PNG ; on construit l'en-tête ICONDIR + ICONDIRENTRY
// à la main (sharp n'exporte pas de .ico).
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type 1 = icône
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  const datas = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // largeur (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // hauteur
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // réservé
    e.writeUInt16LE(1, 4); // plans de couleur
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(data.length, 8); // taille des données
    e.writeUInt32LE(offset, 12); // décalage des données
    offset += data.length;
    entries.push(e);
    datas.push(data);
  }
  return Buffer.concat([header, ...entries, ...datas]);
}

const ico = buildIco([
  { size: 16, data: await render(16) },
  { size: 32, data: await render(32) },
  { size: 48, data: await render(48) },
]);
writeFileSync("src/app/favicon.ico", ico);

console.log("✅ Favicons régénérés depuis assets/brand/monogram-512.png :");
console.log("   src/app/favicon.ico     16 + 32 + 48");
console.log("   src/app/icon.png        512");
console.log("   src/app/apple-icon.png  180");
console.log("   public/icon-192.png     192");
console.log("   public/icon-512.png     512");
