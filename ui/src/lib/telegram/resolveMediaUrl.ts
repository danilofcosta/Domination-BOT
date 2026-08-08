export async function resolveMediaUrl(
  character: {
    mediaType: string;
    media: string;
    linkweb?: string | null;
    linkwebExpiresAt?: Date | string | null;
  },
  type: "waifu" | "husbando" = "waifu",
) {
  try {
    let displayUrl: string | null = null;

    if (
      character.mediaType === "IMAGE_URL" ||
      character.mediaType === "VIDEO_URL"
    ) {
      displayUrl = character.media || null;
    } else if (
      character.mediaType === "IMAGE_LOCAL" ||
      character.mediaType === "VIDEO_LOCAL"
    ) {
      displayUrl = character.media || null;
    } else if (
      character.mediaType === "IMAGE_FILEID" ||
      character.mediaType === "VIDEO_FILEID"
    ) {
      displayUrl = `/api/media/${type}/${encodeURIComponent(character.media || "")}`;
    } else {
      displayUrl = "/placeholder.png";
    }

    const isVideo =
      character.mediaType === "VIDEO_URL" ||
      character.mediaType === "VIDEO_FILEID" ||
      character.mediaType === "VIDEO_LOCAL";

    return { displayUrl, isVideo };
  } catch {
    return { displayUrl: character.media || "/placeholder.png", isVideo: false };
  }
}
