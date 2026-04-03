import { InlineKeyboard } from "grammy";
import { prisma } from "../../../../lib/prisma.js";
import { getCharacter, setCharacter } from "../../../cache/cache.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { LinkMsg } from "../../../utils/link_msg.js";

function getCharacterConfirmText(data_character: any, ctx: MyContext) {
  const { nome, anime, rarities, events, genero, mediatype, idchat } = data_character;
  const url = LinkMsg(Number(ctx.chat?.id), Number(idchat));
  return `Nome: ${nome}\nAnime: ${anime}\nGenero: ${genero}\nMediatype: ${mediatype}\nData: ${idchat}\nRarities: ${rarities?.length ? rarities.join(", ") : "valor padrao"}\nEvents: ${events?.length ? events.join(", ") : "sem evento "}`;
}

export async function editCharacterCallbackData(ctx: MyContext) {
  if (!ctx.callbackQuery?.data) return;
  
  const parts = ctx.callbackQuery.data.split("_");
  const rootAction = parts[2];

  if (rootAction === "edit") {
    const field = parts[3];
    const id_cached = parts[4];
    const page = Number(parts[5] || "1");
    
    if (!id_cached) return;

    const character = getCharacter(Number(id_cached));
    if (!character) {
      return ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    }

    if (field === "confirm") {
      const text = getCharacterConfirmText(character, ctx);
      await ctx.editMessageText(text, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: ctx.t("add_character_btn_confirm"), callback_data: "addcharacter_confirm_" + id_cached },
              { text: ctx.t("add_character_btn_cancel"), callback_data: "addcharacter_cancel_" + id_cached },
              { text: ctx.t("add_character_btn_edit"), callback_data: "addcharacter_edit_" + id_cached },
            ]
          ],
        },
      });
      return;
    }

    if (field === "nome" || field === "anime") {
        if (!ctx.session.adminSetup) {
            ctx.session.adminSetup = { action: null, targetId: null };
        }
        ctx.session.adminSetup.action = field === "nome" ? "edit_nome" : "edit_anime";
        ctx.session.adminSetup.targetId = id_cached;
        await ctx.reply(`Enviando um novo ${field} para o personagem. Por favor digite abaixo:`, {
            reply_markup: { force_reply: true }
        });
        await ctx.answerCallbackQuery();
        return;
    }

    if (field === "events") {
      await showEventsMenu(ctx, character, id_cached, page);
      return;
    }
    if (field === "rarities") {
      await showRaritiesMenu(ctx, character, id_cached, page);
      return;
    }
    
    await ctx.answerCallbackQuery("Em breve...");
    return;
  }

  if (rootAction === "toggle") {
    const type = parts[3];
    const itemId = Number(parts[4]);
    const id_cached = parts[5];
    const page = Number(parts[6] || "1");
    
    if (!id_cached) return;

    let character = getCharacter(Number(id_cached));
    if (!character) {
      return ctx.answerCallbackQuery(ctx.t("error-character-not-found"));
    }

    if (type === "event") {
      if (!character.events) character.events = [];
      if (character.events.includes(itemId)) {
        character.events = character.events.filter((e: number) => e !== itemId);
      } else {
        character.events.push(itemId);
      }
      setCharacter(Number(id_cached), character);
      await showEventsMenu(ctx, character, id_cached, page);
      return;
    }

    if (type === "rarity") {
      if (!character.rarities) character.rarities = [];
      if (character.rarities.includes(itemId)) {
        character.rarities = character.rarities.filter((r: number) => r !== itemId);
      } else {
        character.rarities.push(itemId);
      }
      setCharacter(Number(id_cached), character);
      await showRaritiesMenu(ctx, character, id_cached, page);
      return;
    }
  }
}

async function showEventsMenu(ctx: MyContext, character: any, id_cached: string, page: number) {
  const ITEMS_PER_PAGE = 15;
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const [allEvents, totalCount] = await Promise.all([
    prisma.event.findMany({ skip, take: ITEMS_PER_PAGE, orderBy: { id: 'asc' } }),
    prisma.event.count()
  ]);
  
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  const keyboard = new InlineKeyboard();
  
  for (const event of allEvents) {
    const isSelected = character.events?.includes(event.id);
    const text = `${isSelected ? "✅ " : ""}${event.emoji || ""} ${event.name}`;
    keyboard.text(text, `edit_character_toggle_event_${event.id}_${id_cached}_${page}`).row();
  }
  
  const navRow = [];
  if (page > 1) {
    navRow.push({ text: "⬅️", callback_data: `edit_character_edit_events_${id_cached}_${page - 1}` });
  }
  if (page < totalPages) {
    navRow.push({ text: "➡️", callback_data: `edit_character_edit_events_${id_cached}_${page + 1}` });
  }
  if (navRow.length > 0) {
    keyboard.row(...navRow);
  }
  
  keyboard.text("🔙 Voltar", `addcharacter_edit_${id_cached}`);
  
  await ctx.editMessageText(`Selecione os Eventos (Página ${page}/${totalPages}):\n\nAtual: ${character.events?.length ? character.events.join(", ") : "nenhum"}`, {
    reply_markup: keyboard
  });
}

async function showRaritiesMenu(ctx: MyContext, character: any, id_cached: string, page: number) {
  const ITEMS_PER_PAGE = 15;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const [allRarities, totalCount] = await Promise.all([
    prisma.rarity.findMany({ skip, take: ITEMS_PER_PAGE, orderBy: { id: 'asc' } }),
    prisma.rarity.count()
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  const keyboard = new InlineKeyboard();
  
  for (const rarity of allRarities) {
    const isSelected = character.rarities?.includes(rarity.id);
    const text = `${isSelected ? "✅ " : ""}${rarity.emoji || ""} ${rarity.name}`;
    keyboard.text(text, `edit_character_toggle_rarity_${rarity.id}_${id_cached}_${page}`).row();
  }
  
  const navRow = [];
  if (page > 1) {
    navRow.push({ text: "⬅️", callback_data: `edit_character_edit_rarities_${id_cached}_${page - 1}` });
  }
  if (page < totalPages) {
    navRow.push({ text: "➡️", callback_data: `edit_character_edit_rarities_${id_cached}_${page + 1}` });
  }
  if (navRow.length > 0) {
    keyboard.row(...navRow);
  }

  keyboard.text("🔙 Voltar", `addcharacter_edit_${id_cached}`);
  
  await ctx.editMessageText(`Selecione as Raridades (Página ${page}/${totalPages}):\n\nAtual: ${character.rarities?.length ? character.rarities.join(", ") : "nenhuma"}`, {
    reply_markup: keyboard
  });
}
