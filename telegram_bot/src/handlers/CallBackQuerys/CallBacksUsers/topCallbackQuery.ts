import { InlineKeyboard } from "grammy";
import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../uteis/CustomTypes.js";
import { debug, info, warn } from "../../../uteis/log.js";
import { SendMensageCustom } from "../../../uteis/sendMensageCustom.js";
import { buildTopMessage, type RankingItem } from "../../Commands/CommandsUser/top.js";
import { getOrSet, rankingCache } from "../../../cache/cache.js";
import { EditOrSendText } from "../../../uteis/uteis_telegram/EditOrSendText.js";

export async function TopCallbackQuery(ctx: MyContext) {
  const parts = ctx.match ? (ctx.match as any).input.split("_") : [];
  const [, action] = parts;
  const chatId = ctx.chat?.id;
  if (action === "chat") {
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
        return SendMensageCustom({ ctx, caption: ctx.t("top-empty") });
      }
    
      debug(`topHandlerChat - usuários no ranking`, { count: ranking.length, chatId });
    
      const text = await buildTopMessage(ctx, ranking, "top_header_chat");
    
      const reply_markup = new InlineKeyboard()
        .text(ctx.t("top_user_btn_my_position"), "topuser_position_chat")
        .row()
        .text(ctx.t("top_user_btn_global"), "topuser_global")
        .row()
        .text(ctx.t("top_btn_close"), "topuser_close");
    
  await EditOrSendText({
    ctx,caption:text,reply_markup:reply_markup
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

  const reply_markup = new InlineKeyboard()
    .text(ctx.t("top_user_btn_my_position"), "topuser_position_global")
    .row()
    .text(ctx.t("top_user_btn_chat"), "topuser_chat")
    .row()
    .text(ctx.t("top_btn_close"), "topuser_close");

  await EditOrSendText(
    {ctx,caption:text,reply_markup:reply_markup}
  )



    }

  if (action === "position") {
    const userId = ctx.from?.id;
    const isHusbando = ctx.botType === ChatType.HUSBANDO;
    const isChat = parts[2] === "chat";

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
        text: ctx.t("top_user_not_ranked"),
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
