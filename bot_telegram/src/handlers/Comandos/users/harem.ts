import { InlineKeyboard } from "grammy";
import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { setHarem } from "../../../cache/cache.js";
import { mentionUser } from "../../../utils/metion_user.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import {
  Harem_mode_rarity,
  Harem_mode_event,
  Harem_mode_latest,
  Harem_mode_default,
} from "./harem_mode_build.js";

export async function HaremHandler(ctx: MyContext) {
  info(`HaremHandler - carregando harém`, {
    userId: ctx.from?.id,
    genero: ctx.session.settings.genero,
  });

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
    warn(`HaremHandler - usuário não encontrado`, { userId: ctx.from?.id });
    Sendmedia({
      ctx,
      caption: ctx.t("harem_no_user"),
    });
    return;
  }

  const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;
  const config = isHusbando
    ? (user.husbandoConfig as any) || {}
    : (user.waifuConfig as any) || {};
  const mode = config.haremMode || "default"; // modo padrão

  const data = isHusbando
    ? (user as any).CharacterHusbando
    : (user as any).CharacterWaifu;
  const colletion = isHusbando
    ? (user as any).HusbandoCollection
    : (user as any).WaifuCollection;

  let pages: string[] = [];
  if (mode === "rarity") {
    pages = Harem_mode_rarity(colletion || [], ctx);
  } else if (mode === "event") {
    pages = Harem_mode_event(colletion || [], ctx);
  } else if (mode === "latest") {
    pages = Harem_mode_latest(colletion || [], ctx);
  } else {
    // Modo padrão (Anime grouping)
    const countsData = isHusbando
      ? await prisma.characterHusbando.groupBy({
          by: ["origem"],
          _count: { id: true },
        })
      : await prisma.characterWaifu.groupBy({
          by: ["origem"],
          _count: { id: true },
        });

    const dbAnimeCounts = new Map(
      countsData.map((c) => [c.origem, c._count.id]),
    );
    pages = Harem_mode_default(colletion || [], ctx, dbAnimeCounts);
  }

  debug(`HaremHandler - páginas geradas`, {
    userId: ctx.from?.id,
    pageCount: pages.length,
  });
  // busca no cache
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
    .switchInlineCurrent(
      ctx.t("harem_btn_inline_query"),
      `harem_user_${userId}`,
    )
    .text(ctx.t("harem_btn_fast_page"), `harem_user_${userId}_jump`)
    .row()
    .url(
      ctx.t("harem_btn_web_app"),
      process.env.WEBAPP || `https://t.me/${ctx.me.username}?startgroup=true`,
    )
    .row()
    .text(ctx.t("harem_btn_close"), `harem_user_${userId}_close`);

  try {
    await Sendmedia({
      ctx: ctx,
      per: data,
      caption: harem_logo + "\n\n" + pages[0],
      reply_markup: reply_markup,
    });
  } catch (e) {
    error(`HaremHandler - erro ao enviar mídia`, e);
  }
}
