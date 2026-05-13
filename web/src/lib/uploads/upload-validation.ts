import { fileTypeFromBuffer } from "file-type";

export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "mp4",
  "webm",
  "mov",
]);

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedMime?: string;
}

function getExtension(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext || null;
}

export async function validateUpload(
  file: File,
): Promise<ValidationResult> {
  if (!file || file.size === 0) {
    return { valid: false, error: "Arquivo vazio ou inválido." };
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo permitido: ${MAX_UPLOAD_SIZE / 1024 / 1024}MB.`,
    };
  }

  const ext = getExtension(file.name);
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Extensão de arquivo não permitida: ${ext || "sem extensão"}. Permitidas: ${[...ALLOWED_EXTENSIONS].join(", ")}.`,
    };
  }

  const declaredMime = file.type.toLowerCase();
  if (declaredMime && !ALLOWED_MIME_TYPES.has(declaredMime)) {
    return {
      valid: false,
      error: `Tipo MIME declarado não permitido: ${declaredMime}.`,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = await fileTypeFromBuffer(buffer);

  if (!type) {
    return { valid: false, error: "Não foi possível detectar o tipo do arquivo." };
  }

  if (!ALLOWED_MIME_TYPES.has(type.mime)) {
    return {
      valid: false,
      error: `Tipo de arquivo real não permitido: ${type.mime}. Apenas imagens e vídeos são aceitos.`,
    };
  }

  return { valid: true, detectedMime: type.mime };
}

export function generateSafeFilename(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "bin";
  const uuid = crypto.randomUUID();
  return `${uuid}.${ext}`;
}
