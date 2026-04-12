import { MediaType } from "../../../generated/prisma/client";

export function resolveCharacterMedia(
  media: string | null,
  mediaType: MediaType | null,
  linkweb: string | null,
  linkwebExpiresAt: Date | null,
): { displayUrl: string | null; isVideo: boolean } {
  let displayUrl: string | null = null;

  if (
    linkweb &&
    linkwebExpiresAt &&
    new Date(linkwebExpiresAt) > new Date()
  ) {
    displayUrl = linkweb;
  }
  else if (
    mediaType === MediaType.IMAGE_URL ||
    mediaType === MediaType.VIDEO_URL
  ) {
    displayUrl = media || null;
  }
  else {
    displayUrl = media || null;
  }

  const isVideo =
    mediaType === MediaType.VIDEO_URL ||
    mediaType === MediaType.VIDEO_FILEID ||
    mediaType === MediaType.VIDEO_LOCAL;

  return {
    displayUrl,
    isVideo,
  };
}
