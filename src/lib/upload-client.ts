import { ensureCsrfToken } from "./csrf-client";

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

type UploadScope = "cars" | "collaborations" | "home";
type UploadKind = "image" | "video";

interface UploadParams {
  file: File;
  folder: string;
  csrfToken: string;
  scope?: UploadScope;
  kind?: UploadKind;
}

interface VideoUploadParams extends UploadParams {
  /** Progression du transfert, de 0 à 1. */
  onProgress?: (fraction: number) => void;
}

async function requestPresignedUrl({
  file,
  folder,
  csrfToken,
  scope,
  kind,
}: UploadParams): Promise<PresignResponse> {
  // Jeton CSRF lu en DIRECT depuis le cookie vivant au moment de l'envoi : c'est
  // la seule source de vérité partagée avec le serveur. Le jeton passé en
  // paramètre (mémorisé à l'ouverture de la page) peut être périmé si le cookie
  // a été régénéré entre-temps — on le garde en repli seulement. Élimine la
  // cause de « CSRF invalide » au réveil / après longue inactivité.
  const liveToken = await ensureCsrfToken();
  const token = liveToken || csrfToken;

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": token,
    },
    body: JSON.stringify({
      filename: file.name,
      mime: file.type,
      size: file.size,
      folder,
      ...(scope ? { scope } : {}),
      ...(kind ? { kind } : {}),
    }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Préparation de l'upload refusée.");
  }

  return (await response.json()) as PresignResponse;
}

async function putToSignedUrl(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Transfert refusé (${response.status}).`);
  }
}

/**
 * PUT avec progression réelle. `fetch` n'expose pas l'avancement d'un upload —
 * indispensable pour une vidéo de plusieurs dizaines de Mo, sinon l'admin croit
 * l'interface figée. On retombe donc sur XMLHttpRequest, seul à émettre
 * `upload.onprogress`.
 */
function putToSignedUrlWithProgress(
  uploadUrl: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new Error(`Transfert refusé (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Transfert interrompu."));
    xhr.onabort = () => reject(new Error("Transfert annulé."));
    xhr.send(file);
  });
}

export async function uploadImageToR2(params: UploadParams): Promise<string> {
  const presigned = await requestPresignedUrl(params);
  await putToSignedUrl(presigned.uploadUrl, params.file);
  return presigned.publicUrl;
}

export async function uploadVideoToR2({
  onProgress,
  ...params
}: VideoUploadParams): Promise<string> {
  const presigned = await requestPresignedUrl({ ...params, kind: "video" });
  await putToSignedUrlWithProgress(presigned.uploadUrl, params.file, onProgress);
  return presigned.publicUrl;
}
