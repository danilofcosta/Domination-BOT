import type { Character, MyContext } from "./customTypes.js";

import { InputFile, InlineKeyboard } from "grammy";

import { MediaType } from "../../generated/prisma/client.js";
import { error, debug } from "./log.js";

interface ParamsSendMedia {
  chat_id?: string | number | undefined;
  message_thread_id?: number | undefined;
  ctx: MyContext | null | undefined;
  per?: Character | null;
  caption?: string;
  reply_markup?: InlineKeyboard;
}

export async function Sendmedia(params: ParamsSendMedia) {
  const { chat_id, message_thread_id, ctx, per, caption, reply_markup } = params;

  if (!ctx) {
    throw new Error("ctx é obrigatório");
  }

  const api = ctx.api;
  const targetChatId = chat_id ?? ctx.chat?.id;

  if (!targetChatId) {
    throw new Error("chat_id não fornecido e ctx.chat.id não disponível");
  }

  const directTopicId = ctx.session.grupo.directMessagesTopicId;
  const topicId = message_thread_id ?? (directTopicId ?? undefined);

  const options = {
    parse_mode: "HTML" as const,
    ...(caption !== undefined && { caption }),
    ...(reply_markup && { reply_markup }),
    ...(topicId && { message_thread_id: topicId }),
  };

  const sendPhoto = async (photo: any) => {
    if (chat_id) {
      return api.sendPhoto(targetChatId, photo, options);
    }
    return ctx.replyWithPhoto(photo, options);
  };

  const sendVideo = async (video: any) => {
    if (chat_id) {
      return api.sendVideo(targetChatId, video, options);
    }
    return ctx.replyWithVideo(video, options);
  };

  const sendText = async (text: string) => {
    if (chat_id) {
      return api.sendMessage(targetChatId, text, options);
    }
    return ctx.reply(text, options);
  };

  if (!per) {
    return sendText(caption ?? "");
  }

  const { mediaType: type, media } = per;

  try {
    if (!media) {
      return sendText(caption ?? "");
    }

    debug(`Sendmedia - enviando`, { type, chatId: targetChatId });

    if (type === MediaType.IMAGE_URL || type === MediaType.IMAGE_FILEID) {
      return await sendPhoto(media);
    }
    if (type === MediaType.VIDEO_URL || type === MediaType.VIDEO_FILEID) {
      return await sendVideo(media);
    }

    if (type === MediaType.IMAGE_LOCAL) {
      return await sendPhoto(new InputFile(`D/${media}`));
    }
    if (type === MediaType.VIDEO_LOCAL) {
      return await sendVideo(new InputFile(`D/${media}`));
    }

    return sendText("Tipo de mídia não suportado.");
  } catch (err) {
    error("Sendmedia - erro ao enviar mídia", err);
    return sendText(caption ?? "");
  }
}
