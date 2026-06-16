"use server";

import { uploadMediaToTelegram } from "@/lib/telegram/uploadMedia";

export async function uploadMediaFile(
  base64: string,
  filename: string,
  type: "waifu" | "husbando",
) {
  try {
    const buffer = Buffer.from(base64, "base64");

    if (buffer.length > 30 * 1024 * 1024) {
      return {
        success: false,
        message: `Arquivo muito grande: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (máx 30MB)`,
      };
    }

    const { fileId, mimeType } = await uploadMediaToTelegram(buffer, filename, type);

    return {
      success: true,
      fileId,
      mimeType,
      message: "Upload realizado com sucesso",
    };
  } catch (error) {
    return {
      success: false,
      message: `Erro no upload: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}
