import { S3Client } from "@aws-sdk/client-s3";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export function getR2Config(): R2Config {
  return {
    accountId: getEnv("R2_ACCOUNT_ID"),
    accessKeyId: getEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: getEnv("R2_SECRET_ACCESS_KEY"),
    bucket: getEnv("R2_BUCKET"),
    publicBaseUrl: getEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, ""),
  };
}

let cached: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cached) return cached;
  const cfg = getR2Config();
  cached = new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return cached;
}

export function buildPublicUrl(key: string): string {
  const { publicBaseUrl } = getR2Config();
  return `${publicBaseUrl}/${key}`;
}
