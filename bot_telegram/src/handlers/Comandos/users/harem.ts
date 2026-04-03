import { InlineKeyboard } from "grammy";
import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { ChatType, type Character } from "../../../utils/types.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { setHarem } from "../../../cache/cache.js";
import { mentionUser } from "../../../utils/metion_user.js";
import console from "node:console";
import { extractListEmojisCharacter } from "../../../utils/extractListEmojisCharacter.js";

export async function HaremHandler(ctx: MyContext) {
  console.log(ctx.from?.id, "harem");

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
    ctx.reply(ctx.t("harem_no_user"));
    return;
  }

  const data =
    ctx.session.settings.genero === ChatType.HUSBANDO
      ? (user as any).CharacterHusbando
      : (user as any).CharacterWaifu;
  const colletion =
    ctx.session.settings.genero === ChatType.HUSBANDO
      ? (user as any).HusbandoCollection
      : (user as any).WaifuCollection;
  // console.log(user);
  const pages = Harem_mode_latest(colletion || [], ctx);

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
    // .switchInline(ctx.t("harem_btn_inline_query"), `harem_user_${userId}`)
    .switchInlineCurrent(
      ctx.t("harem_btn_inline_query"),
      `harem_user_${userId}`,
    )
    .text(ctx.t("harem_btn_fast_page"), `harem_user_${userId}_jump`)
    .row()
    .text(ctx.t("harem_btn_close"), `harem_user_${userId}_close`);

  await Sendmedia({
    ctx: ctx,
    per: data,
    caption: harem_logo + "\n\n" + pages[0],
    reply_markup: reply_markup,
  });
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

    const { emoji_event: eventEmojis, emoji_raridade: rarityEmojis } = extractListEmojisCharacter(ctx, character);

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
