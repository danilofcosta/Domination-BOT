import { extractListEmojisCharacter } from "../uteis/extractListEmojisCharacter";

export function createCaption(
  character: any,
  type: "waifu" | "husbando",
  usermention: string = "",
) {
  const eventKey = type === "waifu" ? "WaifuEvent" : "HusbandoEvent";
  const rarityKey = type === "waifu" ? "WaifuRarity" : "HusbandoRarity";

  const events = character[eventKey] || [];
  const rarities = character[rarityKey] || [];

  const capitalize = (text?: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
    extractListEmojisCharacter(type, character);

  const genero = type === "waifu" ? "essa waifu" : "esse husbando";

  const title = `wow! Veja ${genero} !`;
  const name = capitalize(character.name);

  const emojiEventStr =
    eventEmojis.length > 1
      ? `[${eventEmojis.join(", ")}]`
      : eventEmojis.join(", ");

  const info = `${character.id} : ${capitalize(character.origem || "")} ${emojiEventStr}`;

  const rarityName = rarities[0]?.Rarity?.name || "";
  const rarityEmojiStr =
    rarityEmojis.length > 1
      ? `[${rarityEmojis.join(", ")}]`
      : rarityEmojis.join(", ");
  const rarity = rarityName
    ? `Raridade: ${capitalize(rarityName)} ${rarityEmojiStr}`
    : "";

  const ev = events[0]?.Event;
  const emojiEvent = ev?.emoji || "";
  const eventName = ev?.name || "";
  const eventLine = eventName
    ? `${emojiEvent} ${capitalize(eventName)} ${emojiEvent}`
    : "";

  const addedBy = usermention ? `⚕ ᴀᴅᴅᴇᴅ ʙʏ: ${usermention}` : "";

  return `<b>${title}

${name}
${info}
${rarity}

${eventLine}

${addedBy}</b>`.trim();
}
