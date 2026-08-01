import type { MyContext } from "../../../uteis/CustomTypes.js";
import { error, log } from "../../../uteis/log.js";
import { getCharacter, setCharacter } from "../../../cache/cache.js";
import { extractMediaData } from "../../../uteis/uteis_telegram/extractMediaData.js";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import {
  createCharacter,
  updateCharacter,
} from "../../Commands/CommandsAdminBot/manegerCharacters/addcharacter/character.service.js";
import { onlyRoleBotAdmin } from "../../../uteis/permissions.js";
import { ProfileType } from "../../../../generated/prisma/client.js";
import { InlineKeyboard } from "grammy";
import { CreateOneBtn } from "../../../uteis/buildButtons/createOneButton.js";
import { createButtonEditCharacter } from "../../../uteis/buildButtons/createButtonEditCharacter.js";
import { EditUI } from "../../Commands/CommandsAdminBot/manegerCharacters/addcharacter/edit.ui.js";
import { getRaritiesAll } from "../../Commands/CommandsAdminBot/manegerCharacters/addcharacter/rarity.service.js";
import { getEventsAll } from "../../Commands/CommandsAdminBot/manegerCharacters/addcharacter/event.service.js";
import { create_caption } from "../../../uteis/buildCapion/create_caption.js";
import { setListener } from "../../../cache/listenerStore.js";
import { CreateMentionUser } from "../../../uteis/uteis_telegram/CreateMentionUser.js";

const ITEMS_PER_PAGE = 10;
const SOURCE_TYPES = ["ANIME", "GAME", "MANGA", "MOVIE"] as const;

function paginate<T>(items: T[], page: number): T[] {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return items.slice(start, start + ITEMS_PER_PAGE);
}

function guessPage<T extends { id: number }>(
  items: T[],
  itemId: number,
): number {
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return 1;
  return Math.floor(idx / ITEMS_PER_PAGE) + 1;
}

async function showRaritySelection(
  ctx: MyContext,
  id: string,
  page: number,
  actionType: "edit" | "add",
) {
  const character = getCharacter(id);
  if (!character) return;

  const selectedIds: number[] = character.rarities || [];
  const allRarities = await getRaritiesAll();
  const totalPages = Math.ceil(allRarities.length / ITEMS_PER_PAGE) || 1;
  const pageRarities = paginate(allRarities, page);

  let text = "<b>Selecionar Raridades</b>\n";
  if (selectedIds.length > 0) {
    const selectedNames = allRarities.filter((r) => selectedIds.includes(r.id));
    text += `Selecionados: ${selectedNames.map((r) => `${r.emoji} ${r.name}`).join(", ") || "—"}\n\n`;
  } else {
    text += "Nenhuma raridade selecionada\n\n";
  }
  text += `<i>Pagina ${page}/${totalPages}</i>`;

  const keyboard = new InlineKeyboard();
  for (const rarity of pageRarities) {
    const checked = selectedIds.includes(rarity.id) ? "✅ " : "";
    keyboard
      .text(
        `${checked}${rarity.emoji} ${rarity.name}`,
        `add-${actionType}_${id}_toggle_rarity_${rarity.id}`,
      )
      .row();
  }

  const navRow: { text: string; callback_data: string }[] = [];
  if (page > 1) {
    navRow.push({
      text: "⬅️",
      callback_data: `add-${actionType}_${id}_rarities_${page - 1}`,
    });
  }
  if (page < totalPages) {
    navRow.push({
      text: "➡️",
      callback_data: `add-${actionType}_${id}_rarities_${page + 1}`,
    });
  }
  if (navRow.length > 0) keyboard.row(...navRow);
  keyboard.row({
    text: "Concluido",
    callback_data: `add-${actionType}_${id}_sel_done`,
  });
  await EditOrSendText({ ctx, caption: text, reply_markup: keyboard });
}

