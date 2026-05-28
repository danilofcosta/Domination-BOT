import { getCharacter, setCharacter } from "../../../../../cache/cache.js";
import { InlineKeyboard } from "grammy";
import type { MyContext } from "../../../../../utils/customTypes.js";
import { addCharacterEditMenu } from "./edit.ui.js";
import { confirmCharacterAdd } from "./confirm.js";
import { getEventsAll } from "../services/event.service.js";
import { getRaritiesAll } from "../services/rarity.service.js";
import { setAdminSetup } from "../../../../../cache/workflowState.js";

const ITEMS_PER_PAGE = 10;

type CachedEvent = { id: number; name: string; emoji: string };
type CachedRarity = { id: number; name: string; emoji: string };

function paginate<T>(items: T[], page: number): T[] {
  const start = (page - 1) * ITEMS_PER_PAGE;
  return items.slice(start, start + ITEMS_PER_PAGE);
}

async function showEventSelection(ctx: MyContext, id: string, page: number) {
  const character = getCharacter(Number(id));
  if (!character) return;

  const selectedIds: number[] = character.events || [];
  const allEvents = await getEventsAll();
  const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE) || 1;
  const pageEvents = paginate(allEvents, page);

  let text = "🎯 <b>Selecionar Eventos</b>\n";
  if (selectedIds.length > 0) {
    const selectedNames = allEvents.filter((e) => selectedIds.includes(e.id));
    text += `✅ <b>Selecionados:</b> ${selectedNames.map((e) => `${e.emoji} ${e.name}`).join(", ") || "—"}\n\n`;
  } else {
    text += "ℹ️ Nenhum evento selecionado\n\n";
  }
  text += `<i>Página ${page}/${totalPages}</i>`;

  const keyboard = new InlineKeyboard();
  for (const event of pageEvents) {
    const checked = selectedIds.includes(event.id) ? "✅ " : "";
    keyboard.text(`${checked}${event.emoji} ${event.name}`, `edit_character_toggle_event_${id}_${event.id}`).row();
  }

  const navRow: { text: string; callback_data: string }[] = [];
  if (page > 1) {
    navRow.push({ text: "⬅️", callback_data: `edit_character_edit_events_${id}_${page - 1}` });
  }
  if (page < totalPages) {
    navRow.push({ text: "➡️", callback_data: `edit_character_edit_events_${id}_${page + 1}` });
  }
  if (navRow.length > 0) keyboard.row(...navRow);
  keyboard.row({ text: "Concluído", callback_data: `edit_character_done_${id}` });

  if (ctx.callbackQuery?.message) {
    await ctx.editMessageText(text, { parse_mode: "HTML", reply_markup: keyboard }).catch(() => {});
  } else {
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });
  }
}

async function showRaritySelection(ctx: MyContext, id: string, page: number) {
  const character = getCharacter(Number(id));
  if (!character) return;

  const selectedIds: number[] = character.rarities || [];
  const allRarities = await getRaritiesAll();
  const totalPages = Math.ceil(allRarities.length / ITEMS_PER_PAGE) || 1;
  const pageRarities = paginate(allRarities, page);

  let text = "🎯 <b>Selecionar Raridades</b>\n";
  if (selectedIds.length > 0) {
    const selectedNames = allRarities.filter((r) => selectedIds.includes(r.id));
    text += `✅ <b>Selecionados:</b> ${selectedNames.map((r) => `${r.emoji} ${r.name}`).join(", ") || "—"}\n\n`;
  } else {
    text += "ℹ️ Nenhuma raridade selecionada\n\n";
  }
  text += `<i>Página ${page}/${totalPages}</i>`;

  const keyboard = new InlineKeyboard();
  for (const rarity of pageRarities) {
    const checked = selectedIds.includes(rarity.id) ? "✅ " : "";
    keyboard.text(`${checked}${rarity.emoji} ${rarity.name}`, `edit_character_toggle_rarity_${id}_${rarity.id}`).row();
  }

  const navRow: { text: string; callback_data: string }[] = [];
  if (page > 1) {
    navRow.push({ text: "⬅️", callback_data: `edit_character_edit_rarities_${id}_${page - 1}` });
  }
  if (page < totalPages) {
    navRow.push({ text: "➡️", callback_data: `edit_character_edit_rarities_${id}_${page + 1}` });
  }
  if (navRow.length > 0) keyboard.row(...navRow);
  keyboard.row({ text: "Concluído", callback_data: `edit_character_done_${id}` });

  if (ctx.callbackQuery?.message) {
    await ctx.editMessageText(text, { parse_mode: "HTML", reply_markup: keyboard }).catch(() => {});
  } else {
    await ctx.reply(text, { parse_mode: "HTML", reply_markup: keyboard });
  }
}

