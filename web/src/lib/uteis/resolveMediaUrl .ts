import { getTelegramImageUrl } from "@/lib/telegram";
import { MediaType } from "../../../generated/prisma/client";
import { Characterdb, Genero } from "../types";


export async function resolveMediaUrl(
  character: Characterdb,
  type: Genero,
) {
  let displayUrl: string | null = null;

  // 🔹 prioridade: linkweb válido
  if (
    character.linkweb &&
    character.linkwebExpiresAt &&
    new Date(character.linkwebExpiresAt) > new Date()
  ) {
    displayUrl = character.linkweb;
  }
  // 🔹 URL direta
  else if (
    character.mediaType === MediaType.IMAGE_URL ||
    character.mediaType === MediaType.VIDEO_URL
  ) {
    displayUrl = character.media || null;
  }
  // 🔹 Telegram
  else {
    displayUrl = await getTelegramImageUrl(
      character.media || "",
      type,
    );
  }

  const isVideo =
    character.mediaType === MediaType.VIDEO_URL ||
    character.mediaType === MediaType.VIDEO_FILEID;

  return {
    displayUrl,
    isVideo,
  };
}