async function showEventSelection(
  ctx: MyContext,
  id: string,
  page: number,
  actionType: "edit" | "add",
) {
  const character = getCharacter(id);
  if (!character) return;

  const selectedIds: number[] = character.events || [];
  const allEvents = await getEventsAll();
  const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE) || 1;
  const pageEvents = paginate(allEvents, page);

  let text = "<b>Selecionar Eventos</b>\n";
  if (selectedIds.length > 0) {
    const selectedNames = allEvents.filter((e) => selectedIds.includes(e.id));
    text += `Selecionados: ${selectedNames.map((e) => `${e.emoji} ${e.name}`).join(", ") || "—"}\n\n`;
  } else {
    text += "Nenhum evento selecionado\n\n";
  }
  text += `<i>Pagina ${page}/${totalPages}</i>`;

  const keyboard = new InlineKeyboard();
  for (const event of pageEvents) {
    const checked = selectedIds.includes(event.id) ? "✅ " : "";
    keyboard
      .text(
        `${checked}${event.emoji} ${event.name}`,
        `add-${actionType}_${id}_toggle_event_${event.id}`,
      )
      .row();
  }

  const navRow: { text: string; callback_data: string }[] = [];
  if (page > 1) {
    navRow.push({
      text: "⬅️",
      callback_data: `add-${actionType}_${id}_events_${page - 1}`,
    });
  }
  if (page < totalPages) {
    navRow.push({
      text: "➡️",
      callback_data: `add-${actionType}_${id}_events_${page + 1}`,
    });
  }
  if (navRow.length > 0) keyboard.row(...navRow);
  keyboard.row({
    text: "Concluido",
    callback_data: `add-${actionType}_${id}_sel_done`,
  });

  await EditOrSendText({ ctx, caption: text, reply_markup: keyboard });
}
// checa se o comando ta sendo usando por um adm
export async function addCharacterCallbackHandler(ctx: MyContext) {
  console.log(
    "addCharacterCallbackHandler called with data:",
    ctx.callbackQuery?.data,
  );
  if (!ctx.callbackQuery?.data) return;

  await onlyRoleBotAdmin(ProfileType.ADMIN)(ctx, async () => {
    await handleCallback(ctx);
  });
}

