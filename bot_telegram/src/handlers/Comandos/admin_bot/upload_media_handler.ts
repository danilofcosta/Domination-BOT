import { type MyContext, ChatType } from "../../../utils/customTypes.js";
import { prisma } from "../../../../lib/prisma.js";
import { MediaType, Prisma, ProfileType } from "../../../../generated/prisma/client.js";
import { create_caption } from "../../../utils/manege_caption/create_caption.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { botPrefix } from "../../../CommandesManage/botConfigCommands.js";

import { Sendmedia } from "../../../utils/sendmedia.js";
import { onlyRoleBotAdmin } from "../../../utils/permissions.js";


const MAX_BATCH_SIZE = 100;
const DELAY_MS = 3000;

interface ParsedMedia {
  fileId: string;
  type: MediaType;
}

function getCharacterTypeFromPrefix(): ChatType {
  const prefix = botPrefix.toLowerCase();
  if (prefix === "w") return ChatType.WAIFU;
  if (prefix === "h") return ChatType.HUSBANDO;
  return ChatType.WAIFU;
}

function getUploadCommandPattern(): RegExp {
  return new RegExp(`^[/!]${botPrefix}up[wWhH]?\\s*`, "i");
}

function getSuffixFromCaption(caption: string): "w" | "h" | null {
  const match = caption.match(new RegExp(`^[/!]${botPrefix}up([wWhH])`, "i"));
  return match && match[1] ? match[1].toLowerCase() as "w" | "h" : null;
}

function hasUploadCommand(caption: string): boolean {
  const patterns = [
    new RegExp(`^[/!]${botPrefix}up[wWhH]?\\s*`, "i"),
    new RegExp(`^[/!]up[wWhH]?\\s*`, "i"),
  ];
  return patterns.some((p) => p.test(caption));
}

function parseUploadCommand(caption: string): { suffix: "w" | "h" | null; pattern: string } {
  const patterns = [
    { regex: new RegExp(`^([/!]${botPrefix}up)([wWhH])?(.*)`, "is"), prefix: botPrefix },
    { regex: new RegExp(`^([/!]up)([wWhH])?(.*)`, "is"), prefix: "" },
  ];

  for (const p of patterns) {
    const match = caption.match(p.regex);
    if (match) {
      return {
        suffix: match[2] ? match[2].toLowerCase() as "w" | "h" : null,
        pattern: match[1] || "",
      };
    }
  }
  return { suffix: null, pattern: "" };
}

export const UploadMediaMiddleware = onlyRoleBotAdmin(ProfileType.ADMIN);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCaption(caption: string): { nome: string; anime: string; rarities: number[]; events: number[] } | null {
  const text = caption
    .replace(new RegExp(`^[/!]${botPrefix}up[wWhH]?\\s*`, "i"), "")
    .replace(new RegExp(`^[/!]up[wWhH]?\\s*`, "i"), "")
    .trim();

  if (!text.includes(",")) {
    return null;
  }

  const [nome, anime, ...rest] = text.split(",").map((s) => s.trim());

  if (!nome || !anime) {
    return null;
  }

  const tokens = rest.join(" ").toLowerCase().split(/\s+/);
  const rarities: number[] = [];
  const events: number[] = [];

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith("r")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) rarities.push(id);
    }

    if (token.startsWith("e")) {
      const id = parseInt(token.slice(1), 10);
      if (!isNaN(id)) events.push(id);
    }
  }

  return { nome, anime, rarities, events };
}

