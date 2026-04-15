import { prisma } from "../../../lib/prisma.js";
import { getGiftUser } from "../../cache/cache.js";
import { ChatType, type MyContext } from "../../utils/customTypes.js";
import { info, warn, error, debug } from "../../utils/log.js";

export async function giftConfirmHandler(ctx: MyContext) {
  const parts = ctx.match ? (ctx.match as any).input.split("_") : [];

  const [type, action, giftidRaw, receiverIdRaw, senderIdRaw] = parts;

  const giftid = Number(giftidRaw);
  const receiverId = Number(receiverIdRaw);
  const senderId = Number(senderIdRaw);

  if (ctx.from?.id !== senderId) {
    warn(`giftConfirmHandler - usuário não autorizado`, { expected: senderId, actual: ctx.from?.id });
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
  info(`giftConfirmHandler - processando presente`, { senderId, receiverId, giftid, isWaifu });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
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

      const senderItem = await collection.findUnique({
        where: {
          userId_characterId: {
            userId: BigInt(senderId),
            characterId: giftid,
          },
        },
      });

      if (!senderItem) return;

      if (senderItem.count > 1) {
        await collection.update({
          where: {
            userId_characterId: {
              userId: BigInt(senderId),
              characterId: giftid,
            },
          },
          data: {
            count: { decrement: 1 },
          },
        });
      } else {
        await collection.delete({
          where: {
            userId_characterId: {
              userId: BigInt(senderId),
              characterId: giftid,
            },
          },
        });
      }
    });

    debug(`giftConfirmHandler - transação concluída`, { senderId, receiverId, giftid });
  } catch (e) {
    error(`giftConfirmHandler - erro na transação`, e);
  }

  await ctx
    .editMessageCaption({
      caption: ctx.t("gift_success"),
    })
    .catch(() => {});
}