function guessPage<T extends { id: number }>(items: T[], itemId: number): number {
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return 1;
  return Math.floor(idx / ITEMS_PER_PAGE) + 1;
}

export async function handleEditMenuCallback(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;

  const data = ctx.callbackQuery.data;

  const matchNome = data.match(/^edit_character_edit_nome_(\d+)$/);
  if (matchNome) {
    const id = matchNome[1];
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    setAdminSetup(ctx, { action: "edit_nome", targetId: id });
    await ctx.reply(ctx.t("edit_character_prompt_nome", { current: character.nome }), {
      parse_mode: "HTML",
      reply_markup: { force_reply: true },
    });
    await ctx.answerCallbackQuery();
    return;
  }

  const matchAnime = data.match(/^edit_character_edit_anime_(\d+)$/);
  if (matchAnime) {
    const id = matchAnime[1];
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    setAdminSetup(ctx, { action: "edit_anime", targetId: id });
    await ctx.reply(ctx.t("edit_character_prompt_anime", { current: character.anime }), {
      parse_mode: "HTML",
      reply_markup: { force_reply: true },
    });
    await ctx.answerCallbackQuery();
    return;
  }

  const matchEvents = data.match(/^edit_character_edit_events_(\d+)_(\d+)$/);
  if (matchEvents) {
    const id = matchEvents[1];
    const page = parseInt(matchEvents[2], 10) || 1;
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    await showEventSelection(ctx, id, page);
    await ctx.answerCallbackQuery();
    return;
  }

  const matchRarities = data.match(/^edit_character_edit_rarities_(\d+)_(\d+)$/);
  if (matchRarities) {
    const id = matchRarities[1];
    const page = parseInt(matchRarities[2], 10) || 1;
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    await showRaritySelection(ctx, id, page);
    await ctx.answerCallbackQuery();
    return;
  }

  const matchToggleEvent = data.match(/^edit_character_toggle_event_(\d+)_(\d+)$/);
  if (matchToggleEvent) {
    const id = matchToggleEvent[1];
    const eventId = parseInt(matchToggleEvent[2], 10);
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    if (!character.events) character.events = [];
    const idx = character.events.indexOf(eventId);
    if (idx >= 0) {
      character.events.splice(idx, 1);
      if (character.events.length === 0) character.events = undefined;
    } else {
      character.events.push(eventId);
    }
    setCharacter(Number(id), character);
    const allEvents = await getEventsAll();
    const page = guessPage(allEvents, eventId);
    await showEventSelection(ctx, id, page);
    await ctx.answerCallbackQuery();
    return;
  }

  const matchToggleRarity = data.match(/^edit_character_toggle_rarity_(\d+)_(\d+)$/);
  if (matchToggleRarity) {
    const id = matchToggleRarity[1];
    const rarityId = parseInt(matchToggleRarity[2], 10);
    const character = getCharacter(Number(id));
    if (!character) {
      await ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
      return;
    }
    if (!character.rarities) character.rarities = [];
    const idx = character.rarities.indexOf(rarityId);
    if (idx >= 0) {
      character.rarities.splice(idx, 1);
      if (character.rarities.length === 0) character.rarities = undefined;
    } else {
      character.rarities.push(rarityId);
    }
    setCharacter(Number(id), character);
    const allRarities = await getRaritiesAll();
    const page = guessPage(allRarities, rarityId);
    await showRaritySelection(ctx, id, page);
    await ctx.answerCallbackQuery();
    return;
  }

  const matchDone = data.match(/^edit_character_done_(\d+)$/);
  if (matchDone) {
    const id = matchDone[1];
    await addCharacterEditMenu(ctx, id);
    return;
  }

  const matchConfirm = data.match(/^edit_character_edit_confirm_(\d+)$/);
  if (matchConfirm) {
    const id = matchConfirm[1];
    await confirmCharacterAdd(ctx, Number(id));
    return;
  }
}
