import { InlineKeyboard } from "grammy";
import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../utils/customTypes.js";
import { ChatType, type Character } from "../../../utils/types.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { setHarem } from "../../../cache/cache.js";
import { mentionUser } from "../../../utils/metion_user.js";
import console from "node:console";
import { extrair_emojis } from "../../inline_query/create_caption.js";

export async function HaremHandler(ctx: MyContext) {
  const user = await prisma.user.findUnique({
    where: {
      telegramId: Number(ctx.from?.id),
    },
    include: {
      favoriteWaifu: {
        include: {
          events: { include: { event: true } },
          rarities: { include: { rarity: true } },
        },
      },
      favoriteHusbando: {
        include: {
          events: { include: { event: true } },
          rarities: { include: { rarity: true } },
        },
      },

      husbandoCollection: {
        include: {
          character: {
            include: {
              events: { include: { event: true } },
              rarities: { include: { rarity: true } },
            },
          },
        },
      },
      waifuCollection: {
        include: {
          character: {
            include: {
              events: { include: { event: true } },
              rarities: { include: { rarity: true } },
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
      ? user.favoriteHusbando
      : user.favoriteWaifu;
  const colletion =
    ctx.session.settings.genero === ChatType.HUSBANDO
      ? user.husbandoCollection
      : user.waifuCollection;
  // console.log(user);
  const pages = Harem_mode_latest(
    colletion.map((char) => char.character) || [],
    ctx,
  );

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

function Harem_mode_latest(list_character: Character[], ctx: MyContext) {
  let pages: string[] = [];
  let perPage: string[] = [];
  let cont = 0;
    const newlist_character = [...list_character].reverse();



  for (const char of newlist_character) {
    const name = char.name;
    const id = char.id;

    const events = (char as any).events ?? [];
    const rarities = (char as any).rarities ?? [];

    const eventEmojis = extrair_emojis(events);
    const rarityEmojis = extrair_emojis(rarities);

    const sourceType = char.sourceType ?? "Unknown";
    const anime = char.origem ?? "Unknown";

    const emojiStr =
      rarityEmojis.length > 1
        ? `[${rarityEmojis.join(", ")}]`
        : (rarityEmojis[0] ?? "");

    const rarityName = rarities?.[0]?.rarity?.name ?? "Unknown";

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

// type GroupedByOrigem = Record<string, RawCharacter[]>;

// export function groupByOrigem(characters: RawCharacter[]): GroupedByOrigem {
//   return characters.reduce<GroupedByOrigem>((acc, char) => {
//     const origem = char.origem ?? "unknown";

//     if (!acc[origem]) {
//       acc[origem] = [];
//     }

//     acc[origem].push(char);

//     return acc;
//   }, {});
// }function Harem_mode_default(list: RawCharacter[]) {
//   const grouped = groupByOrigem(list);

//   const MAX_CAPTION = 900; // limite seguro para caption de foto/video
//   const separator = "✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧✧";

//   const pages: string[] = [];
//   let page = "";

//   for (const [origem, characters] of Object.entries(grouped)) {
//     const header =
//       `☛ ${origem.charAt(0).toUpperCase() + origem.slice(1)} (${characters.length})\n` +
//       `${separator}\n`;

//     if (page.length + header.length > MAX_CAPTION) {
//       pages.push(page);
//       page = "";
//     }

//     page += header;

//     for (const char of characters) {
//       const copies = Number(char.copies);

//       const eventEmoji =
//         char.event_code !== "NONE" ? ` ${char.event_emoji}` : "";

//       const line =
//         `➢ ꙳ ${char.id} ꙳ ${char.rarity_emoji} ꙳ ${char.character_name}${eventEmoji} ${copies}x\n`;

//       if (page.length + line.length > MAX_CAPTION) {
//         page += `${separator}\n`;
//         pages.push(page);
//         page = header;
//       }

//       page += line;
//     }

//     page += `${separator}\n\n`;
//   }

//   if (page.length > 0) {
//     pages.push(page);
//   }

//   return pages;
// }
