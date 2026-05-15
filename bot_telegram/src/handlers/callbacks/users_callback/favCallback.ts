import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { create_caption } from "../../../utils/manege_caption/create_caption.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import { EditOrSendText } from "../../../utils/EditOrSendText.js";
import { findCollectionWithIncludes } from "../../../utils/collectionUtils.js";

export async function favConfirmHandler(ctx: MyContext) {
  const [_, action, favid, userid] = ctx.match
    ? (ctx.match as any).input.split("_")
    : [];

  if (ctx.from?.id !== Number(userid)) {
    warn(`favConfirmHandler - usuário não autorizado`, {
      expected: userid,
      actual: ctx.from?.id,
    });
    await ctx.answerCallbackQuery(ctx.t("error-action-not-authorized-by-id"));
    return;
  }

  if (action === "no") {
    const cq = ctx.callbackQuery;

    if (cq?.message) {
      await ctx.deleteMessage().catch(() => {});
      return;
    }

    if (cq?.inline_message_id) {
      await ctx
        .editMessageReplyMarkup({
          reply_markup: { inline_keyboard: [] },
        })
        .catch(() => {});
      return;
    }

    return;
  }

  const isWaifu = process.env.TYPE_BOT === ChatType.WAIFU;
  const favId = Number(favid);
  const userId = Number(userid);

  info(`favConfirmHandler - confirmando favorito`, { userId, favId, isWaifu });

  const collection = await findCollectionWithIncludes({
    isWaifu,
    userId,
    characterId: favId,
  });

  if (!collection) {
    warn(`favConfirmHandler - usuário não possui personagem`, {
      userId,
      favId,
    });
    return ctx.answerCallbackQuery({
      text: ctx.t("error-fav-not-owned"),
      show_alert: true,
    });
  }

  if (!collection.Character) {
    warn(`favConfirmHandler - personagem inválido`, { favId });
    return ctx.answerCallbackQuery({
      text: ctx.t("error-fav-invalid-char"),
      show_alert: true,
    });
  }
// se waifu atualiza waifu caso n husbando
  if (isWaifu) {
    await prisma.user.update({
      where: { telegramId: userId },
      data: {
        favoriteWaifuId: favId,
      },
    });
  }
  if (!isWaifu) {
    await prisma.user.update({
      where: { telegramId: userId },
      data: {
        favoriteHusbandoId: favId,
      },
    });
  }

  debug(`favConfirmHandler - favorito atualizado no banco`, { userId, favId });

  await ctx.answerCallbackQuery({
    text: ctx.t("fav-character-success"),
  });

  const capiton = create_caption({
    ctx: ctx,
    character: collection.Character,
    chatType: ctx.session.settings.genero,
    noformat: false,
  });

  try {
    await EditOrSendText({
      ctx: ctx,
      caption: `${capiton}\n\n${ctx.t("fav-character-success")} ${ctx.t("fav-check-harem", { cmd: "my", genero: isWaifu ? "waifu" : "husbando" })}`,
      reply_markup: null,
    });
  } catch (e) {
    error(`favConfirmHandler - erro ao editar caption`, e);
  }
}
