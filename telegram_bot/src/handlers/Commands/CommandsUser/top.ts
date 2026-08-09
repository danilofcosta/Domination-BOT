import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { debug, error, info, warn } from "../../../utils/log.js";
import { rankingCache, getOrSet } from "../../../cache/cache.js";
import { sendMessageCustom } from "../../../utils/sendMessageCustom.js";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";
import { getLatestCharacter } from "../../../utils/extras/getLatestCharacter.js";

import { editOrSendText } from "../../../utils/telegram/editOrSendText.js";
import {
  createButtonsTopGlobal,
  createButtonsTopChat,
  createButtonsTopGrupos,
} from "../../../utils/buildButtons/createButtonsTop.js";

export type RankingItem = {
  userId: bigint;
  _count: { characterId: number };
};

export type GruposRankingItem = {
  fromIdChat: bigint;
  _sum: { count: number } | null;
};

export async function getGruposRanking(
  isHusbando: boolean,
): Promise<GruposRankingItem[]> {
  const cacheKey = `topgrupos:${isHusbando ? "husbando" : "waifu"}`;
  return (await getOrSet<any>(rankingCache, cacheKey, () =>
    isHusbando
      ? prisma.husbandoCollection.groupBy({
          by: ["fromIdChat"],
          _sum: { count: true },
          where: { fromIdChat: { not: null } },
          orderBy: { _sum: { count: "desc" } },
          take: 10,
        })
      : prisma.waifuCollection.groupBy({
          by: ["fromIdChat"],
          _sum: { count: true },
          where: { fromIdChat: { not: null } },
          orderBy: { _sum: { count: "desc" } },
          take: 10,
        }),
  )) as GruposRankingItem[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
    const mention = createMentionUser({
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

export async function buildTopGruposMessage(
  ctx: MyContext,
  ranking: GruposRankingItem[],
) {
  const groupIds = ranking.map((r) => r.fromIdChat);
  const groups = await prisma.telegramGroup.findMany({
    where: { groupId: { in: groupIds } },
    select: { groupId: true, groupName: true },
  });

  const groupMap = new Map<number, string>(
    groups.map((g) => [Number(g.groupId), escapeHtml(g.groupName)]),
  );

  const top_separator = ctx.t("top_separator");
  const topGroups: string[] = ranking.map((item, index: number) => {
    const name = groupMap.get(Number(item.fromIdChat)) ?? "grupo";
    return ` ${index + 1}. <b>${name}</b> ${top_separator} <code> ${item._sum?.count ?? 0}</code>`;
  });

  return [
    ctx.t("top_header_grupos"),
    ctx.t("top_init_list"),
    ...topGroups,
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
    return sendMessageCustom({ ctx, caption: ctx.t("top-empty") });
  }

  debug(`topHandler - usuários no ranking`, { count: ranking.length });

  const text = await buildTopMessage(ctx, ranking, "top_header_global");

  const reply_markup = createButtonsTopGlobal(ctx);

  const character = await getLatestCharacter(ctx.botType);

  if (character) {
    try {
      return sendMessageCustom({
        ctx,
        character: character,
        caption: text,
        reply_markup: reply_markup,
      });
    } catch (e) {
      error(`topHandler - erro ao enviar mídia`, e);
      return sendMessageCustom({
        ctx,
        caption: ctx.t("top-empty"),
      });
    }
  }

  return sendMessageCustom({
    ctx,
    caption: text,
  });
}

export async function topGruposHandler(ctx: MyContext) {
  const isHusbando = ctx.botType === ChatType.HUSBANDO;
  info(`topGrupos - carregando ranking de grupos`, {
    userId: ctx.from?.id,
    genero: ctx.botType,
  });

  const ranking = await getGruposRanking(isHusbando);

  if (!ranking.length) {
    warn(`topGrupos - ranking vazio`, { userId: ctx.from?.id });
    return sendMessageCustom({ ctx, caption: ctx.t("top_grupos_empty") });
  }

  debug(`topGrupos - grupos no ranking`, { count: ranking.length });

  const text = await buildTopGruposMessage(ctx, ranking);

  const reply_markup = createButtonsTopGrupos(ctx);

  const character = await getLatestCharacter(ctx.botType);

  if (character) {
    try {
      return sendMessageCustom({
        ctx,
        character: character,
        caption: text,
        reply_markup: reply_markup,
      });
    } catch (e) {
      error(`topGrupos - erro ao enviar mídia`, e);
    }
  }

  return sendMessageCustom({
    ctx,
    caption: text,
    reply_markup: reply_markup,
  });
}

export async function topHandlerChat(ctx: MyContext) {
  if (ctx.chat?.type === "private") {
    return sendMessageCustom({
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
    return editOrSendText({ ctx, caption: ctx.t("top-empty") });
  }

  debug(`topHandlerChat - usuários no ranking`, { count: ranking.length, chatId });

  const text = await buildTopMessage(ctx, ranking, "top_header_chat");

  const reply_markup = createButtonsTopChat(ctx);

  const character = await getLatestCharacter(ctx.botType);

  if (character) {
    try {
      return sendMessageCustom({
        ctx,
        character: character,
        caption: text,
        reply_markup: reply_markup,
      });
    } catch (e) {
      error(`topHandlerChat - erro ao enviar mídia`, e);
      return sendMessageCustom({
        ctx,
        caption: ctx.t("top-empty"),
      });
    }
  }

  return sendMessageCustom({
    ctx,
    caption: text,
  });
}
