"use server";

import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import {
  getExtensionFromMime,
  isAllowedImageMime,
  isUnderMaxImageSize,
} from "@/lib/blob";
import { uploadTokenInputSchema, type UploadTokenInput } from "./cars.schema";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function getUploadPathname(input: UploadTokenInput): Promise<string> {
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
  return `cars/${parsed.folder}/${uuid}.${ext}`;
}

export async function generateClientUpload(
  body: HandleUploadBody,
  request: Request,
): Promise<unknown> {
  return handleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => {
      await requireAdminSessionOrRedirect();
      return {
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
        maximumSizeInBytes: 5 * 1024 * 1024,
      };
    },
    onUploadCompleted: async () => {
      // URLs are persisted via form submission
    },
  });
}
