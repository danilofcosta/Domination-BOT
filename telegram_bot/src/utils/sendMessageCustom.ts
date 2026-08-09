

import { InputFile, InlineKeyboard } from "grammy";
import fs from "fs";

import { error, debug } from "./log.js";
import type { Character, MyContext } from "./customTypes.js";
import { MediaType } from "../../generated/prisma/client.js";


export interface MediaParamsMini {
  media: string,
  mediaType: MediaType
}
interface ParamsSendMedia {
  chat_id?: string | number | undefined;
  message_thread_id?: number | undefined;
  ctx: MyContext | null | undefined;
  character?: Character | MediaParamsMini | null;
  caption?: string;
  reply_markup?: InlineKeyboard | any;
}

export async function sendMessageCustom(params: ParamsSendMedia) {
  let { chat_id, message_thread_id, ctx, character, caption, reply_markup } = params;

  if (!ctx) {
    throw new Error("ctx é obrigatório");
  }
//   if (caption) {
//   caption += "\n\nBanco de dados Oficial indisponível ate 01/08, infos atuais da versão de junho :D";
// }
  const api = ctx.api;
  const targetChatId = chat_id ?? ctx.chat?.id;

  if (!targetChatId) {
    throw new Error("chat_id não fornecido e ctx.chat.id não disponível");
  }

  // const directTopicId = await (async () => {
  //   const chatId = ctx.chat?.id;
  //   if (!chatId) return undefined;
  //   const cached = getCachedTopic(chatId);
  //   if (cached !== undefined) return cached || undefined;
  //   try {
  //     const group = await prisma.telegramGroup.findUnique({
  //       where: { groupId: BigInt(chatId) },
  //       select: { configuration: true },
  //     });
  //     if (group?.configuration && typeof group.configuration === "object" && "directMessagesTopicId" in (group.configuration as any)) {
  //       const tid = Number((group.configuration as any).directMessagesTopicId);
  //       setCachedTopic(chatId, tid);
  //       return tid;
  //     }
  //   } catch { /* fallback */ }
  //   setCachedTopic(chatId, 0);
  //   return undefined;
  // })();
  const directTopicId = undefined
  const topicId = message_thread_id ?? directTopicId ?? undefined;
  const messageId = ctx.message?.message_id;

  const options = {
    parse_mode: "HTML" as const,
    ...(caption !== undefined && { caption }),
    ...(reply_markup && { reply_markup }),
    ...(topicId && { message_thread_id: topicId }),
    ...(messageId && {
      reply_parameters: { message_id: messageId, allow_sending_without_reply: true, },
    }),
  };

  // ─── helpers de envio com retry ───────────────────────────

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
    throw new Error("Unreachable");
  };

  const sendPhoto = (photo: any) =>
    sendWithRetry(() =>
      chat_id
        ? api.sendPhoto(targetChatId, photo, options)
        : ctx.replyWithPhoto(photo, options)
    );

  const sendVideo = (video: any) =>
    sendWithRetry(() =>
      chat_id
        ? api.sendVideo(targetChatId, video, options)
        : ctx.replyWithVideo(video, options)
    );

  const sendText = (text: string) =>
    sendWithRetry(() =>
      chat_id
        ? api.sendMessage(targetChatId, text, options)
        : ctx.reply(text, options)
    );

  if (!character) return sendText(caption ?? "");

  const { mediaType: type, media } = character;
  // const { mediaType: type, media } = character.mediaType ===MediaType.IMAGE_URL ?character:midia_temporaria;

  try {
    if (!media) return sendText(caption ?? "");

    debug(`Sendmedia - enviando`, { type, chatId: targetChatId, media });

    // ─── validação de existência ──────────────────────────────

    const checkMediaExists = async (): Promise<boolean> => {
      try {
        if (type === MediaType.IMAGE_LOCAL || type === MediaType.VIDEO_LOCAL) {
          const path = `D/${media}`;
          const exists = fs.existsSync(path);
          if (!exists) error(`Sendmedia - Arquivo local não encontrado: ${path}`);
          return exists;
        }
        if (type === MediaType.IMAGE_URL || type === MediaType.VIDEO_URL) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          try {
            const res = await fetch(media, { method: "HEAD", signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return true;
          } catch {
            return false;
          } finally {
            clearTimeout(timeoutId);
          }
        }
        return true; // file_id — sempre assume que existe
      } catch (e) {
        error(`Sendmedia - Erro ao validar a existência da mídia: ${media}`, e);
        return false;
      }
    };

    const isAvailable = await checkMediaExists();
    if (!isAvailable) return sendText(caption ?? "");


    if (type === MediaType.IMAGE_URL || type === MediaType.IMAGE_FILEID)
      return await sendPhoto(media);

    if (type === MediaType.VIDEO_URL || type === MediaType.VIDEO_FILEID)
      return await sendVideo(media);

    if (type === MediaType.IMAGE_LOCAL)
      return await sendPhoto(new InputFile(`D/${media}`));

    if (type === MediaType.VIDEO_LOCAL)
      return await sendVideo(new InputFile(`D/${media}`));

    return sendText(ctx?.t("error-sendmedia-unsupported") ?? "Tipo de mídia não suportado.");
  } catch (err) {
    error("Sendmedia - erro ao enviar mídia após tentativas válidas", err);
    return sendText(caption ?? "");
  }
}
