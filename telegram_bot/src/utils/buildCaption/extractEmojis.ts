import type { Rarity } from "../../../generated/prisma/client.js";
import { type Character, type EventType, type RarityType } from "../customTypes.js";

export function extractListEmojisCharacter(
  character: Character,
  rawEmoji: boolean,
): { emoji_event: string[]; emoji_raridade: string[] } {
  if (!character) {
    return { emoji_event: [], emoji_raridade: [] };
  }

  const char = character as any;

  const ListEmojsEventRaw = char.WaifuEvent ?? char.HusbandoEvent ?? [];
  const ListEmojsRarityRaw = char.WaifuRarity ?? char.HusbandoRarity ?? [];

  return {
    emoji_event: extractEmojis(ListEmojsEventRaw, rawEmoji),
    emoji_raridade: extractEmojis(ListEmojsRarityRaw, rawEmoji),
  };
}

export function idToEmoji(id?: string, emoji?: string) {
  if (!id || isNaN(Number(id))) {
    return emoji ?? "";
  }
  return `<tg-emoji emoji-id="${id}">${emoji}</tg-emoji>`;
}
export function extractEmojis(
  events: ((EventType | RarityType) & {
    event?: Event | Rarity;
    rarity?: Rarity;
    Event?: Event;
    Rarity?: Rarity;
  })[],
  rawEmoji?: boolean,
) {
  const emojis: string[] = [];
  for (const item of events) {
    const event = (item.event ??
      item.rarity ??
      item.Event ??
      item.Rarity) as any;

    if (!event?.emoji) continue;

    if (!rawEmoji && (event as any).emoji_id) {
      emojis.push(idToEmoji(event.emoji_id, event.emoji));
    } else {
      emojis.push(event.emoji);
    }
  }

  return emojis;
}
