import { InlineKeyboard } from "grammy";
import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { debug, info, warn } from "../../../uteis/log.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import {
  buildTopMessage,
  buildTopGruposMessage,
  getGruposRanking,
  type RankingItem,
} from "../../Commands/CommandsUser/top.js";
import { getOrSet, rankingCache } from "../../../cache/cache.js";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";
import {
  createButtonsTopGlobal,
  createButtonsTopChat,
  createButtonsTopGrupos,
} from "../../../uteis/buildButtons/createButtonsTop.js";

export async function TopCallbackQuery(ctx: MyContext) {
  const parts = ctx.match ? (ctx.match as any).input.split("_") : [];
  const [, action] = parts;
  const chatId = ctx.chat?.id;
  if (action === "chat") {
        const reply_markup = createButtonsTopChat(ctx);
    if (!chatId) return ctx.answerCallbackQuery({ text: ctx.t("top-empty"), show_alert: true });

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
      return EditOrSendText({ ctx, caption: ctx.t("top-empty"), reply_markup: reply_markup });
    }

    debug(`topHandlerChat - usuários no ranking`, { count: ranking.length, chatId });

    const text = await buildTopMessage(ctx, ranking, "top_header_chat");



    await EditOrSendText({
      ctx, caption: text, reply_markup: reply_markup
    })
  }


  if (action === "global") {
    const isHusbando = ctx.botType === ChatType.HUSBANDO;
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

    const reply_markup = createButtonsTopGlobal(ctx);

    await EditOrSendText(
      { ctx, caption: text, reply_markup: reply_markup }
    )



  }

  if (action === "grupos") {
    const isHusbando = ctx.botType === ChatType.HUSBANDO;
    info(`topGrupos - carregando ranking de grupos`, {
      userId: ctx.from?.id,
      genero: ctx.botType,
    });

    const ranking = await getGruposRanking(isHusbando);

    if (!ranking.length) {
      warn(`topGrupos - ranking vazio`, { userId: ctx.from?.id });
      return EditOrSendText({
        ctx,
        caption: ctx.t("top_grupos_empty"),
        reply_markup: createButtonsTopGrupos(ctx),
      });
    }

    debug(`topGrupos - grupos no ranking`, { count: ranking.length });

    const text = await buildTopGruposMessage(ctx, ranking);

    await EditOrSendText({
      ctx,
      caption: text,
      reply_markup: createButtonsTopGrupos(ctx),
    });
  }

  if (action === "position") {
    const userId = ctx.from?.id;
    const isHusbando = ctx.botType === ChatType.HUSBANDO;
    const isChat = parts[2] === "chat";
    const isGrupos = parts[2] === "grupos";

    if (isGrupos) {
      if (ctx.chat?.type === "private") {
        return ctx.answerCallbackQuery({
          text: ctx.t("top-chat-group-only"),
          show_alert: true,
        });
      }

      const chatIdGrupos = ctx.chat?.id;
      if (!chatIdGrupos) {
        return ctx.answerCallbackQuery({
          text: ctx.t("top_grupos_empty"),
          show_alert: true,
        });
      }

      const rankingGrupos = await getGruposRanking(isHusbando);

      const position = rankingGrupos.findIndex(
        (r) => Number(r.fromIdChat) === chatIdGrupos,
      );

      if (position === -1) {
        return ctx.answerCallbackQuery({
          text: ctx.t("top_user_not_ranked_grupos", {
            chat_title: ctx.chat?.title ?? "",
          }),
          show_alert: true,
        });
      }

      return ctx.answerCallbackQuery({
        text: ctx.t("top_user_position_grupos", {
          chat_title: ctx.chat?.title ?? "",
          position: String(position + 1),
          total: String(rankingGrupos.length),
        }),
        show_alert: true,
      });
    }

    let ranking: RankingItem[];

    if (isChat) {
      if (ctx.chat?.type === "private") {
        return ctx.answerCallbackQuery({
          text: ctx.t("top-chat-group-only"),
          show_alert: true,
        });
      }

      const chatIdPos = ctx.chat?.id;
      if (!chatIdPos) return ctx.answerCallbackQuery({ text: ctx.t("top-empty"), show_alert: true });

      const chatIdBig = BigInt(chatIdPos);
      const cacheKey = `topchat:${isHusbando ? "husbando" : "waifu"}:${chatIdPos}`;

      ranking = (await getOrSet<any>(rankingCache, cacheKey, () =>
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
    } else {
      const cacheKey = `top:${isHusbando ? "husbando" : "waifu"}`;

      ranking = (await getOrSet<any>(rankingCache, cacheKey, () =>
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
    }

    const position = ranking.findIndex((r) => Number(r.userId) === userId);

    if (position === -1) {
      return ctx.answerCallbackQuery({
        text:!isChat? ctx.t("top_user_not_ranked"):ctx.t("top_user_not_ranked_chat",{chat_title:ctx.chat?.title ??''}),
        show_alert: true,
      });
    }

    return ctx.answerCallbackQuery({
      text: ctx.t("top_user_position_user", {
        position: String(position + 1),
        total: String(ranking.length),
      }),
      show_alert: true,
    });
  }

  if (action === "close") {
    try {
      ctx.deleteMessage();
    } catch {
      return;
    }
  }
}