async function handleCallback(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const match = data.match(/^add-(edit|add)_([^_]+)_(.+)$/);
  if (!match) {
    await ctx.answerCallbackQuery(ctx.t("invalid-callback-data"));
    return;
  }

  const actionType = match[1]! as "edit" | "add";
  const cacheId = match[2]!;
  const action = match[3]!;

  const characterData = getCharacter(cacheId);
  if (!characterData) {
    await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    return;
  }

  const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat.id;
  const userId = ctx.from?.id ?? ctx.callbackQuery?.from.id;
  if (!chatId || !userId) return;

  // ─── text input: name ──────────────────────────────────────

  if (action === "name") {
    const promptMsgId = ctx.callbackQuery?.message?.message_id;

    setListener(userId, chatId, {
      type: "text",
      action: async (msgCtx: MyContext) => {
        const text = msgCtx.message?.text;
        if (!text) return;
        const current = getCharacter(cacheId!);
        if (!current) return;
        setCharacter(cacheId!, { ...current, nome: text });
        const updated = getCharacter(cacheId!);

        if (chatId && promptMsgId) {
          await msgCtx.api.deleteMessage(chatId, promptMsgId).catch(() => {});
        }
        await EditUI(msgCtx, updated, cacheId!, actionType);
      },
    });

    await EditOrSendText({
      ctx,
      caption: ctx.t("add-character-enter-name"),
      reply_markup: CreateOneBtn({
        text: ctx.t("cancel"),
        callback: `add-${actionType}_${cacheId}_home`,
      }),
    });
    return;
  }

  // ─── text input: anime ─────────────────────────────────────

  if (action === "anime") {
    const promptMsgId = ctx.callbackQuery?.message?.message_id;

    setListener(userId, chatId, {
      type: "text",
      action: async (msgCtx: MyContext) => {
        const text = msgCtx.message?.text;
        if (!text) return;
        const current = getCharacter(cacheId!);
        if (!current) return;
        setCharacter(cacheId!, { ...current, anime: text });
        const updated = getCharacter(cacheId!);

        if (chatId && promptMsgId) {
          await msgCtx.api.deleteMessage(chatId, promptMsgId).catch(() => {});
        }
        await EditUI(msgCtx, updated, cacheId!, actionType);
      },
    });

    await EditOrSendText({
      ctx,
      caption: ctx.t("add-character-enter-anime"),
      reply_markup: CreateOneBtn({
        text: ctx.t("cancel"),
        callback: `add-${actionType}_${cacheId}_home`,
      }),
    });
    return;
  }

  // ─── text/media input: media ───────────────────────────────

  if (action === "media") {
    const promptMsgId = ctx.callbackQuery?.message?.message_id;

    setListener(userId, chatId, {
      type: "text",
      action: async (msgCtx: MyContext) => {
        const current = getCharacter(cacheId!);
        if (!current) return;

        const mediaData = extractMediaData(msgCtx as any);
        if (mediaData) {
          setCharacter(cacheId!, {
            ...current,
            media: mediaData.fileId,
            mediaUniqueId: mediaData.fileUniqueId,
            mediatype:
              mediaData.type === "photo" ? "IMAGE_FILEID" : "VIDEO_FILEID",
          });
        } else {
          const text = msgCtx.message?.text || msgCtx.message?.caption;
          if (!text) return;
          setCharacter(cacheId!, { ...current, media: text });
        }

        const updated = getCharacter(cacheId!);
        if (chatId && promptMsgId) {
          await msgCtx.api.deleteMessage(chatId, promptMsgId).catch(() => {});
        }
        await EditUI(msgCtx, updated, cacheId!, actionType);
      },
    });

    await EditOrSendText({
      ctx,
      caption: ctx.t("add-character-enter-media"),
      reply_markup: CreateOneBtn({
        text: ctx.t("cancel"),
        callback: `add-${actionType}_${cacheId}_home`,
      }),
    });
    return;
  }

  // ─── source type selection (single-select, radio style) ─────

  async function showSourceTypeSelection() {
    const char = getCharacter(cacheId);
    const currentSource = char?.sourceType || "ANIME";
    let text = "<b>Selecionar Origem</b>\n\n";
    text += `Atual: ${currentSource}\n\n`;

    const keyboard = new InlineKeyboard();
    for (const st of SOURCE_TYPES) {
      const checked = st === currentSource ? "✅ " : "";
      keyboard
        .text(
          `${checked}${st}`,
          `add-${actionType}_${cacheId}_toggle_source_${st}`,
        )
        .row();
    }
    keyboard.row({
      text: "Concluido",
      callback_data: `add-${actionType}_${cacheId}_sel_done`,
    });
    await EditOrSendText({
      ctx,
      caption: text,
      reply_markup: keyboard,
    });
  }

  if (action === "source_type") {
    await showSourceTypeSelection();
    await ctx.answerCallbackQuery();
    return;
  }

  const matchToggleSource = data.match(
    /^add-(edit|add)_([^_]+)_toggle_source_(ANIME|GAME|MANGA|MOVIE)$/,
  );
  if (matchToggleSource) {
    const sourceType = matchToggleSource[3];
    const current = getCharacter(cacheId);
    if (!current) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    setCharacter(cacheId, { ...current, sourceType });
    await showSourceTypeSelection();
    await ctx.answerCallbackQuery();
    return;
  }

  // ─── rarity selection ──────────────────────────────────────

  const matchRarities = data.match(/^add-(edit|add)_([^_]+)_rarities_(\d+)$/);
  if (action === "rarities" || matchRarities) {
    const page = matchRarities ? parseInt(matchRarities[3]!, 10) : 1;
    await showRaritySelection(ctx, cacheId, page, actionType);
    await ctx.answerCallbackQuery();
    return;
  }

  const matchToggleRarity = data.match(
    /^add-(edit|add)_([^_]+)_toggle_rarity_(\d+)$/,
  );
  if (matchToggleRarity) {
    const rarityId = parseInt(matchToggleRarity[3]!, 10);
    const current = getCharacter(cacheId);
    if (!current) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    if (!current.rarities) current.rarities = [];
    const idx = current.rarities.indexOf(rarityId);
    if (idx >= 0) {
      current.rarities.splice(idx, 1);
      if (current.rarities.length === 0) current.rarities = undefined;
    } else {
      current.rarities.push(rarityId);
    }
    setCharacter(cacheId, current);
    const allRarities = await getRaritiesAll();
    const page = guessPage(allRarities, rarityId);
    await showRaritySelection(ctx, cacheId, page, actionType);
    await ctx.answerCallbackQuery();
    return;
  }

  // ─── event selection ───────────────────────────────────────

  const matchEvents = data.match(/^add-(edit|add)_([^_]+)_events_(\d+)$/);
  if (action === "events" || matchEvents) {
    const page = matchEvents ? parseInt(matchEvents[3]!, 10) : 1;
    await showEventSelection(ctx, cacheId, page, actionType);
    await ctx.answerCallbackQuery();
    return;
  }

  const matchToggleEvent = data.match(
    /^add-(edit|add)_([^_]+)_toggle_event_(\d+)$/,
  );
  if (matchToggleEvent) {
    const eventId = parseInt(matchToggleEvent[3]!, 10);
    const current = getCharacter(cacheId);
    if (!current) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    if (!current.events) current.events = [];
    const idx = current.events.indexOf(eventId);
    if (idx >= 0) {
      current.events.splice(idx, 1);
      if (current.events.length === 0) current.events = undefined;
    } else {
      current.events.push(eventId);
    }
    setCharacter(cacheId, current);
    const allEvents = await getEventsAll();
    const page = guessPage(allEvents, eventId);
    await showEventSelection(ctx, cacheId, page, actionType);
    await ctx.answerCallbackQuery();
    return;
  }

  // ─── sel_done: return to edit menu ─────────────────────────

  if (action === "sel_done") {
    const current = getCharacter(cacheId);
    if (!current) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    const caption = `<b>Nome:</b> ${current.nome}\n<b>Anime:</b> ${current.anime}\n<b>Origem:</b> ${current.sourceType || "ANIME"}\n<b>Raridades:</b> ${current.rarities?.join(", ") || "Nenhuma"}\n<b>Eventos:</b> ${current.events?.join(", ") || "Nenhum"}`;
    await EditOrSendText({
      ctx,
      caption,
      reply_markup: createButtonEditCharacter({
        cacheid: cacheId,
        action: actionType,
      }),
    });
    await ctx.answerCallbackQuery();
    return;
  }

  // ─── save ──────────────────────────────────────────────────

  if (action === "save") {
    try {
      let character_db: any;
        //caso for uma edição de personagem
      if (actionType === "edit" && characterData.editId) {
        character_db = await updateCharacter({
          id: characterData.editId,
          genero: characterData.genero,
          nome: characterData.nome,
          anime: characterData.anime,
          mediatype: characterData.mediatype,
          media: characterData.media,
          mediaUniqueId: characterData.mediaUniqueId,
          sourceType: characterData.sourceType,
          rarities: characterData.rarities,
          events: characterData.events,
        });
        await EditOrSendText({
          ctx,
          caption: ctx.t("edit-character-success", {
            character_id: characterData.editId,
          }),
          reply_markup: CreateOneBtn({
            callback: `ShowCharacterCallback_${characterData.editId}`,
            text: "Confira",
          }),
        });
       // await ctx.deleteMessage().catch(() => {});
      } else {
        log( `adicionado personagem `)
        character_db = await createCharacter({
          nome: characterData.nome,
          anime: characterData.anime,
          genero: characterData.genero,
          mediatype: characterData.mediatype,
          media: characterData.media,
          mediaUniqueId: characterData.mediaUniqueId,
          sourceType: characterData.sourceType,
          rarities: characterData.rarities,
          events: characterData.events,
          addby: ctx.from as any,
        });
      }

      if (!character_db) {
        error(  'personagem nao adicionado no db')
        await SendMensageCustom({
          ctx,
          caption: ctx.t("add-char-error", { error: "erro ao salvar" }),
        });
        await EditOrSendText({
          ctx,
          caption: `${characterData.nome},${characterData.anime},`,
          removeButtons: true,
        });
      }

      const dbChatId = process.env.DATABASE_TELEGRAM_ID;
      if (dbChatId && actionType === "add") {
        const caption = create_caption({
          character: character_db,
          chatType: characterData.genero,
          addby:ctx.t("add_character_confirm", { usermention: CreateMentionUser({ Nome: ctx.from?.first_name ??'', telegramiduser: ctx.from?.id ?? 0 }) }),
          t: ctx.t,
        });
        await SendMensageCustom({
          ctx,
          chat_id: dbChatId,
          caption,
          character: character_db,
        });

        log('done apagando  fonte')
       await ctx.deleteMessage();
   
      }
    } catch (e: any) {
      error("addCharacterCallback save error", e);
      if (e?.code === "P2002" && e?.meta?.target?.includes?.("mediaUniqueId")) {
        await ctx.answerCallbackQuery(ctx.t("add-char-error-media-unique"));
        return;
      }
      await ctx.answerCallbackQuery(
        ctx.t("add-char-error", { error: "erro ao salvar" }),
      );
    }
    return;
  }

  // ─── cancelfull ────────────────────────────────────────────

  if (action === "cancelfull") {
    await ctx.deleteMessage().catch((e) => { error(e)});
    await ctx.answerCallbackQuery(ctx.t("add-character-cancelled"));
    return;
  }

  // ─── home ──────────────────────────────────────────────────

  if (action === "home") {
    await EditOrSendText({
      ctx,
      caption: `<b>Nome:</b> ${characterData.nome}\n<b>Anime:</b> ${characterData.anime}\n<b>Origem:</b> ${characterData.sourceType || "ANIME"}\n<b>Raridades:</b> ${characterData.rarities?.join(", ") || "Nenhuma"}\n<b>Eventos:</b> ${characterData.events?.join(", ") || "Nenhum"}`,
      reply_markup: createButtonEditCharacter({
        cacheid: cacheId,
        action: actionType,
      }),
    });
    await ctx.answerCallbackQuery();
    return;
  }

  await ctx.answerCallbackQuery();
}
