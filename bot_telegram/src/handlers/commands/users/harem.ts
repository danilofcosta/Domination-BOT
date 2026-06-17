import { InlineKeyboard } from "grammy";
import { prisma } from "../../../lib/prisma.js";
import {
  ChatType,
  ProfileType,
  type MyContext,
} from "../../../utils/customTypes.js";
import { Sendmedia } from "../../../utils/sendmedia.js";
import { setHarem } from "../../../cache/cache.js";
import { mentionUser } from "../../../utils/mention_user.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import {
  Harem_mode_rarity,
  Harem_mode_event,
  Harem_mode_latest,
  Harem_mode_default,
} from "./harem_mode_build.js";
import { Build_btn_harem } from "../../../utils/btns.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";

function getCollectionInclude(isHusbando: boolean) {
  if (isHusbando) {
    return {
      CharacterHusbando: {
        select: {
          id: true,
          name: true,
          origem: true,
          sourceType: true,
          media: true,
          mediaType: true,
          HusbandoEvent: {
            select: {
              Event: { select: { id: true, name: true, emoji: true } },
            },
          },
          HusbandoRarity: {
            select: {
              Rarity: { select: { id: true, name: true, emoji: true } },
            },
          },
        },
      },
    };
  }
  return {
    CharacterWaifu: {
      select: {
        id: true,
        name: true,
        origem: true,
        sourceType: true,
        media: true,
        mediaType: true,
        WaifuEvent: {
          select: { Event: { select: { id: true, name: true, emoji: true } } },
        },
        WaifuRarity: {
          select: { Rarity: { select: { id: true, name: true, emoji: true } } },
        },
      },
    },
  };
}

export async function HaremHandler(ctx: MyContext, userId?: number) {
  info(`HaremHandler - carregando harém`, {
    userId: ctx.from?.id,
    genero: ctx.botType,
  });
  const telegramId = userId ? userId : Number(ctx.from?.id);

  const isHusbando = ctx.botType === ChatType.HUSBANDO;

  const [user, collection] = await Promise.all([
    prisma.telegramUser.findUnique({
      where: { telegramId },
      select: {
        husbandoConfig: true,
        waifuConfig: true,
        favoriteWaifuId: true,
        favoriteHusbandoId: true,
        telegramData: true,
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
  const collectionData = collection;

  let pages: string[] = [];
  if (mode === "rarity") {
    pages = Harem_mode_rarity(collectionData || [], ctx);
  } else if (mode === "event") {
    pages = Harem_mode_event(collectionData || [], ctx);
  } else if (mode === "latest") {
    pages = Harem_mode_latest(collectionData || [], ctx);
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
    pages = Harem_mode_default(collectionData || [], ctx, dbAnimeCounts);
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
        `<b>${(user?.telegramData as any)?.first_name || "user"}</b>`,
        (user?.telegramData as any)?.id || 0,
      ) || "User",
  });

  const callerRole = await getUserRole(ctx.from?.id ?? 0);
  const canDelete =
    roleWeights[callerRole] >= roleWeights[ProfileType.SUPER_ADMIN];

  const reply_markup = Build_btn_harem({
    ctx: ctx,
    current_page: 0,
    total_page: pages.length,
    userId: ctx.from?.id || 0,
    isadmin: userId ? true : false,
    canDelete,
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
