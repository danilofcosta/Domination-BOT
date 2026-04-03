import type { Rarity } from "../../generated/prisma/client.js";
import type { MyContext } from "./customTypes.js";
import { ChatType, type Character, type EventType, type RarityType } from "./types.js";

export function extractListEmojisCharacter(
  ctx: MyContext,
  character: Character
): { emoji_event: string[]; emoji_raridade: string[] } {
  if (!character) {
    return { emoji_event: [], emoji_raridade: [] };
  }

  const char = character as any;

  const ListEmojsEventRaw =
   process.env.TYPE_BOT === ChatType.WAIFU
      ? char.WaifuEvent
      : char.HusbandoEvent;

  const ListEmojsRarityRaw =
process.env.TYPE_BOT === ChatType.WAIFU
      ? char.WaifuRarity
      : char.HusbandoRarity;

  const emoji_event = extrair_emojis(ListEmojsEventRaw ?? []);
  const emoji_raridade = extrair_emojis(ListEmojsRarityRaw ?? []);

  return { emoji_event, emoji_raridade };
}


function Id_to_enomji(id?: string, emoji?: string) {
  if (!id) return emoji ?? "";
  return `<tg-emoji emoji-id="${id}">${emoji}</tg-emoji>`;
}
export function extrair_emojis(
  events: ((EventType | RarityType) & {
    event?: Event | Rarity;
    rarity?: Rarity;
    Event?: Event;
    Rarity?: Rarity;
  })[],
  noformat?: boolean,
) {
  const emojis: string[] = [];
  for (const item of events) {
    const event = (item.event ?? item.rarity ?? item.Event ?? item.Rarity) as any;

    if (!event?.emoji) continue;

    if (!noformat && (event as any).emoji_id) {
      emojis.push(Id_to_enomji(event.emoji_id, event.emoji));
    } else {
      emojis.push(event.emoji);
    }
  }

  return emojis;
}