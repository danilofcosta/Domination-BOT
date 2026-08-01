import type { MyContext, PreCharacter } from "../../../../../uteis/CustomTypes.js";
import { ChatType } from "../../../../../uteis/CustomTypes.js";
import { extractMediaData } from "../../../../../uteis/uteis_telegram/extractMediaData.js";
import { SendMensageCustom } from "../../../../../uteis/sendMensageCustom.js";
import { create_caption } from "../../../../../uteis/buildCapion/create_caption.js";
import { createCharacter } from "./character.service.js";
import { EditUI } from "./edit.ui.js";
import { setCharacter } from "../../../../../cache/cache.js";
import { info, error } from "../../../../../uteis/log.js";

function parseTokens(rest: string[]) {
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

  return {
    rarities: rarities.length ? rarities : undefined,
    events: events.length ? events : undefined,
  };
}

async function sendAddedNotification(
  ctx: MyContext,
  character_db: any,
  data: PreCharacter,
  isNoautor: boolean,
) {
  const chatId = process.env.DATABASE_TELEGRAM_ID;

  if (!chatId) {
    await ctx.reply(ctx.t("add-char-success"));
    return;
  }

  const caption = create_caption({
    t: ctx.t,
    chatType: data.genero,
    character: character_db,
  });

  const fullCaption = isNoautor
    ? caption
    : caption + "\n\n" + ctx.t("add_character_confirm");

  await SendMensageCustom({
    ctx,
    chat_id: chatId,
    caption: fullCaption,
    character: character_db,
  });
}

async function addCharacterDirect(
  ctx: MyContext,
  data: PreCharacter,
  isNoautor: boolean,
) {
  try {
    const character_db = await createCharacter({
      nome: data.nome,
      anime: data.anime,
      genero: data.genero,
      mediatype: data.mediatype,
      media: data.media,
      mediaUniqueId: data.mediaUniqueId,
      rarities: data.rarities,
      events: data.events,
      addby: data.extras,
    } as any);

    await sendAddedNotification(ctx, character_db, data, isNoautor);
  } catch (e: any) {
    error("addCharacterDirect error", e);
    if (e?.code === "P2002" && e?.meta?.target?.includes?.("mediaUniqueId")) {
      await ctx.reply(ctx.t("add-char-error-media-unique"));
      return;
    }
    await ctx.reply(ctx.t("add-char-error", { error: e?.message || "erro desconhecido" }));
  }
}

export async function AddCharacterHandler(ctx: MyContext) {
  try {
    let textCommand: string | undefined;
    let reply = ctx.message?.reply_to_message;

    const mediaData = extractMediaData(ctx);
    if (
      ctx.message?.caption &&
      (ctx.message?.photo || ctx.message?.video || ctx.message?.document)
    ) {
      reply = ctx.message as any;
    }

    if (!reply) {
      await ctx.reply(ctx.t("add_character_not_reply"));
      return;
    }

    if (!mediaData) {
      await ctx.reply(ctx.t("add-char-only-photo-video"));
      return;
    }

    textCommand =
      ctx.match && String(ctx.match).length > 0
        ? String(ctx.match)
        : reply.caption;

    if (!textCommand) {
      textCommand = "";
    }

    const isNoconf = textCommand.toLowerCase().includes("noconf");
    const isNoautor = textCommand.toLowerCase().includes("noautor");
    const cleanCommand = textCommand
      .replace(/noconf|noautor/gi, "")
      .trim();

    if (!cleanCommand.includes(",")) {
      await ctx.reply(ctx.t("add-char-usage"));
      return;
    }

    const [nome, anime, ...rest] = cleanCommand.split(",");

    if (!nome || !anime) {
      await ctx.reply(ctx.t("add_character_not_info"));
      return;
    }

    const { rarities, events } = parseTokens(rest);

    const charData: PreCharacter = {
      idchat: ctx.message!.message_id,
      nome: nome.trim(),
      anime: anime.trim(),
      rarities,
      events,
      genero: ctx.botType,
      mediatype: mediaData.type === "photo" ? "IMAGE_FILEID" : "VIDEO_FILEID",
      media: mediaData.fileId,
      mediaUniqueId: mediaData.fileUniqueId,
      sourceType: "ANIME",
      username: ctx.from?.first_name || "",
      user_id: ctx.from?.id || 0,
      extras: ctx.from as Record<string, any>,
    };

    if (isNoconf) {
      await addCharacterDirect(ctx, charData, isNoautor);
      return;
    }

    const cacheId = String(Date.now());
    setCharacter(cacheId, charData);
    await EditUI(ctx, charData, cacheId);
  } catch (e) {
    error("AddCharacterHandler - erro", e);
    await ctx.reply(ctx.t("add-char-error", { error: "erro interno" }));
  }
}
