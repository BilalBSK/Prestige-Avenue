export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Vidéo de présentation auto-hébergée (R2). MP4 H.264 est le format recommandé
// — le plus universellement lu ; WebM et MOV (QuickTime) sont tolérés.
export const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

// Clips courts de présentation (hero / carrousel, ~10-30 s). Un clip 1080p
// H.264 bien encodé pèse ~15-40 Mo ; le plafond de 50 Mo garde le catalogue
// largement sous le palier gratuit R2 (10 Go) et des chargements rapides.
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

export function isAllowedImageMime(mime: string): boolean {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
}

export function isUnderMaxImageSize(size: number): boolean {
  return size > 0 && size <= MAX_IMAGE_SIZE_BYTES;
}

export function isAllowedVideoMime(mime: string): boolean {
  return (ALLOWED_VIDEO_MIMES as readonly string[]).includes(mime);
}

export function isUnderMaxVideoSize(size: number): boolean {
  return size > 0 && size <= MAX_VIDEO_SIZE_BYTES;
}

export function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    default:
      return "bin";
  }
}
