import { MediaType, type MediaResult } from "../../../../../utils/customTypes.js";

export function getMedia(reply: any): MediaResult | undefined {
  if (reply.photo?.length) {
    const photo = reply.photo.at(-1);
    return {
      fileId: photo.file_id,
      fileUniqueId: photo.file_unique_id,
      type: MediaType.IMAGE_FILEID,
    };
  }

  if (reply.video) {
    return {
      fileId: reply.video.file_id,
      fileUniqueId: reply.video.file_unique_id,
      type: MediaType.VIDEO_FILEID,
    };
  }

  return undefined;
}
