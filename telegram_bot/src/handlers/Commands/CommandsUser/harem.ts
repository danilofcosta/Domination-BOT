import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { info, warn, error } from "../../../utils/log.js";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";
import { buildButtonHarems } from "../../../utils/buildButtons/generateButtonHarems.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
import { setHarem } from "../../../cache/cache.js";
import {
  haremModeRarity,
  haremModeEvent,
  haremModeLatest,
  haremModeDefault,
} from "./haremModeBuild.js";

const MAX_CAPTION_LEN = 1024;

function getInclude(isHusbando: boolean) {
  const select = {
    id: true,
    name: true,
    origem: true,
    sourceType: true,
    media: true,
    mediaType: true,
  } as const;

  if (isHusbando) {
    return {
      Character: {
        select: {
          ...select,
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
    Character: {
      select: {
        ...select,
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
// force_open e quando o harem é aberto forçado um um adm do bot
export async function HaremHandler(ctx: MyContext, force_open?: number) {
  info("HaremHandler - carregando harém", {
    userId: ctx.from?.id,
    genero: ctx.botType,
  });

  const targetId = force_open ?? Number(ctx.from?.id);
  const isHusbando = ctx.botType === ChatType.HUSBANDO;

  const [user, collection] = await Promise.all([
    prisma.telegramUser.findUnique({
      where: { telegramId: targetId },
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
          where: { userId: BigInt(targetId) },
          include: getInclude(isHusbando),
        })
      : prisma.waifuCollection.findMany({
          where: { userId: BigInt(targetId) },
          include: getInclude(isHusbando),
        }),
  ]);

  if (!user) {
    warn("HaremHandler - usuário não encontrado", { userId: ctx.from?.id });
    return sendMessageCustom({ ctx, caption: ctx.t("harem_no_user") });
  }

  const config = (
    isHusbando ? user.husbandoConfig : user.waifuConfig
  ) as Record<string, any> | null;
  const mode = (config?.haremMode as string) || "default";

  const favoriteChar = isHusbando
    ? user.CharacterHusbando
    : user.CharacterWaifu;
  const name = (user.telegramData as any)?.first_name || "user";
  const mention = createMentionUser({ Nome: name, telegramiduser: targetId });
  const harem_logo = ctx.t("harem_logo", { usermention: mention });

  const maxPageLen = MAX_CAPTION_LEN - harem_logo.length - 4;

  let pages: string[];
  if (mode === "rarity") {
    pages = haremModeRarity(collection, ctx, maxPageLen);
  } else if (mode === "event") {
    pages = haremModeEvent(collection, ctx, maxPageLen);
  } else if (mode === "latest") {
    pages = haremModeLatest(collection, ctx, maxPageLen);
  } else {
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
    pages = haremModeDefault(collection, ctx, dbAnimeCounts, maxPageLen);
  }

  info("HaremHandler - páginas geradas", {
    userId: ctx.from?.id,
    pageCount: pages.length,
  });

  setHarem(force_open ?? ctx.from?.id ?? 0, { pages, forceopen: !!force_open });

  const reply_markup = buildButtonHarems({
    ctx,
    current_page: 0,
    total_page: pages.length,
    userId:force_open ||  ctx.from?.id || 0,
    btn_delete: !!force_open,
  });

  const caption = `${harem_logo}\n\n${pages[0]}`;

  if (caption.length >= MAX_CAPTION_LEN || !favoriteChar) {
    try {
      await sendMessageCustom({ ctx, caption, reply_markup });
    } catch (e) {
      error("HaremHandler - erro ao enviar texto", e);
    }
    return;
  }

  try {
    await sendMessageCustom({
      ctx,
      character: favoriteChar,
      caption,
      reply_markup,
    });
  } catch (e) {
    error("HaremHandler - erro ao enviar mídia", e);
  }
}
