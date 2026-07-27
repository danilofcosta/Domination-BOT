import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { debug, error, info, warn } from "../../../uteis/log.js";
import { rankingCache, getOrSet } from "../../../cache/cache.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { CreateMentionUser } from "../../../uteis/uteis_telegram/CreateMentionUser.js";
import { getLatestCharacter } from "../../../uteis/extras/getLatestCharacter.js";
import { InlineKeyboard } from "grammy";
import type { title } from "node:process";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";

export type RankingItem = {
  userId: bigint;
  _count: { characterId: number };
};

 export async function buildTopMessage(ctx: MyContext, ranking: RankingItem[], headerKey: string) {
  const userIds = ranking.map((r) => r.userId);
  const users = await prisma.telegramUser.findMany({
    where: { telegramId: { in: userIds } },
    select: { telegramId: true, telegramData: true },
  });

  const userMap = new Map<number, Record<string, unknown>>(
    users.map((u: { telegramId: bigint; telegramData: unknown }) => [
      Number(u.telegramId),
      (u.telegramData ?? {}) as Record<string, unknown>,
    ]),
  );

  const top_separator = ctx.t("top_separator");
  const topUsers: string[] = ranking.map((item, index: number) => {
    const userData = userMap.get(Number(item.userId)) ?? {};
    const name =
      (userData.first_name as string) ||
      (userData.username as string) ||
      "user";
    const mention = CreateMentionUser({
      Nome: name,
      telegramiduser: Number(item.userId),
    });
    return ` ${index + 1}. ${mention} ${top_separator} <code> ${item._count.characterId}</code>`;
  });

  return [
  headerKey ==='top_header_chat'? ctx.t(headerKey, { namegroup: ctx.chat?.title ?? "" })
: ctx.t(headerKey, { Logo_bt: ctx.t("Logo_bt") }),
    ctx.t("top_init_list"),
    ...topUsers,
    ctx.t("top_end_list"),
  ].join("\n");
}

// cria um 10 top global com o Raking baseado na quantidade de dados na coleção do Usuario (waifu ou husbando)
export async function topHandler(ctx: MyContext) {
  const isHusbando = ctx.botType === ChatType.HUSBANDO;
  info(`topHandler - carregando ranking`, {
    userId: ctx.from?.id,
    genero: ctx.botType,
  });

  const cacheKey = `top:${isHusbando ? "husbando" : "waifu"}`;

  const ranking = (await getOrSet<any>(rankingCache, cacheKey, () =>
    isHusbando
      ? prisma.husbandoCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          orderBy: { _count: { characterId: "desc" } },
          take: 10,
        })
      : prisma.waifuCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          orderBy: { _count: { characterId: "desc" } },
          take: 10,
        }),
  )) as RankingItem[];

  if (!ranking.length) {
    warn(`topHandler - ranking vazio`, { userId: ctx.from?.id });
    return SendMensageCustom({ ctx, caption: ctx.t("top-empty") });
  }

  debug(`topHandler - usuários no ranking`, { count: ranking.length });

  const text = await buildTopMessage(ctx, ranking, "top_header_global");

  const reply_markup = new InlineKeyboard()
    .text(ctx.t("top_user_btn_my_position"), "topuser_position_global")
    .row()
    .text(ctx.t("top_user_btn_chat"), "topuser_chat")
    .row()
    .text(ctx.t("top_btn_close"), "topuser_close");

  const character = await getLatestCharacter(ctx.botType);

  if (character) {
    try {
      return SendMensageCustom({
        ctx,
        character: character,
        caption: text,
        reply_markup: reply_markup,
      });
    } catch (e) {
      error(`topHandler - erro ao enviar mídia`, e);
      return SendMensageCustom({
        ctx,
        caption: ctx.t("top-empty"),
      });
    }
  }

  return SendMensageCustom({
    ctx,
    caption: text,
  });
}

export async function topHandlerChat(ctx: MyContext) {
  if (ctx.chat?.type === "private") {
    return SendMensageCustom({
      ctx,
      caption: ctx.t("top-chat-group-only"),
    });
  }

  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const chatIdBig = BigInt(chatId);
  const isHusbando = ctx.botType === ChatType.HUSBANDO;
  info(`topHandlerChat - carregando ranking do chat`, {
    userId: ctx.from?.id,
    chatId,
    genero: ctx.botType,
  });

  const cacheKey = `topchat:${isHusbando ? "husbando" : "waifu"}:${chatId}`;

  const ranking = (await getOrSet<any>(rankingCache, cacheKey, () =>
    isHusbando
      ? prisma.husbandoCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          where: { fromIdChat: chatIdBig },
          orderBy: { _count: { characterId: "desc" } },
          take: 10,
        })
      : prisma.waifuCollection.groupBy({
          by: ["userId"],
          _count: { characterId: true },
          where: { fromIdChat: chatIdBig },
          orderBy: { _count: { characterId: "desc" } },
          take: 10,
        }),
  )) as RankingItem[];

  if (!ranking.length) {
    warn(`topHandlerChat - ranking vazio`, { userId: ctx.from?.id, chatId });
    return EditOrSendText({ ctx, caption: ctx.t("top-empty") });
  }

  debug(`topHandlerChat - usuários no ranking`, { count: ranking.length, chatId });

  const text = await buildTopMessage(ctx, ranking, "top_header_chat");

  const reply_markup = new InlineKeyboard()
    .text(ctx.t("top_user_btn_my_position"), "topuser_position_chat")
    .row()
    .text(ctx.t("top_user_btn_global"), "topuser_global")
    .row()
    .text(ctx.t("top_btn_close"), "topuser_close");

  const character = await getLatestCharacter(ctx.botType);

  if (character) {
    try {
      return SendMensageCustom({
        ctx,
        character: character,
        caption: text,
        reply_markup: reply_markup,
      });
    } catch (e) {
      error(`topHandlerChat - erro ao enviar mídia`, e);
      return SendMensageCustom({
        ctx,
        caption: ctx.t("top-empty"),
      });
    }
  }

  return SendMensageCustom({
    ctx,
    caption: text,
  });
}
