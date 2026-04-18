import { InlineKeyboard } from "grammy";
import { prisma } from "../../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { setHarem } from "../../../cache/cache.js";
import { mentionUser } from "../../../utils/manege_caption/metion_user.js";
import { extractListEmojisCharacter } from "../../../utils/manege_caption/extractListEmojisCharacter.js";
import { info, warn, error, debug } from "../../../utils/log.js";

export async function HaremHandler(ctx: MyContext) {
  info(`HaremHandler - carregando harém`, { userId: ctx.from?.id, genero: ctx.session.settings.genero });

  const user = await prisma.user.findUnique({
    where: {
      telegramId: Number(ctx.from?.id),
    },
    include: {
      CharacterWaifu: {
        include: {
          WaifuEvent: { include: { Event: true } },
          WaifuRarity: { include: { Rarity: true } },
        },
      },
      CharacterHusbando: {
        include: {
          HusbandoEvent: { include: { Event: true } },
          HusbandoRarity: { include: { Rarity: true } },
        },
      },

      HusbandoCollection: {
        include: {
          Character: {
            include: {
              HusbandoEvent: { include: { Event: true } },
              HusbandoRarity: { include: { Rarity: true } },
            },
          },
        },
      },
      WaifuCollection: {
        include: {
          Character: {
            include: {
              WaifuEvent: { include: { Event: true } },
              WaifuRarity: { include: { Rarity: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    warn(`HaremHandler - usuário não encontrado`, { userId: ctx.from?.id });
    ctx.reply(ctx.t("harem_no_user"));
    return;
  }

  const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;
  const config = isHusbando ? (user.husbandoConfig as any) || {} : (user.waifuConfig as any) || {};
  const mode = config.haremMode || "default";// modo padrão

  const data = isHusbando ? (user as any).CharacterHusbando : (user as any).CharacterWaifu;
  const colletion = isHusbando ? (user as any).HusbandoCollection : (user as any).WaifuCollection;
  
  let pages: string[] = [];
  if (mode === "rarity") {
    pages = Harem_mode_rarity(colletion || [], ctx);
  } else if (mode === "event") {
    pages = Harem_mode_event(colletion || [], ctx);
  } else if (mode === "latest") {
    pages = Harem_mode_latest(colletion || [], ctx);
  } else {
    // Modo padrão (Anime grouping)
    const countsData = isHusbando 
      ? await prisma.characterHusbando.groupBy({ by: ['origem'], _count: { id: true }})
      : await prisma.characterWaifu.groupBy({ by: ['origem'], _count: { id: true }});
    
    const dbAnimeCounts = new Map(countsData.map(c => [c.origem, c._count.id]));
    pages = Harem_mode_default(colletion || [], ctx, dbAnimeCounts);
  }

  debug(`HaremHandler - páginas geradas`, { userId: ctx.from?.id, pageCount: pages.length });
// busca no cache 
  setHarem(Number(ctx.from?.id), pages);

  const harem_logo = ctx.t("harem_logo", {
    usermention:
      mentionUser(
        `<b>${ctx.from?.first_name}</b>` || "user",
        ctx.from?.id || 0,
      ) || "User",
  });

  const userId = ctx.from?.id;

  const reply_markup = new InlineKeyboard()
    .text(ctx.t("harem_btn_prev_page"), `harem_user_${userId}_prev`)
    .text(
      ctx.t("harem_btn_current_page", {
        currentpage: 1,
        totalpages: pages.length || 1,
      }),
      `harem_user_${userId}_page`,
    )
    .text(
      ctx.t("harem_btn_next_page"),
      `harem_user_${userId}_next_${pages.length > 1 ? 1 : 0}`,
    )
    .row()
    .switchInlineCurrent(
      ctx.t("harem_btn_inline_query"),
      `harem_user_${userId}`,
    ).text(ctx.t("harem_btn_fast_page"), `harem_user_${userId}_jump`)
    .row().url(ctx.t("harem_btn_web_app"), process.env.WEBAPP||`https://t.me/${ctx.me.username}?startgroup=true`).row()
    .text(ctx.t("harem_btn_close"), `harem_user_${userId}_close`);

  try {
    await Sendmedia({
      ctx: ctx,
      per: data,
      caption: harem_logo + "\n\n" + pages[0],
      reply_markup: reply_markup,
    });
  } catch (e) {
    error(`HaremHandler - erro ao enviar mídia`, e);
  }
}

function Harem_mode_latest(list_character: any[], ctx: MyContext) {
  let pages: string[] = [];
  let perPage: string[] = [];
  let cont = 0;
  const newlist_character = [...list_character].reverse();

  for (const char of newlist_character) {
    const character = char.Character;
    const name = character.name;
    const id = character.id;

    const events = character?.WaifuEvent ?? character?.HusbandoEvent ?? [];
    const rarities = character?.WaifuRarity ?? character?.HusbandoRarity ?? [];

    // const eventEmojis = extrair_emojis(events);
    // const rarityEmojis = extrair_emojis(rarities);

    const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
      extractListEmojisCharacter(ctx, character);

    const sourceType = character.sourceType;
    const anime = character.origem;

    const emojiStr =
      rarityEmojis.length > 1
        ? `[${rarityEmojis.join(", ")}]`
        : (rarityEmojis[0] ?? "");

    const rarityName = rarities?.[0]?.Rarity?.name ?? "Unknown";

    const harem_mode_recent_nome = ctx.t("harem_mode_recent_nome", {
      nome: name,
    });

    const harem_mode_recent_id = ctx.t("harem_mode_recent_id", { id: id });

    const harem_mode_recent_rarity = ctx.t("harem_mode_recent_rarity", {
      rarity_emoji: emojiStr,
      rarity_name: rarityName,
    });

    const harem_mode_recent_anime = ctx.t("harem_mode_recent_anime", {
      sourceType,
      anime,
    });

    perPage.push(
      `<b> ${harem_mode_recent_nome}\n${harem_mode_recent_id}\n${harem_mode_recent_rarity}\n${harem_mode_recent_anime}\n\n </b>`.trim(),
    );

    if (perPage.length === 4 || cont === list_character.length - 1) {
      pages.push(perPage.join(""));
      perPage = [];
    }

    cont++;
  }

  return pages;
}

function Harem_mode_rarity(list_character: any[], ctx: MyContext) {
  const grouped = new Map<string, any[]>();
  for (const char of list_character) {
      const character = char.Character;
      const rarities = character?.WaifuRarity ?? character?.HusbandoRarity ?? [];
      const rarityName = rarities?.[0]?.Rarity?.name ?? "No Rarity";
      if (!grouped.has(rarityName)) grouped.set(rarityName, []);
      grouped.get(rarityName)!.push(char);
  }

  let pages: string[] = [];
  let perPage: string[] = [];
  let charCountInPage = 0;
  
  for (const [rarityName, chars] of Array.from(grouped.entries()).sort()) {
      perPage.push(`\n🔸 <b>${rarityName}</b>\n`);
      for (const char of chars) {
          const character = char.Character;
          const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } = extractListEmojisCharacter(ctx, character);
          
          let line = ` - ${character.name} <code>${character.id}</code>`;
          if (eventEmojis.length) line += ` [${eventEmojis.join("")}]`;
          perPage.push(line + "\n");
          charCountInPage++;

          if (charCountInPage >= 15) {
              pages.push(perPage.join(""));
              perPage = [];
              charCountInPage = 0;
              if (chars.indexOf(char) < chars.length - 1) {
                  perPage.push(`\n🔸 <b>${rarityName} (cont.)</b>\n`);
              }
          }
      }
  }

  if (perPage.length > 0) pages.push(perPage.join(""));
  if (pages.length === 0) pages.push("Nenhum personagem.");

  return pages;
}

function Harem_mode_event(list_character: any[], ctx: MyContext) {
  const grouped = new Map<string, any[]>();
  for (const char of list_character) {
      const character = char.Character;
      const events = character?.WaifuEvent ?? character?.HusbandoEvent ?? [];
      const eventName = events?.[0]?.Event?.name ?? "Sem Evento";
      if (!grouped.has(eventName)) grouped.set(eventName, []);
      grouped.get(eventName)!.push(char);
  }

  let pages: string[] = [];
  let perPage: string[] = [];
  let charCountInPage = 0;
  
  for (const [eventName, chars] of Array.from(grouped.entries()).sort()) {
      perPage.push(`\n🔹 <b>${eventName}</b>\n`);
      for (const char of chars) {
          const character = char.Character;
          const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } = extractListEmojisCharacter(ctx, character);
          
          let line = ` - ${character.name} <code>${character.id}</code>`;
          if (rarityEmojis.length) line += ` [${rarityEmojis.join("")}]`;
          perPage.push(line + "\n");
          charCountInPage++;

          if (charCountInPage >= 15) {
              pages.push(perPage.join(""));
              perPage = [];
              charCountInPage = 0;
              if (chars.indexOf(char) < chars.length - 1) {
                  perPage.push(`\n🔹 <b>${eventName} (cont.)</b>\n`);
              }
          }
      }
  }

  if (perPage.length > 0) pages.push(perPage.join(""));
  if (pages.length === 0) pages.push("Nenhum personagem.");

  return pages;
}



function Harem_mode_default(list_character: any[], ctx: MyContext, dbAnimeCounts: Map<string, number>) {
  // Agrupar e garantir chaves limpas
  const grouped = new Map<string, any[]>();
  for (const char of list_character) {
      const character = char.Character;
      const animeName = character?.origem ?? "Desconhecido";
      if (!grouped.has(animeName)) grouped.set(animeName, []);
      grouped.get(animeName)!.push(char);
  }

  let pages: string[] = [];
  let perPage: string[] = [];
  let charCountInPage = 0;
  
  // Ordenar alfabeticamente os animes
  const sortedAnimes = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [animeName, chars] of sortedAnimes) {
      const userHasCount = chars.length;
      const dbTotalCount = dbAnimeCounts.get(animeName) || 0;
      
      let header = `\n☛ <b>${animeName}</b> (${userHasCount}/${dbTotalCount})\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n`;
      perPage.push(header);

      for (const char of chars) {
          const character = char.Character;
          const repete = char.count; // quantidade (ex: 1x, 2x)
          const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } = extractListEmojisCharacter(ctx, character);
          
          const rarityIcon = rarityEmojis.length ? rarityEmojis[0] : "❔";
          const eventBrackets = eventEmojis.length ? ` [${eventEmojis.join("")}]` : "";

          // ➢ ꙳ 845 ꙳ 🥉 ꙳ nico robin [❄️] 1x
          let line = `➢ ꙳ <code>${character.id}</code> ꙳ ${rarityIcon} ꙳ <b>${character.name}</b>${eventBrackets} ${repete}x\n`;
          perPage.push(line);
          charCountInPage++;

          if (charCountInPage >= 15) {
              perPage.push("✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n");
              pages.push(perPage.join(""));
              perPage = [];
              charCountInPage = 0;
              if (chars.indexOf(char) < chars.length - 1) {
                  perPage.push(`\n☛ <b>${animeName} (cont.)</b>\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n`);
              }
          }
      }
      if (perPage.length > 0 && charCountInPage > 0) {
        perPage.push("✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n");
      }
  }

  if (perPage.length > 0 && perPage.join("").trim() !== "") pages.push(perPage.join(""));
  if (pages.length === 0) pages.push("Nenhum personagem.");

  // Remove trailing line breaks
  return pages.map(p => p.replace(/\n\n✧✧✧✧✧/g, "\n✧✧✧✧✧"));
}