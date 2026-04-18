import type { Character, MyContext } from "./customTypes.js";

import { InputFile, InlineKeyboard } from "grammy";
import fs from "fs";

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

  const sendWithRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err: any) {
        attempt++;
        if (attempt >= retries) throw err;
        error(`Sendmedia - Falha no envio, tentativa ${attempt}/${retries}`, err);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('Unreachable');
  };

  const sendPhoto = async (photo: any) => {
    return sendWithRetry(() => {
      if (chat_id) {
        return api.sendPhoto(targetChatId, photo, options);
      }
      return ctx.replyWithPhoto(photo, options);
    });
  };

  const sendVideo = async (video: any) => {
    return sendWithRetry(() => {
      if (chat_id) {
        return api.sendVideo(targetChatId, video, options);
      }
      return ctx.replyWithVideo(video, options);
    });
  };

  const sendText = async (text: string) => {
    return sendWithRetry(() => {
      if (chat_id) {
        return api.sendMessage(targetChatId, text, options);
      }
      return ctx.reply(text, options);
    });
  };

  if (!per) {
    return sendText(caption ?? "");
  }

  const { mediaType: type, media } = per;

  try {
    if (!media) {
      return sendText(caption ?? "");
    }

    debug(`Sendmedia - enviando`, { type, chatId: targetChatId, media });

    let sourceLog = "desconhecido";
    if (type === MediaType.IMAGE_LOCAL || type === MediaType.VIDEO_LOCAL) sourceLog = "arquivo local";
    else if (type === MediaType.IMAGE_URL || type === MediaType.VIDEO_URL) sourceLog = "url externa";
    else sourceLog = "file_id do telegram";

    debug(`Sendmedia - fonte da midia: ${sourceLog}`);

    const checkMediaExists = async (): Promise<boolean> => {
      try {
        if (type === MediaType.IMAGE_LOCAL || type === MediaType.VIDEO_LOCAL) {
          const path = `D/${media}`;
          const exists = fs.existsSync(path);
          if (!exists) error(`Sendmedia - Arquivo local não encontrado: ${path}`);
          return exists;
        } else if (type === MediaType.IMAGE_URL || type === MediaType.VIDEO_URL) {
          // fetch to validate if it exists. some urls might not support HEAD properly so we fallback gracefully
          const res = await fetch(media, { method: "HEAD" }).catch(() => fetch(media));
          if (!res.ok) {
            error(`Sendmedia - URL inacessível antes do envio: ${media} [${res.status}]`);
            return false;
          }
          return true;
        }
        return true;
      } catch (e) {
        error(`Sendmedia - Erro ao validar a existência da mídia: ${media}`, e);
        return false; // Safely fail
      }
    };

    const isAvailable = await checkMediaExists();
    if (!isAvailable) {
      return sendText(caption ?? "");
    }

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
    error("Sendmedia - erro ao enviar mídia após tentativas válidas", err);
    return sendText(caption ?? "");
  }
}
