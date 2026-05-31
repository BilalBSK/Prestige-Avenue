interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

type UploadScope = "cars" | "collaborations";

interface UploadParams {
  file: File;
  folder: string;
  csrfToken: string;
  scope?: UploadScope;
}

async function requestPresignedUrl({
  file,
  folder,
  csrfToken,
  scope,
}: UploadParams): Promise<PresignResponse> {
  const response = await fetch("/api/admin/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({
      filename: file.name,
      mime: file.type,
      size: file.size,
      folder,
      ...(scope ? { scope } : {}),
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

export async function uploadImageToR2(params: UploadParams): Promise<string> {
  const presigned = await requestPresignedUrl(params);
  await putToSignedUrl(presigned.uploadUrl, params.file);
  return presigned.publicUrl;
}