function getMediaFromMessage(msg: any): ParsedMedia | undefined {
  if (msg.photo?.length) {
    return {
      fileId: msg.photo.at(-1).file_id,
      type: MediaType.IMAGE_FILEID,
    };
  }

  if (msg.video) {
    return {
      fileId: msg.video.file_id,
      type: MediaType.VIDEO_FILEID,
    };
  }

  return undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

async function processSingleUpload(
  ctx: MyContext,
  fileId: string,
  mediaType: MediaType,
  nome: string,
  anime: string,
  rarities: number[],
  events: number[],
  usermention: string,
  charType: ChatType
): Promise<{ success: boolean; error?: string }> {
  try {
    const isVideo = mediaType === MediaType.VIDEO_FILEID;
    const slug = `${slugify(nome)}-${slugify(anime)}-${Date.now().toString().slice(-4)}`;

    const baseData = {
      addby: (ctx.from as any) ?? Prisma.JsonNull,
      name: nome.trim(),
      origem: anime.trim(),
      mediaType,
      media: fileId,
      slug,
    };

    const isWaifu = charType === ChatType.WAIFU;

    const character_db = isWaifu
      ? await prisma.characterWaifu.create({
          data: {
            ...baseData,
            WaifuRarity: {
              create: rarities.length
                ? rarities.map((rarityId: number) => ({
                    Rarity: { connect: { id: rarityId } },
                  }))
                : [{ Rarity: { connect: { id: 1 } } }],
            },
            ...(events.length && {
              WaifuEvent: {
                create: events.map((eventId: number) => ({
                  Event: { connect: { id: eventId } },
                })),
              },
            }),
          },
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        })
      : await prisma.characterHusbando.create({
          data: {
            ...baseData,
            HusbandoRarity: {
              create: rarities.length
                ? rarities.map((rarityId: number) => ({
                    Rarity: { connect: { id: rarityId } },
                  }))
                : [{ Rarity: { connect: { id: 1 } } }],
            },
            ...(events.length && {
              HusbandoEvent: {
                create: events.map((eventId: number) => ({
                  Event: { connect: { id: eventId } },
                })),
              },
            }),
          },
          include: {
            HusbandoEvent: { include: { Event: true } },
            HusbandoRarity: { include: { Rarity: true } },
          },
        });

    let caption = create_caption({
      character: character_db,
      chatType: charType,
      ctx,
      noformat: false,
    });

    caption += `\n\n${ctx.t("add_character_confirm", {
      usermention,
    })}`;

    const databaseChatId = process.env.DATABASE_TELEGREM_ID;
    await Sendmedia({
      ctx: ctx,
      chat_id: databaseChatId,
      per: character_db,
      caption,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao processar upload:", error);
    return { success: false, error: String(error) };
  }
}

export async function UploadMediaHandler(ctx: MyContext) {
  console.log("[UploadHandler] Iniciado");
  if (!ctx.message) return;

  const msg = ctx.message;
  const caption = msg.caption || "";

  console.log("[UploadHandler] Caption:", caption);
  console.log("[UploadHandler] Tem comando:", hasUploadCommand(caption));

  if (!hasUploadCommand(caption)) {
    console.log("[UploadHandler] Comando não encontrado, saindo");
    return;
  }

  if (ctx.chat?.id.toString() === ctx.me.id.toString()) {
    console.log("[UploadHandler] Mesmo chat que o bot, saindo");
    return;
  }

  let charType = getCharacterTypeFromPrefix();
  const { suffix } = parseUploadCommand(caption);
  if (suffix) {
    charType = suffix === "w" ? ChatType.WAIFU : ChatType.HUSBANDO;
  }
  console.log("[UploadHandler] Tipo:", charType);

  const parsed = parseCaption(caption);
  console.log("[UploadHandler] Parseado:", parsed);
  if (!parsed) {
    await ctx.reply(`Formato inválido. Use: /${botPrefix}upw nome, anime, r1 e1\n ou /${botPrefix}uph nome, anime, r1 e1\n ou /upw nome, anime, r1 e1`);
    return;
  }

  const media = getMediaFromMessage(msg);
  if (!media) {
    await ctx.reply("Envie uma foto ou vídeo com o caption.");
    return;
  }

  interface MessageWithMedia {
    messageId: number;
    fileId: string;
    type: MediaType;
  }

  const replyToMessages: MessageWithMedia[] = [];

  if (msg.reply_to_message) {
    let currentMsg = msg.reply_to_message;
    while (currentMsg && replyToMessages.length < MAX_BATCH_SIZE) {
      const currentMedia = getMediaFromMessage(currentMsg);
      if (currentMedia && currentMsg.message_id) {
        replyToMessages.push({
          messageId: currentMsg.message_id,
          fileId: currentMedia.fileId,
          type: currentMedia.type,
        });
      }

      if (currentMsg.reply_to_message) {
        currentMsg = currentMsg.reply_to_message;
      } else {
        break;
      }
    }

    replyToMessages.reverse();
  }

  if (replyToMessages.length === 0 && media) {
    replyToMessages.push({
      messageId: msg.message_id!,
      fileId: media.fileId,
      type: media.type,
    });
  }

  const totalFiles = replyToMessages.length;
  if (totalFiles > MAX_BATCH_SIZE) {
    await ctx.reply(`Máximo de ${MAX_BATCH_SIZE} arquivos por vez.`);
    return;
  }

  const usermention = mentionUser(
    ctx.from?.first_name || "user",
    ctx.from?.id || 0
  );

  const statusMsg = await ctx.reply(
    `⏳ Processando ${totalFiles} arquivo(s)...`
  );

  let successCount = 0;
  let errorCount = 0;
  const chatId = ctx.chat!.id;

  for (let i = 0; i < replyToMessages.length; i++) {
    const targetMsg = replyToMessages[i];
    if (!targetMsg) continue;

    try {
      if (i > 0) {
        await sleep(DELAY_MS);
      }

      const result = await processSingleUpload(
        ctx,
        targetMsg.fileId,
        targetMsg.type,
        parsed.nome,
        parsed.anime,
        parsed.rarities,
        parsed.events,
        usermention,
        charType
      );

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      await ctx.api.editMessageText(
        chatId,
        statusMsg.message_id,
        `⏳ Processando ${i + 1}/${totalFiles}... (✅ ${successCount} | ❌ ${errorCount})`
      );
    } catch (error) {
      console.error(`Erro ao processar mensagem ${targetMsg?.messageId}:`, error);
      errorCount++;
    }
  }

  await ctx.api.editMessageText(
    chatId,
    statusMsg.message_id,
    `✅ Concluído!\n\nTotal: ${totalFiles}\nAdicionados: ${successCount}\nErros: ${errorCount}`
  );
}
