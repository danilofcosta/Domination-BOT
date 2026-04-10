import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../utils/customTypes.js";
import { create_caption } from "../../utils/manege_caption/create_caption.js";
export async function favConfirmHandler(ctx: MyContext) {
  const [_, action, favid, userid] = ctx.match
    ? (ctx.match as any).input.split("_")
    : [];

  if (ctx.from?.id !== Number(userid)) {
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

  // validar personagem
  const character = isWaifu
    ? await prisma.characterWaifu.findUnique({ where: { id: favId } })
    : await prisma.characterHusbando.findUnique({ where: { id: favId } });

  if (!character) {
    return ctx.answerCallbackQuery({
      text: "Personagem inválido.",
      show_alert: true,
    });
  }

  // validar posse
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
    return ctx.answerCallbackQuery({
      text: "Você não possui esse personagem.",
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

  await ctx.answerCallbackQuery({
    text: ctx.t("fav-character-success"),
  });
  const capiton = create_caption({
    ctx: ctx,
    character: character,
    chatType: ctx.session.settings.genero,
    noformat: false,
  });
  await ctx.editMessageCaption({
    caption: `${capiton}\n\n${ctx.t("fav-character-success")} \n\n confira seu Harem /my${isWaifu ? "waifu" : "husbando"}s`,
    parse_mode: "HTML",
  });
}
