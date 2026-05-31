import { InlineKeyboard } from "grammy";
import { setCharacter } from "../../../../../cache/cache.js";
import { LinkMsg } from "../../../../../utils/link_msg.js";
import { Sendmedia } from "../../../../../utils/sendmedia.js";
import {
  type MyContext,
  type PreCharacter,
} from "../../../../../utils/customTypes.js";
import { getMedia } from "../utils/media.js";
import { parseTokens } from "../utils/tokens.js";
import { createCharacter } from "../services/character.service.js";
import { mentionUser } from "../../../../../utils/mention_user.js";
import { create_caption } from "../../../../../utils/manage_captures/create_caption.js";

const processingQueue: (() => Promise<void>)[] = [];
let isProcessing = false;
const TELEGRAM_API_DELAY_MS = 3000;

async function processQueue() {
  if (isProcessing || processingQueue.length === 0) return;
  isProcessing = true;

  while (processingQueue.length > 0) {
    const task = processingQueue.shift()!;
    try {
      await task();
    } catch (err) {
      console.error("[AddCharacterQueue] Error processing task:", err);
    }
    if (processingQueue.length > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, TELEGRAM_API_DELAY_MS),
      );
    }
  }

  isProcessing = false;
}

async function sendAddedNotification(
  ctx: MyContext,
  character_db: any,
  data: PreCharacter,
  isNoautor: boolean,
) {
  const chatId = process.env.DATABASE_TELEGRAM_ID;

  if (!chatId) {
    console.log(
      "DATABASE_TELEGRAM_ID nao configurado, pulando envio",
    );
    await ctx.reply(ctx.t("add-char-success"));
    return;
  }

  const usermention = mentionUser(data.username || "user", data.user_id);

  const caption = create_caption({
    t: ctx.t,
    chatType: data.genero,
    character: character_db,
    username: null,
    user_id: null,
    noformat: false,
  });

  const fullCaption = isNoautor
    ? caption
    : caption +
      "\n\n" +
      ctx.t("add_character_confirm", {
        usermention,
      });

  await Sendmedia({
    ctx,
    chat_id: chatId,
    caption: fullCaption,
    per: character_db,
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
    });

    await sendAddedNotification(ctx, character_db, data, isNoautor);
  } catch (e: any) {
    console.error("addCharacterDirect error:", e);
    await ctx.reply(
      ctx.t("add-char-error", { error: e?.message || "erro desconhecido" }),
    );
  }
}

async function confirmCharacter(ctx: MyContext, data: PreCharacter) {
  const { idchat, nome, anime, rarities, events, genero, mediatype, media } =
    data;

  const textoRarities = rarities
    ? rarities.toString()
    : ctx.t("add-char-default-value");
  const textoEvents = events
    ? events.toString()
    : ctx.t("add-char-default-event");
  const text = ctx.t("add-char-preview", {
    nome: nome,
    anime: anime,
    genero: genero,
    mediatype: mediatype,
    link: LinkMsg(Number(ctx.chat?.id), Number(idchat)),
    rarities: textoRarities,
    events: textoEvents,
  });

  const id = Date.now();

  setCharacter(id, data);

  const reply_markup = new InlineKeyboard().text(
    ctx.t("add_character_btn_confirm"), "addcharacter_confirm_" + id
  ).text(ctx.t("add_character_btn_cancel"), "addcharacter_cancel_" + id,

  ).row().text(ctx.t("add_character_btn_edit"), "addcharacter_edit_" + id
  )

  await Sendmedia(
    {
      ctx, caption
        : text,
      reply_markup: reply_markup

    }
  )
}

export async function AddCharacterHandler(ctx: MyContext) {
  console.log("add per");
  let text_command: string | undefined;
  let reply = ctx.message?.reply_to_message;

  if (ctx.message?.caption && (ctx.message?.photo || ctx.message?.video || ctx.message?.document)) {
    reply = (ctx?.message as any) ?? undefined;
  }

  if (!reply) {
    ctx.reply(ctx.t("add_character_not_reply"));
    return;
  }

  const media = getMedia(reply);

  if (!media) {
    if (reply.document) {
      const doc = reply.document;
      const isMedia = doc.mime_type?.startsWith("image/") || doc.mime_type?.startsWith("video/");
      if (!isMedia) {
        ctx.reply(ctx.t("add-char-document-not-media"));
      } else if (doc.file_size && doc.file_size > 20 * 1024 * 1024) {
        ctx.reply(ctx.t("add-char-document-too-large"));
      } else {
        ctx.reply(ctx.t("add-char-only-photo-video"));
      }
    } else {
      ctx.reply(ctx.t("add-char-only-photo-video"));
    }
    return;
  }

  text_command = ctx.match?.length === 0 ? reply.caption : (ctx.match as string);

  if (!text_command) {
    text_command = "";
  }
  const isNoconf = (text_command || "").toLowerCase().includes("noconf");
  const isNoautor = (text_command || "").toLowerCase().includes("noautor");
  const cleanCommand = (text_command || "")
    .replace(/noconf|noautor/gi, "")
    .trim();

  if (!cleanCommand.includes(",")) {
    ctx.reply(ctx.t("add-char-usage"));
    return;
  }

  const [nome, anime, ...rest] = cleanCommand.split(",");

  if (!nome || !anime) {
    ctx.reply(ctx.t("add_character_not_info"));
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
    mediatype: media.type,
    media: media.fileId,
    mediaUniqueId: media.fileUniqueId,
    username: ctx.from?.first_name || "",
    user_id: ctx.from?.id || 0,
    extras: ctx.from as Record<string, any>,
  };

  if (isNoconf) {
    const queuePosition = processingQueue.length;
    await ctx.reply(ctx.t("add-char-queue", { pos: queuePosition + 1 }));

    processingQueue.push(async () => {
      await addCharacterDirect(ctx, charData, isNoautor);
    });

    void processQueue();
    return;
  }

  await confirmCharacter(ctx, charData);
}
