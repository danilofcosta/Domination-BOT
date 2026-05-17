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

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

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

  let ext = getExtension(file.name);
  if (!ext || ext === "blob" || ext === "bin") {
    const declaredMime = file.type.toLowerCase();
    ext = MIME_TO_EXTENSION[declaredMime] || ext;
  }

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

export function generateSafeFilename(originalName: string, mimeType?: string): string {
  let ext = originalName.split(".").pop()?.toLowerCase() || "bin";
  if (originalName === "blob" || ext === "blob" || ext === "bin") {
    if (mimeType) {
      ext = MIME_TO_EXTENSION[mimeType.toLowerCase()] || ext;
    }
  }
  const uuid = crypto.randomUUID();
  return `${uuid}.${ext}`;
}
