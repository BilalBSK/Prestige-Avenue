/**
 * Vidéo de présentation d'un véhicule.
 *
 * Les vidéos sont désormais hébergées sur notre propre stockage (R2) et non
 * plus référencées par une URL YouTube / Vimeo : le champ `Car.videoUrl`
 * contient l'URL publique d'un fichier vidéo importé depuis l'admin.
 *
 * `isHostedVideo` filtre les valeurs lisibles par un lecteur `<video>` natif :
 * une éventuelle ancienne URL YouTube/Vimeo (qui n'est pas un fichier) renvoie
 * `false`, de sorte que la fiche ne tente jamais d'afficher un lecteur cassé.
 */

const VIDEO_FILE_EXTENSIONS = [".mp4", ".webm", ".mov"] as const;

export function isHostedVideo(rawUrl: string | null | undefined): rawUrl is string {
  if (!rawUrl) return false;
  let pathname: string;
  try {
    pathname = new URL(rawUrl).pathname.toLowerCase();
  } catch {
    return false;
  }
  return VIDEO_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

/** Type MIME du lecteur `<source>`, déduit de l'extension du fichier. */
export function videoMimeFromUrl(rawUrl: string): string {
  const path = (() => {
    try {
      return new URL(rawUrl).pathname.toLowerCase();
    } catch {
      return rawUrl.toLowerCase();
    }
  })();
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}
