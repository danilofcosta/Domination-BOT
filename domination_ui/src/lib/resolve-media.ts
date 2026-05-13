import { MediaType } from "./types";
import type { Character } from "@/lib/types"
export function resolveCharacterMedia(
  character: Character
) {
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
  // 🔹 Arquivo local (salvo em /uploads/)
  else if (
    character.mediaType === MediaType.IMAGE_LOCAL ||
    character.mediaType === MediaType.VIDEO_LOCAL
  ) {
    displayUrl = character.media || null;
  }
  // 🔹 Telegram
  else if (
    character.mediaType === MediaType.IMAGE_FILEID ||
    character.mediaType === MediaType.VIDEO_FILEID
  ) {
   // displayUrl = await getTelegramImageUrl(character.media || "", type);
     displayUrl = "/placeholder.png";
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
