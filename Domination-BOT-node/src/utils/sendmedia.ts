import type { MyContext } from "./customTypes.js";
import { MediaType } from "../../generated/prisma/client.js";
import { InputFile, InlineKeyboard } from "grammy";
import type { Character } from "./types.js";
interface ParamsSendMedia {
  chat_id?: string | number | undefined;
  ctx: MyContext | null | undefined;
  per?: Character | null;
  caption?: string;
  reply_markup?: InlineKeyboard;
}

export async function Sendmedia(ParamsSendMedia: ParamsSendMedia) {
  const { chat_id, ctx, per, caption, reply_markup } = ParamsSendMedia;

  // const resolvedChatId = chat_id ?? ctx?.chat?.id;
  const resolvedChatId = chat_id ?? ctx?.chat?.id;

  if (!resolvedChatId) {
    throw new Error("chat_id não fornecido e ctx.chat.id não disponível");
  }

  const api = ctx?.api;

  const options = {
    ...(caption !== undefined && { caption }),
    parse_mode: "HTML" as const,
    ...(reply_markup && { reply_markup }),
  };

  async function sendPhoto(
    photo: any,
    options: {
      reply_markup?: InlineKeyboard;
      parse_mode: "HTML";
      caption?: string;
    },
  ) {
    if (ctx?.replyWithPhoto) return ctx.replyWithPhoto(photo, options);
    return api!.sendPhoto(resolvedChatId!, photo, options);
  }

  async function sendVideo(video: any) {
    if (ctx?.replyWithVideo) return ctx.replyWithVideo(video, options);
    return api!.sendVideo(resolvedChatId!, video, options);
  }

  async function sendText(text: string) {
    if (ctx?.reply)
      return ctx.reply(text, {
        parse_mode: "HTML",
        ...(reply_markup && { reply_markup }),
      });
    return api!.sendMessage(resolvedChatId!, text, {
      parse_mode: "HTML",
      ...(reply_markup && { reply_markup }),
    });
  }

  if (!per) {
    return sendText(caption ?? "");
  }

  const { mediaType: type, media: media } = per;

  try {
    // IMAGENS
    if (type === MediaType.IMAGE_URL || type === MediaType.IMAGE_FILEID) {
      return await sendPhoto(media, options);
    }

    // if (type === MediaType.IMAGE_BASE64 || type === MediaType.IMAGE_BYTES) {
    //   const buffer = Buffer.from(
    //     media,
    //     type === MediaType.IMAGE_BASE64 ? "base64" : "binary",
    //   );
    //   return await sendPhoto(new InputFile(buffer));
    // }

    // if (type === MediaType.IMAGE_FILE) {
    //   return await sendPhoto(new InputFile(media));
    // }

    // VIDEOS
    if (type === MediaType.VIDEO_URL || type === MediaType.VIDEO_FILEID) {
      return await sendVideo(media);
    }

    // if (type === MediaType.VIDEO_BASE64 || type === MediaType.VIDEO_BYTES) {
    //   const buffer = Buffer.from(
    //     media,
    //     type === MediaType.VIDEO_BASE64 ? "base64" : "binary",
    //   );
    //   return await sendVideo(new InputFile(buffer));
    // }

    // if (type === MediaType.VIDEO_FILE) {
    //   return await sendVideo(new InputFile(media));
    // }

    return sendText("Tipo de mídia não suportado.");
  } catch (error) {
    console.error("Erro ao enviar mídia:", error);
    return sendText(caption ?? "");
  }
}
