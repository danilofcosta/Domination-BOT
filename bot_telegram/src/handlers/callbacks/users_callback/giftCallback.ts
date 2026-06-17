import { prisma } from "../../../lib/prisma.js";
import { getGiftUser } from "../../../cache/cache.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { info, warn, error, debug } from "../../../utils/log.js";
import { mentionUser } from "../../../utils/mention_user.js";

export async function giftConfirmHandler(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const parts = data.split("_");
  const [type, action, giftidRaw, receiverIdRaw, senderIdRaw] = parts;

  const giftid = Number(giftidRaw);
  const receiverId = Number(receiverIdRaw);
  const senderId = Number(senderIdRaw);

  if (ctx.from?.id !== senderId) {
    warn(`giftConfirmHandler - usuário não autorizado`, {
      expected: senderId,
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
  const isWaifu = ctx.botType === ChatType.WAIFU;
  info(`giftConfirmHandler - processando presente`, {
    senderId,
    receiverId,
    giftid,
    isWaifu,
  });

  const charExists = isWaifu
    ? await prisma.characterWaifu.findUnique({ where: { id: giftid }, select: { id: true } })
    : await prisma.characterHusbando.findUnique({ where: { id: giftid }, select: { id: true } });
  if (!charExists) {
    warn(`giftConfirmHandler - personagem ${giftid} não encontrado em ${isWaifu ? "Waifu" : "Husbando"}`, { giftid });
    await ctx.answerCallbackQuery(ctx.t("error-fav-invalid-char"));
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.telegramUser.upsert({
        where: { telegramId: BigInt(receiverId) },
        update: {},
        create: {
          telegramId: BigInt(receiverId),
          telegramData: getGiftUser(receiverId) ?? {},
          favoriteWaifuId: isWaifu ? giftid : null,
          favoriteHusbandoId: !isWaifu ? giftid : null,
        },
      });

      const collection = (
        isWaifu ? tx.waifuCollection : tx.husbandoCollection
      ) as any;

      const senderItem = await collection.findUnique({
        where: {
          userId_characterId: {
            userId: BigInt(senderId),
            characterId: giftid,
          },
        },
        select: { id: true, count: true },
      });

      if (!senderItem) {
        warn(`giftConfirmHandler - sender não possui o personagem ${giftid}`, { senderId, giftid });
        return;
      }

      await collection.upsert({
        where: {
          userId_characterId: {
            userId: BigInt(receiverId),
            characterId: giftid,
          },
        },
        update: {
          count: { increment: 1 },
        },
        create: {
          userId: BigInt(receiverId),
          characterId: giftid,
          count: 1,
        },
      });

      if (senderItem.count > 1) {
        await collection.update({
          where: { id: senderItem.id },
          data: { count: { decrement: 1 } },
        });
      } else {
        await collection.delete({ where: { id: senderItem.id } });
      }
    });

    debug(`giftConfirmHandler - transação concluída`, {
      senderId,
      receiverId,
      giftid,
    });

    const receiverUser = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(receiverId) },
      select: { telegramData: true },
    });

    const telegramData = receiverUser?.telegramData as {
      first_name?: string;
    } | null;
    const receiverUsername =
      telegramData?.first_name || ctx.t("gift-default-username");
    const mention = mentionUser(receiverUsername, receiverId);

    await ctx
      .editMessageCaption({
        caption: ctx.t("gift_success", { user: mention }),
        parse_mode: "HTML",
      })
      .catch(() => {});
  } catch (e) {
    error(`giftConfirmHandler - erro na transação`, e);
  }
}
