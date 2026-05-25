import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import {
  getExtensionFromMime,
  isAllowedImageMime,
  isUnderMaxImageSize,
} from "@/lib/blob";
import { buildPublicUrl, getR2Client, getR2Config } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uploadTokenInputSchema, type UploadTokenInput } from "./cars.schema";

const SIGNED_URL_TTL_SECONDS = 60;

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

export async function createPresignedUpload(input: UploadTokenInput): Promise<PresignedUpload> {
  await requireAdminSessionOrRedirect();
  const parsed = uploadTokenInputSchema.parse(input);

  if (!isAllowedImageMime(parsed.mime)) {
    throw new Error("Type de fichier non autorisé.");
  }
  if (!isUnderMaxImageSize(parsed.size)) {
    throw new Error("Fichier trop volumineux (max 5 Mo).");
  }

  const ext = getExtensionFromMime(parsed.mime);
  const uuid = crypto.randomUUID();
  const safeFolder = parsed.folder.replace(/[^a-z0-9-_]/gi, "");
  const key = `cars/${safeFolder}/${uuid}.${ext}`;

  const cfg = getR2Config();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: parsed.mime,
    ContentLength: parsed.size,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: SIGNED_URL_TTL_SECONDS,
    signableHeaders: new Set(["content-type", "content-length"]),
  });

  return {
    uploadUrl,
    publicUrl: buildPublicUrl(key),
    key,
    expiresIn: SIGNED_URL_TTL_SECONDS,
  };
}
