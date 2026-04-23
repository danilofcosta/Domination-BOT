import type {
  HusbandoEvent,
  WaifuEvent,
  Event,
  WaifuRarity,
  HusbandoRarity,
  Rarity,
} from "../../../generated/prisma/client.js";

import { mentionUser } from "./metion_user.js";
import type { Params } from "../../handlers/inline_query/create_inline_result.js";
import { extractListEmojisCharacter } from "./extractListEmojisCharacter.js";
import { ChatType } from "../customTypes.js";

export function create_caption({
  ctx,
  chatType,
  character,
  username,
  user_id,
  noformat,
}: Params) {
  // console.log(character);
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

    character_let = colItem.Character || character;

    const name =
      colItem.User.telegramData.first_name ||
      colItem.User?.first_name ||
      "userprofile";

    const telegramId =
      colItem.User?.telegramData?.id || colItem.User?.telegramId || 0;
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
    WaifuEvent?: (WaifuEvent & { Event?: Event })[];
    HusbandoEvent?: (HusbandoEvent & { Event?: Event })[];
    rarities?: ((WaifuRarity | HusbandoRarity) & { rarity?: Rarity })[];
    WaifuRarity?: (WaifuRarity & { Rarity?: Rarity })[];
    HusbandoRarity?: (HusbandoRarity & { Rarity?: Rarity })[];
  };
  // console.log(char);
  const events = char?.WaifuEvent ?? char?.HusbandoEvent ?? [];
  const rarities = char?.WaifuRarity ?? char?.HusbandoRarity ?? [];
  const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } =
    extractListEmojisCharacter(ctx, char as any, !!noformat);

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
    emoji_event: eventEmojis.length
      ? eventEmojis.length > 1
        ? `[${eventEmojis.join(", ")}]`
        : eventEmojis.join(", ")
      : "",

    repitition: repetition && repetition >= 1 ? `x${repetition}` : "",
  });

  const rarityName =
    rarities[0]?.rarity?.name ?? rarities[0]?.Rarity?.name ?? "";
  const rarity = ctx.t("harem_inline_caption_rarity", {
    rarity_emoji:
      rarityEmojis.length > 1
        ? `[${rarityEmojis.join(", ")}]`
        : rarityEmojis.length === 1
          ? rarityEmojis.join(", ")
          : "",
    rarity_name: capitalize(rarityName),
  });

  const ev = events[0]?.event ?? events[0]?.Event;
  const eventName = ev ? capitalize(ev.name ?? "") : "";
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

${event}`.trim();
}

function capitalize(text?: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
