import { prisma } from "../../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { create_caption } from "../../../utils/manege_caption/create_caption.js";
import { info, warn, error, debug } from "../../../utils/log.js";

export async function favConfirmHandler(ctx: MyContext) {
  const [_, action, favid, userid] = ctx.match
    ? (ctx.match as any).input.split("_")
    : [];

  if (ctx.from?.id !== Number(userid)) {
    warn(`favConfirmHandler - usuário não autorizado`, {
      expected: userid,
      actual: ctx.from?.id,
    });
    await ctx.answerCallbackQuery(
      ctx.t("error-action-not-autoauthorized-by-id"),
    );
    return;
  }

  if (action === "no") {
    await ctx.deleteMessage().catch(() => {});
    return;
  }

  const isWaifu = ctx.session.settings.genero === ChatType.WAIFU;
  const favId = Number(favid);
  const userId = BigInt(userid);

  info(`favConfirmHandler - confirmando favorito`, { userId, favId, isWaifu });

  const character = isWaifu
    ? await prisma.characterWaifu.findUnique({ where: { id: favId } })
    : await prisma.characterHusbando.findUnique({ where: { id: favId } });

  if (!character) {
    warn(`favConfirmHandler - personagem inválido`, { favId });
    return ctx.answerCallbackQuery({
      text: "Personagem inválido.",
      show_alert: true,
    });
  }

  const collection = isWaifu
    ? await prisma.waifuCollection.findUnique({
        where: {
          userId_characterId: {
            userId,
            characterId: favId,
          },
        },
      })
    : await prisma.husbandoCollection.findUnique({
        where: {
          userId_characterId: {
            userId,
            characterId: favId,
          },
        },
      });

  if (!collection) {
    warn(`favConfirmHandler - usuário não possui personagem`, {
      userId,
      favId,
    });
    return ctx.answerCallbackQuery({
      text: "usuário não possui personagem",
      show_alert: true,
    });
  }

  await prisma.user.update({
    where: { telegramId: userId },
    data: {
      favoriteWaifuId: isWaifu ? favId : null,
      favoriteHusbandoId: !isWaifu ? favId : null,
    },
  });

  debug(`favConfirmHandler - favorito atualizado no banco`, { userId, favId });

  await ctx.answerCallbackQuery({
    text: ctx.t("fav-character-success"),
  });

  const capiton = create_caption({
    ctx: ctx,
    character: character,
    chatType: ctx.session.settings.genero,
    noformat: false,
  });

  try {
    await ctx.editMessageCaption({
      caption: `${capiton}\n\n${ctx.t("fav-character-success")} \n\n confira seu Harem /my${isWaifu ? "waifu" : "husbando"}s`,
      parse_mode: "HTML",
    });
  } catch (e) {
    error(`favConfirmHandler - erro ao editar caption`, e);
  }
}
