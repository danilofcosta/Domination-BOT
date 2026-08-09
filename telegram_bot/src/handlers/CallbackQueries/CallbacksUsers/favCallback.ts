import { prisma } from "../../../lib/prisma.js";
import { cleanupCallback } from "../../../utils/telegram/cleanupCallback.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error, info, warn } from "../../../utils/log.js";
import { editOrSendText } from "../../../utils/telegram/editOrSendText.js";

function parseCallbackData(data: string) {
  const match = data.match(/^fav_(yes|no)_(\d+)_(\d+)$/);
  if (!match) return null;
  const [, action, favid, userid] = match;
  return { action, favid: Number(favid), userid: Number(userid) };
}

export async function favCallbackHandler(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const parsed = parseCallbackData(data);
  if (!parsed) return;

  if (ctx.from?.id !== parsed.userid) {
    await ctx.answerCallbackQuery(ctx.t("error-action-not-authorized-by-id"));
    return;
  }

  if (parsed.action === "no") {
    cleanupCallback(ctx);
  }

  const isWaifu = ctx.botType === ChatType.WAIFU;
  const { favid, userid } = parsed;

  info("favCallback - confirmando favorito", {
    userId: userid,
    favId: favid,
    isWaifu,
  });

  try {
    const charExists = isWaifu
      ? await prisma.characterWaifu.findUnique({
          where: { id: favid },
          select: { id: true },
        })
      : await prisma.characterHusbando.findUnique({
          where: { id: favid },
          select: { id: true },
        });

    if (!charExists) {
      warn("favCallback - personagem invalido", { favid });
      await ctx.answerCallbackQuery(ctx.t("error-fav-invalid-char"));
      return;
    }

    await prisma.telegramUser.update({
      where: { telegramId: BigInt(userid) },
      data: isWaifu
        ? { favoriteWaifuId: favid }
        : { favoriteHusbandoId: favid },
    });

    info("favCallback - favorito atualizado", { userId: userid, favid });

    await ctx.answerCallbackQuery(ctx.t("fav-character-success"));

    await editOrSendText({
      ctx,
      caption: ctx.t("fav-character-success"),
      reply_markup: { inline_keyboard: [] },
    });
  } catch (e) {
    error("favCallback - erro ao atualizar favorito", e);
    await ctx.answerCallbackQuery(ctx.t("error-generic"));
  }
}
