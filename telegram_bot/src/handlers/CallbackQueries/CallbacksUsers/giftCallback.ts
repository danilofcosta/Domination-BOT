import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { error, info, warn } from "../../../utils/log.js";
import { createMentionUser } from "../../../utils/telegram/createMentionUser.js";
import { editOrSendText } from "../../../utils/telegram/editOrSendText.js";
import { createCaption } from "../../../utils/buildCaption/createCaption.js";
import { getCharacterById } from "../../../utils/extras/getCharacterById.js";
import { cleanupCallback } from "../../../utils/telegram/cleanupCallback.js";

function parseCallbackData(data: string) {
  const single = data.match(/^gift_(yes|no)_(\d+)_(\d+)_(\d+)$/);
  if (single) {
    const [, action, giftid, receiverId, senderId] = single;
    return {
      mode: "single" as const,
      action,
      giftid: Number(giftid),
      receiverId: Number(receiverId),
      senderId: Number(senderId),
    };
  }

  const multi = data.match(/^gift_(yes|no)_multi_(\w+)_(\d+)_(\d+)$/);
  if (multi) {
    const [, action, cacheKey, receiverId, senderId] = multi;
    return {
      mode: "multi" as const,
      action,
      cacheKey,
      receiverId: Number(receiverId),
      senderId: Number(senderId),
    };
  }

  const fullharem = data.match(/^gift_(yes|no)_fullharem_(\d+)_(\d+)$/);
  if (fullharem) {
    const [, action, receiverId, senderId] = fullharem;
    return {
      mode: "fullharem" as const,
      action,
      receiverId: Number(receiverId),
      senderId: Number(senderId),
    };
  }

  return null;
}

export async function giftCallbackHandler(ctx: MyContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const parsed = parseCallbackData(data);
  if (!parsed) return;

  if (ctx.from?.id !== parsed.senderId) {
    await ctx.answerCallbackQuery(ctx.t("error-action-not-authorized-by-id"));
    return;
  }

  const { action, receiverId } = parsed;

  if (action === "no") {
    cleanupCallback(ctx);
  }

  const isWaifu = ctx.botType === ChatType.WAIFU;

  info("giftCallback - processando presente", {
    senderId: parsed.senderId,
    receiverId,
    mode: parsed.mode,
  });

  try {
    if (parsed.mode === "single") {
      const { giftid } = parsed;

      const charExists = isWaifu
        ? await prisma.characterWaifu.findUnique({
            where: { id: giftid },
            select: { id: true, name: true },
          })
        : await prisma.characterHusbando.findUnique({
            where: { id: giftid },
            select: { id: true, name: true },
          });

      if (!charExists) {
        await ctx.answerCallbackQuery(ctx.t("error-fav-invalid-char"));
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.telegramUser.upsert({
          where: { telegramId: BigInt(receiverId) },
          update: {},
          create: {
            telegramId: BigInt(receiverId),
            telegramData: {},
          },
        });

        const collection = (
          isWaifu ? tx.waifuCollection : tx.husbandoCollection
        ) as any;

        const senderItem = await collection.findUnique({
          where: {
            userId_characterId: {
              userId: BigInt(parsed.senderId),
              characterId: giftid,
            },
          },
          select: { id: true, count: true },
        });

        if (!senderItem) {
          warn("giftCallback - sender nao possui o personagem", {
            senderId: parsed.senderId,
            giftid,
          });
          return;
        }

        await collection.upsert({
          where: {
            userId_characterId: {
              userId: BigInt(receiverId),
              characterId: giftid,
            },
          },
          update: { count: { increment: 1 } },
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

      const senderMention = createMentionUser({
        Nome: ctx.from!.first_name,
        telegramiduser: parsed.senderId,
      });

      const receiverUser = await prisma.telegramUser.findUnique({
        where: { telegramId: BigInt(receiverId) },
        select: { telegramData: true },
      });

      const receiverName =
        (receiverUser?.telegramData as any)?.first_name ||
        ctx.from?.first_name ||
        ctx.t("gift-default-username");

      const receiverMention = createMentionUser({
        Nome: receiverName,
        telegramiduser: receiverId,
      });

      const characterData = await getCharacterById(ctx.botType, giftid);

      const characterCaption = createCaption({
        t: ctx.t,
        chatType: ctx.botType,
        character: characterData,
        rawEmoji: false,
      });

      const text = [
        ctx.t("gift_success", {
          sender: senderMention,
          name: charExists.name,
          receiver: receiverMention,
        }),
        characterCaption,
      ].join("\n\n");

      await editOrSendText({
        ctx,
        caption: text,
        reply_markup: { inline_keyboard: [] },
      });
    }

    if (parsed.mode === "multi") {
      await ctx.answerCallbackQuery(ctx.t("error-not-implemented"));
    }

    if (parsed.mode === "fullharem") {
      await ctx.answerCallbackQuery(ctx.t("error-not-implemented"));
    }
  } catch (e) {
    error("giftCallback - erro na transacao", e);
    await ctx.answerCallbackQuery(ctx.t("error-generic"));
  }
}
