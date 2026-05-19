
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
import { Build_btn_harem } from "../../../utils/btns.js";

function getCollectionInclude(isHusbando: boolean) {
  if (isHusbando) {
    return {
      Character: {
        select: {
          id: true,
          name: true,
          origem: true,
          sourceType: true,
          media: true,
          mediaType: true,
          HusbandoEvent: { select: { Event: { select: { id: true, name: true, emoji: true } } } },
          HusbandoRarity: { select: { Rarity: { select: { id: true, name: true, emoji: true } } } },
        },
      },
    };
  }
  return {
    Character: {
      select: {
        id: true,
        name: true,
        origem: true,
        sourceType: true,
        media: true,
        mediaType: true,
        WaifuEvent: { select: { Event: { select: { id: true, name: true, emoji: true } } } },
        WaifuRarity: { select: { Rarity: { select: { id: true, name: true, emoji: true } } } },
      },
    },
  };
}

export async function HaremHandler(ctx: MyContext, userId?: number) {
  info(`HaremHandler - carregando harém`, {
    userId: ctx.from?.id,
    genero: ctx.session.settings.genero,
  });
  const telegramId = userId ? userId : Number(ctx.from?.id);

  const isHusbando = ctx.session.settings.genero === ChatType.HUSBANDO;

  const [user, collection] = await Promise.all([
    prisma.user.findUnique({
      where: { telegramId },
      select: {
        husbandoConfig: true,
        waifuConfig: true,
        favoriteWaifuId: true,
        favoriteHusbandoId: true,
        CharacterWaifu: {
          select: { id: true, name: true, media: true, mediaType: true },
        },
        CharacterHusbando: {
          select: { id: true, name: true, media: true, mediaType: true },
        },
      },
    }),
    isHusbando
      ? prisma.husbandoCollection.findMany({
          where: { userId: BigInt(telegramId) },
          include: getCollectionInclude(true),
        })
      : prisma.waifuCollection.findMany({
          where: { userId: BigInt(telegramId) },
          include: getCollectionInclude(false),
        }),
  ]);

  if (!user) {
    warn(`HaremHandler - usuário não encontrado`, { userId: ctx.from?.id });
    Sendmedia({
      ctx,
      caption: ctx.t("harem_no_user"),
    });
    return;
  }

  const config = isHusbando
    ? (user.husbandoConfig as any) || {}
    : (user.waifuConfig as any) || {};
  const mode = config.haremMode || "default"; // modo padrão

  const data = isHusbando
    ? (user as any).CharacterHusbando
    : (user as any).CharacterWaifu;
  const colletion = collection;

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

  const reply_markup = Build_btn_harem({
    ctx: ctx,
    current_page: 0,
    total_page: pages.length,
    userId: telegramId,
  });

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
