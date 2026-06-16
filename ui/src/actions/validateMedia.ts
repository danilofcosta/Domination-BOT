"use server";

const MAX_SIZE = 30 * 1024 * 1024;

export async function validateMediaUrl(url: string) {
  try {
    new URL(url);
  } catch {
    return { valid: false, message: "URL inválida" };
  }

  try {
    const res = await fetch(url, { method: "HEAD" });

    const contentType = res.headers.get("content-type") || "";
    const contentLength = res.headers.get("content-length");

    if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
      return {
        valid: false,
        message: `Tipo de mídia não suportado: ${contentType}`,
      };
    }

    if (contentLength) {
      const size = Number(contentLength);
      if (size > MAX_SIZE) {
        return {
          valid: false,
          message: `Arquivo muito grande: ${(size / 1024 / 1024).toFixed(1)}MB (máx 30MB)`,
        };
      }
    }

    return {
      valid: true,
      mimeType: contentType,
      size: contentLength ? Number(contentLength) : undefined,
      message: `${contentType.startsWith("image/") ? "Imagem" : "Vídeo"} válido${contentLength ? ` — ${(Number(contentLength) / 1024 / 1024).toFixed(1)}MB` : ""}`,
    };
  } catch {
    return { valid: false, message: "Não foi possível acessar a URL" };
  }
}
