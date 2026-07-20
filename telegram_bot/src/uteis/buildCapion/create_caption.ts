import { ChatType } from "../CustomTypes.js";
import { CreateMentionUser } from "../uteis_telegram/CreateMentionUser.js";
import { extractListEmojisCharacter } from "./extract_emojis.js";

export interface Params {
  t: (key: string, params?: Record<string, string>) => string;
  chatType: ChatType;
  character: any;
  rawEmoji?: boolean;
  username?: string | null;
  user_id?: string | number | null;
  reply_markup?: any;
}

function fmtEmojis(list: string[]): string {
  if (list.length === 0) return "";
  return list.length > 1 ? `[${list.join(", ")}]` : list.join(", ");
}

export function create_caption({
  t,
  chatType,
  character,
  username,
  user_id,
  rawEmoji,
}: Params) {
  const genero = t(
    chatType === ChatType.WAIFU
      ? "create-caption-gender-waifu"
      : "create-caption-gender-husbando",
  );

  let repetition = 0;
  let char: any = character;
  let usermention = "";

  if (character && "characterId" in character) {
    repetition = character.count || 0;
    char = character.CharacterHusbando ?? character.CharacterWaifu ?? character;

    const name =
      character.TelegramUser?.telegramData?.first_name ||
      character.TelegramUser?.first_name ||
      "userprofile";

    const telegramId =
      character.TelegramUser?.telegramData?.id ||
      character.TelegramUser?.telegramId ||
      0;

    usermention = CreateMentionUser({
      Nome: name,
      telegramiduser: Number(telegramId),
    });
  } else {
    if (username && user_id) {
      usermention = CreateMentionUser({
        Nome: username,
        telegramiduser: Number(user_id),
      });
    }
  }

  const events = char?.WaifuEvent ?? char?.HusbandoEvent ?? [];
  const rarities = char?.WaifuRarity ?? char?.HusbandoRarity ?? [];
  const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
    extractListEmojisCharacter(char, !!rawEmoji);

  const title = t("harem_inline_caption_title", {
    genero,
    usermention: usermention ? `by ${usermention}` : "",
  });

  const name = t("harem_inline_caption_name", {
    character_name: capitalize(char?.name),
  });

  const info = t("harem_inline_caption_info", {
    id: String(char?.id ?? ""),
    anime: capitalize(char?.origem ?? ""),
    emoji_event: fmtEmojis(eventEmojis),
    repitition: repetition >= 1 ? `x${repetition}` : "",
  });

  const rarityName =
    rarities[0]?.rarity?.name ?? rarities[0]?.Rarity?.name ?? "";
  const rarity = t("harem_inline_caption_rarity", {
    rarity_emoji: fmtEmojis(rarityEmojis),
    rarity_name: capitalize(rarityName),
  });

  const ev = events[0]?.event ?? events[0]?.Event;
  const eventName = ev ? capitalize(ev.name ?? "") : "";
  const event = t("harem_inline_caption_event", {
    emoji_event: fmtEmojis(eventEmojis),
    event_name: eventName,
  });

  return `${title}\n\n${name}\n${info}\n${rarity}\n\n${event}`.trim();
}

function capitalize(text?: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
