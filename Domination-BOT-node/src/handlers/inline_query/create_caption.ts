import type {
  HusbandoEvent,
  WaifuEvent,
  Event,
  WaifuRarity,
  HusbandoRarity,
  Rarity,
} from "../../../generated/prisma/client.js";

import { mentionUser } from "../../utils/metion_user.js";
import { ChatType } from "../../utils/types.js";
import type { Params } from "./create_inline_result.js";

export function create_caption({
  ctx,
  chatType,
  character,
  username,
  user_id,
  noformat,
}: Params) {
  const genero = chatType === ChatType.WAIFU ? "essa waifu" : "esse husbando";

  let repetition = 0;
  let character_let;

  let usermention = "";

  if (
    character &&
    typeof character === "object" &&
    "characterId" in character
  ) {
    const colItem = character as any;
    repetition = colItem.count || 0;
    character_let = colItem.character;
    const name =
      colItem.user?.telegramData?.first_name ||
      colItem.user?.first_name ||
      "user";
    const telegramId =
      colItem.user?.telegramData?.id || colItem.user?.telegramId || 0;
    usermention = mentionUser(name, Number(telegramId));
  } else {
    character_let = character;
    usermention =
      username && user_id
        ? mentionUser(username ?? "user", Number(user_id))
        : "";
  }

  const char = character_let as typeof character_let & {
    events?: ((WaifuEvent | HusbandoEvent) & { event?: Event })[];
    rarities?: ((WaifuRarity | HusbandoRarity) & { rarity?: Rarity })[];
    linkweb?: string | null;
    linkwebExpiresAt?: Date | null;
  };

  const events = char.events ?? [];
  const rarities = char.rarities ?? [];

  const eventEmojis = extrair_emojis(events, noformat ?? undefined);
  const rarityEmojis = extrair_emojis(rarities, noformat ?? undefined);

  const title = ctx.t("harem_inline_caption_title", {
    genero,
    usermention: usermention ? `by ${usermention}` : "",
  });

  const name = ctx.t("harem_inline_caption_name", {
    character_name: capitalize(char.name),
  });

  const info = ctx.t("harem_inline_caption_info", {
    id: char.id,
    anime: capitalize(char.origem ?? ""),
    emoji_event: eventEmojis.length ? `[${eventEmojis.join(", ")}]` : "",
    repitition: repetition && repetition >= 1 ? `x${repetition}` : "",
  });

  const rarityName = rarities[0]?.rarity?.name ?? "";
  const rarity = ctx.t("harem_inline_caption_rarity", {
    rarity_emoji:
      rarityEmojis.length > 1
        ? `[${rarityEmojis.join(", ")}]`
        : rarityEmojis.length === 1
          ? rarityEmojis.join(", ")
          : "",
    rarity_name: capitalize(rarityName),
  });

  const eventName = events[0]?.event
    ? capitalize(events[0]?.event?.name ?? "")
    : "";
  const event = ctx.t("harem_inline_caption_event", {
    emoji_event:
      eventEmojis.length > 1
        ? `[${eventEmojis.join(", ")}]`
        : (eventEmojis[0] ?? ""),
    event_name: eventName,
  });

  const webLink =
    char.linkweb &&
    char.linkwebExpiresAt &&
    new Date(char.linkwebExpiresAt) > new Date()
      ? `\n\n🌐 <a href="${char.linkweb}">Link Web</a>`
      : "";

  return `${title}

${name}
${info}
${rarity}

${event}${webLink}`.trim();
}

////////////////////////////////////////////////////////////
// EMOJI BUILDER
////////////////////////////////////////////////////////////

function Id_to_enomji(id?: string, emoji?: string) {
  if (!id) return emoji ?? "";
  return `<tg-emoji emoji-id="${id}">${emoji}</tg-emoji>`;
}
export function extrair_emojis(
  events: ((WaifuEvent | HusbandoEvent | WaifuRarity | HusbandoRarity) & {
    event?: Event | Rarity;
    rarity?: Rarity;
  })[],
  noformat?: boolean,
) {
  const emojis: string[] = [];
  for (const item of events) {
    const event = item.event ?? item.rarity ?? undefined;
    if (!event || !event.emoji) continue;

    if (!noformat && event.emoji_id) {
      emojis.push(Id_to_enomji(event.emoji_id, event.emoji));
    } else {
      emojis.push(event.emoji);
    }
  }

  return emojis;
}
////////////////////////////////////////////////////////////
// CAPITALIZE
////////////////////////////////////////////////////////////

function capitalize(text?: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
