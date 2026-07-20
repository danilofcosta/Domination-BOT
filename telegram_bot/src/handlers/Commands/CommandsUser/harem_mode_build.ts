import type { MyContext } from "../../../uteis/CustomTypes.js";
import { extractListEmojisCharacter } from "../../../uteis/buildCapion/extract_emojis.js";

function getCharacter(entry: any) {
  return entry.CharacterHusbando ?? entry.CharacterWaifu;
}

export function Harem_mode_latest(
  list_character: any[],
  ctx: MyContext,
  maxPageLen: number,
) {
  const pages: string[] = [];
  let perPage: string[] = [];
  const reversed = [...list_character].reverse();

  const buildLine = (char: any) => {
    const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
      extractListEmojisCharacter(char, false);

    const emojiStr =
      rarityEmojis.length > 1
        ? `[${rarityEmojis.join(", ")}]`
        : (rarityEmojis[0] ?? "");

    const rarityName =
      char.WaifuRarity?.[0]?.Rarity?.name ??
      char.HusbandoRarity?.[0]?.Rarity?.name ??
      "Unknown";

    return `<b> ${ctx.t("harem_mode_recent_nome", { nome: char.name })}\n${ctx.t("harem_mode_recent_id", { id: char.id })}\n${ctx.t("harem_mode_recent_rarity", { rarity_emoji: emojiStr, rarity_name: rarityName })}\n${ctx.t("harem_mode_recent_anime", { sourceType: char.sourceType, anime: char.origem })}\n\n </b>`.trim();
  };

  for (let i = 0; i < reversed.length; i++) {
    const line = buildLine(getCharacter(reversed[i]));
    if (
      perPage.join("").length + line.length > maxPageLen &&
      perPage.length > 0
    ) {
      pages.push(perPage.join(""));
      perPage = [];
    }
    perPage.push(line);
  }

  if (perPage.length > 0) pages.push(perPage.join(""));
  if (pages.length === 0) pages.push("Nenhum personagem.");
  return pages;
}

function buildGroupedPages(
  list_character: any[],
  _ctx: MyContext,
  getGroupKey: (char: any) => string,
  formatHeader: (groupName: string) => string,
  formatLine: (
    char: any,
    eventEmojis: string[],
    rarityEmojis: string[],
  ) => string,
  maxPageLen: number,
) {
  const grouped = new Map<string, any[]>();
  for (const entry of list_character) {
    const character = getCharacter(entry);
    const key = getGroupKey(character);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const pages: string[] = [];
  let perPage: string[] = [];

  const pushOrNew = (part: string) => {
    if (
      perPage.join("").length + part.length > maxPageLen &&
      perPage.length > 0
    ) {
      pages.push(perPage.join(""));
      perPage = [];
    }
    perPage.push(part);
  };

  for (const [groupName, chars] of Array.from(grouped.entries()).sort(
    ([a], [b]) => a.localeCompare(b),
  )) {
    pushOrNew(formatHeader(groupName));
    for (let i = 0; i < chars.length; i++) {
      const character = getCharacter(chars[i]);
      const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
        extractListEmojisCharacter(character, false);

      pushOrNew(formatLine(character, eventEmojis, rarityEmojis) + "\n");

      if (perPage.length > 0 && perPage.join("").length >= maxPageLen) {
        pages.push(perPage.join(""));
        perPage = [];
        if (i < chars.length - 1) {
          perPage.push(`\n<b>${groupName} (cont.)</b>\n`);
        }
      }
    }
  }

  if (perPage.length > 0) pages.push(perPage.join(""));
  if (pages.length === 0) pages.push("Nenhum personagem.");
  return pages;
}

export function Harem_mode_rarity(
  list_character: any[],
  ctx: MyContext,
  maxPageLen: number,
) {
  return buildGroupedPages(
    list_character,
    ctx,
    (char) =>
      char.WaifuRarity?.[0]?.Rarity?.name ??
      char.HusbandoRarity?.[0]?.Rarity?.name ??
      "No Rarity",
    (name) => `\n🔸 <b>${name}</b>\n`,
    (char, eventEmojis) => {
      let line = ` - ${char.name} <code>${char.id}</code>`;
      if (eventEmojis.length) line += ` [${eventEmojis.join("")}]`;
      return line;
    },
    maxPageLen,
  );
}

export function Harem_mode_event(
  list_character: any[],
  ctx: MyContext,
  maxPageLen: number,
) {
  return buildGroupedPages(
    list_character,
    ctx,
    (char) =>
      char.WaifuEvent?.[0]?.Event?.name ??
      char.HusbandoEvent?.[0]?.Event?.name ??
      "Sem Evento",
    (name) => `\n🔹 <b>${name}</b>\n`,
    (char, _eventEmojis, rarityEmojis) => {
      let line = ` - ${char.name} <code>${char.id}</code>`;
      if (rarityEmojis.length) line += ` [${rarityEmojis.join("")}]`;
      return line;
    },
    maxPageLen,
  );
}

export function Harem_mode_default(
  list_character: any[],
  ctx: MyContext,
  dbAnimeCounts: Map<string, number>,
  maxPageLen: number,
) {
  const grouped = new Map<string, any[]>();
  for (const entry of list_character) {
    const character = getCharacter(entry);
    const animeName = character?.origem ?? "Desconhecido";
    if (!grouped.has(animeName)) grouped.set(animeName, []);
    grouped.get(animeName)!.push(entry);
  }

  const pages: string[] = [];
  let perPage: string[] = [];
  const sortedAnimes = Array.from(grouped.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [animeName, chars] of sortedAnimes) {
    const userHasCount = chars.length;
    const dbTotalCount = dbAnimeCounts.get(animeName) || 0;

    const header = `\n☛ <b>${animeName}</b> (${userHasCount}/${dbTotalCount})\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n`;

    if (
      perPage.join("").length + header.length > maxPageLen &&
      perPage.length > 0
    ) {
      pages.push(perPage.join(""));
      perPage = [];
    }
    perPage.push(header);

    for (let i = 0; i < chars.length; i++) {
      const character = getCharacter(chars[i]);
      const repete = chars[i].count;
      const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
        extractListEmojisCharacter(character, false);

      const rarityIcon = rarityEmojis.length ? rarityEmojis[0] : "❔";
      const eventBrackets = eventEmojis.length
        ? ` [${eventEmojis.join("")}]`
        : "";
      const line = `➢ ꙳ <code>${character.id}</code> ꙳ ${rarityIcon} ꙳ <b>${character.name}</b>${eventBrackets} ${repete}x\n`;

      if (
        perPage.join("").length + line.length > maxPageLen &&
        perPage.length > 0
      ) {
        perPage.push("✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n");
        pages.push(perPage.join(""));
        perPage = [];
        if (i < chars.length - 1) {
          perPage.push(`\n☛ <b>${animeName} (cont.)</b>\n✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n`);
        }
      }
      perPage.push(line);
    }
    if (perPage.length > 0) {
      const footer = "✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧\n";
      if (perPage.join("").length + footer.length > maxPageLen) {
        pages.push(perPage.join(""));
        perPage = [footer];
      } else {
        perPage.push(footer);
      }
    }
  }

  const last = perPage.join("").trim();
  if (perPage.length > 0 && last !== "") pages.push(perPage.join(""));
  if (pages.length === 0) pages.push("Nenhum personagem.");

  return pages.map((p) => p.replace(/\n\n✧✧✧✧✧/g, "\n✧✧✧✧✧"));
}
