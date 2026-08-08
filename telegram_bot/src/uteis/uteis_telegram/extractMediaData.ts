import { Context } from "grammy";

interface MediaData {
  type: "photo" | "video";
  fileId: string;
  fileUniqueId: string;
  size?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

export function extractMediaData(
  ctx: Context,
  options?: { ignoreReplyToMessage?: boolean },
): MediaData | null {
  let msg = ctx.msg;
  if (!options?.ignoreReplyToMessage && ctx.message?.reply_to_message) {
    msg = ctx.message.reply_to_message;
  }

  if (!msg) return null;

  // Foto normal
  if (msg.photo?.length) {
    const photo = msg.photo.at(-1)!;

    return {
      type: "photo",
      fileId: photo.file_id,
      fileUniqueId: photo.file_unique_id,
      size: photo.file_size,
      width: photo.width,
      height: photo.height,
    };
  }

  // Vídeo normal
  if (msg.video) {
    return {
      type: "video",
      fileId: msg.video.file_id,
      fileUniqueId: msg.video.file_unique_id,
      size: msg.video.file_size,
      width: msg.video.width,
      height: msg.video.height,
    };
  }

  // Foto ou vídeo enviados como documento
  if (msg.document) {
    const { document } = msg;

    const mime = document.mime_type ?? "";

    if (mime.startsWith("image/")) {
      return {
        type: "photo",
        fileId: document.file_id,
        fileUniqueId: document.file_unique_id,
        size: document.file_size,
      };
    }

    if (mime.startsWith("video/")) {
      return {
        type: "video",
        fileId: document.file_id,
        fileUniqueId: document.file_unique_id,
        size: document.file_size,
      };
    }
  }

  return null;
}
