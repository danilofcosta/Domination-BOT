"use server";

import { uploadMediaToTelegram } from "@/lib/telegram/uploadMedia";
import { sessionHasPermission } from "@/lib/session";

export async function uploadMediaFile(
  base64: string,
  filename: string,
  type: "waifu" | "husbando",
) {
  try {
    if (!(await sessionHasPermission("manage_characters"))) {
      return {
        success: false,
        message: "Sem permissão para enviar mídias.",
      };
    }

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
    console.error("uploadMediaFile error:", error);
    return {
      success: false,
      message: "Erro interno no upload.",
    };
  }
}
