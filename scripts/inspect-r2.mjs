// Inspection LECTURE SEULE du bucket R2 : config CORS + nombre d'objets.
// Aucune écriture. Sert à donner un état des lieux exact avant la prod.
import { readFileSync } from "node:fs";
import {
  S3Client,
  GetBucketCorsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

function loadEnv() {
  const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});
const Bucket = env.R2_BUCKET;

console.log(`Bucket: ${Bucket}`);
console.log(`Public URL: ${env.R2_PUBLIC_BASE_URL}\n`);

// 1) Config CORS
try {
  const cors = await client.send(new GetBucketCorsCommand({ Bucket }));
  console.log("CORS configuré :");
  console.log(JSON.stringify(cors.CORSRules, null, 2));
} catch (e) {
  if (e?.name === "NoSuchCORSConfiguration") {
    console.log("CORS : AUCUNE règle configurée sur ce bucket.");
  } else {
    console.log(`CORS : erreur de lecture -> ${e?.name}: ${e?.message}`);
  }
}

// 2) Combien d'objets / quels préfixes
try {
  const list = await client.send(
    new ListObjectsV2Command({ Bucket, MaxKeys: 1000 }),
  );
  const keys = (list.Contents ?? []).map((o) => o.Key);
  console.log(`\nObjets dans le bucket : ${list.KeyCount ?? keys.length}`);
  const prefixes = {};
  let bytes = 0;
  for (const o of list.Contents ?? []) {
    const top = (o.Key.split("/")[0] || "(racine)");
    prefixes[top] = (prefixes[top] || 0) + 1;
    bytes += o.Size ?? 0;
  }
  if (keys.length) {
    console.log("Répartition par dossier de tête :");
    for (const [p, n] of Object.entries(prefixes)) console.log(`  ${p}/ : ${n}`);
    console.log(`Taille totale : ${(bytes / (1024 * 1024)).toFixed(1)} Mo`);
    console.log("Exemples de clés :");
    for (const k of keys.slice(0, 5)) console.log(`  ${k}`);
  }
} catch (e) {
  console.log(`Liste objets : erreur -> ${e?.name}: ${e?.message}`);
}
