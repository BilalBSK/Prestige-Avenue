import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import {
  getExtensionFromMime,
  isAllowedImageMime,
  isAllowedVideoMime,
  isUnderMaxImageSize,
  isUnderMaxVideoSize,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/blob";
import { buildPublicUrl, getR2Client, getR2Config } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uploadTokenInputSchema, type UploadTokenInput } from "./cars.schema";

// Les images partent en un PUT quasi instantané ; une vidéo (quelques dizaines
// de Mo) peut prendre un moment sur une connexion modeste, d'où une URL signée
// nettement plus longue pour ce cas.
const IMAGE_SIGNED_URL_TTL_SECONDS = 60;
const VIDEO_SIGNED_URL_TTL_SECONDS = 60 * 60;

const MAX_VIDEO_SIZE_MB = Math.round(MAX_VIDEO_SIZE_BYTES / (1024 * 1024));

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

export async function createPresignedUpload(input: UploadTokenInput): Promise<PresignedUpload> {
  await requireAdminSessionOrRedirect();
  const parsed = uploadTokenInputSchema.parse(input);

  const isVideo = parsed.kind === "video";
  if (isVideo) {
    if (!isAllowedVideoMime(parsed.mime)) {
      throw new Error("Format vidéo non autorisé (MP4, WebM, MOV).");
    }
    if (!isUnderMaxVideoSize(parsed.size)) {
      throw new Error(`Vidéo trop volumineuse (max ${MAX_VIDEO_SIZE_MB} Mo).`);
    }
  } else {
    if (!isAllowedImageMime(parsed.mime)) {
      throw new Error("Type de fichier non autorisé.");
    }
    if (!isUnderMaxImageSize(parsed.size)) {
      throw new Error("Fichier trop volumineux (max 5 Mo).");
    }
  }

  const ext = getExtensionFromMime(parsed.mime);
  const uuid = crypto.randomUUID();
  const safeFolder = parsed.folder.replace(/[^a-z0-9-_]/gi, "");
  const key = `${parsed.scope}/${safeFolder}/${uuid}.${ext}`;

  const cfg = getR2Config();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: parsed.mime,
    ContentLength: parsed.size,
  });

  const expiresIn = isVideo
    ? VIDEO_SIGNED_URL_TTL_SECONDS
    : IMAGE_SIGNED_URL_TTL_SECONDS;

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn,
    signableHeaders: new Set(["content-type", "content-length"]),
  });

  return {
    uploadUrl,
    publicUrl: buildPublicUrl(key),
    key,
    expiresIn,
  };
}
