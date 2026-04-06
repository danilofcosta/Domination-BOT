"use server";

import { getTelegramImageUrl } from "@/lib/telegram";
import { MediaType } from "../../../generated/prisma/client";
import { Characterdb, Genero } from "../types";

export async function resolveMediaUrl(character: Characterdb, type: Genero) {
  let displayUrl: string | null = null;

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
  else if (
    character.mediaType === MediaType.IMAGE_FILEID ||
    character.mediaType === MediaType.VIDEO_FILEID
  ) {
    displayUrl = await getTelegramImageUrl(character.media || "", type);
  } else {
    displayUrl = "/placeholder.png";
  }
  const isVideo =
    character.mediaType === MediaType.VIDEO_URL ||
    character.mediaType === MediaType.VIDEO_FILEID ||
    character.mediaType === MediaType.VIDEO_LOCAL;

  return {
    displayUrl,
    isVideo,
  };
}
