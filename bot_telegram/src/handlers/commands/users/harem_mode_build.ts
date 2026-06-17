import type { MyContext } from "../../../utils/customTypes.js";
import { extractListEmojisCharacter } from "../../../utils/manage_captures/extract_emojis.js";

export function Harem_mode_latest(list_character: any[], ctx: MyContext) {
  let pages: string[] = [];
  let perPage: string[] = [];
  let cont = 0;
  const newlist_character = [...list_character].reverse();

  for (const char of newlist_character) {
    const character = char.CharacterHusbando ?? char.CharacterWaifu;
    const name = character.name;
    const id = character.id;

    const events = character?.WaifuEvent ?? character?.HusbandoEvent ?? [];
    const rarities = character?.WaifuRarity ?? character?.HusbandoRarity ?? [];

    // const eventEmojis = extrair_emojis(events);
    // const rarityEmojis = extrair_emojis(rarities);

    const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
      extractListEmojisCharacter(character, false);

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

export function Harem_mode_rarity(list_character: any[], ctx: MyContext) {
  const grouped = new Map<string, any[]>();
  for (const char of list_character) {
    const character = char.CharacterHusbando ?? char.CharacterWaifu;
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
      const character = char.CharacterHusbando ?? char.CharacterWaifu;
      const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
        extractListEmojisCharacter(character, false);

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

export function Harem_mode_event(list_character: any[], ctx: MyContext) {
  const grouped = new Map<string, any[]>();
  for (const char of list_character) {
    const character = char.CharacterHusbando ?? char.CharacterWaifu;
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
      const character = char.CharacterHusbando ?? char.CharacterWaifu;
      const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
        extractListEmojisCharacter(character, false);

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

export function Harem_mode_default(
  list_character: any[],
  ctx: MyContext,
  dbAnimeCounts: Map<string, number>,
) {
  // Agrupar e garantir chaves limpas
  const grouped = new Map<string, any[]>();
  for (const char of list_character) {
    const character = char.CharacterHusbando ?? char.CharacterWaifu;
    const animeName = character?.origem ?? "Desconhecido";
    if (!grouped.has(animeName)) grouped.set(animeName, []);
    grouped.get(animeName)!.push(char);
  }

  let pages: string[] = [];
  let perPage: string[] = [];
  let charCountInPage = 0;

  // Ordenar alfabeticamente os animes
  const sortedAnimes = Array.from(grouped.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  for (const [animeName, chars] of sortedAnimes) {
    const userHasCount = chars.length;
    const dbTotalCount = dbAnimeCounts.get(animeName) || 0;

    let header = `\n☛ <b>${animeName}</b> (${userHasCount}/${dbTotalCount})\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n`;
    perPage.push(header);

    for (const char of chars) {
      const character = char.CharacterHusbando ?? char.CharacterWaifu;
      const repete = char.count; // quantidade (ex: 1x, 2x)
      const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
        extractListEmojisCharacter(character, false);

      const rarityIcon = rarityEmojis.length ? rarityEmojis[0] : "❔";
      const eventBrackets = eventEmojis.length
        ? ` [${eventEmojis.join("")}]`
        : "";

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

  if (perPage.length > 0 && perPage.join("").trim() !== "")
    pages.push(perPage.join(""));
  if (pages.length === 0) pages.push("Nenhum personagem.");

  // Remove trailing line breaks
  return pages.map((p) => p.replace(/\n\n✧✧✧✧✧/g, "\n✧✧✧✧✧"));
}
