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

  if (reply.document) {
    const doc = reply.document;
    const isImage = doc.mime_type?.startsWith("image/");
    const isVideo = doc.mime_type?.startsWith("video/");
    const isWithinLimit = doc.file_size && doc.file_size <= 20 * 1024 * 1024;

    if ((isImage || isVideo) && isWithinLimit) {
      return {
        fileId: doc.file_id,
        fileUniqueId: doc.file_unique_id,
        type: isImage ? MediaType.IMAGE_FILEID : MediaType.VIDEO_FILEID,
      };
    }
  }

  return undefined;
}
