import { prisma } from "../../../lib/prisma.js";
import { ChatType, type MyContext } from "../../../utils/customTypes.js";
import { reactionCooldown, characterCache } from "../../../cache/cache.js";
import { warn, error } from "../../../utils/log.js";
import { bts_yes_or_no } from "../../../utils/btns.js";

export async function randomCharacterCallback(ctx: MyContext) {
  if (!ctx.from?.id) {
    return;
  }

  const parts = ctx.match ? (ctx.match as any).input.split("-") : [];
  const action = parts[2];
  const charId = Number(parts[3]);
  const userId = Number(ctx.from?.id);

  if (!action || !charId || !userId) {
    warn(`randomCharacterCallback - dados inválidos`, { parts });
    return;
  }

  const cooldownKey = `reaction:${userId}:${charId}:${charId}`;
  if (reactionCooldown.has(cooldownKey)) {
    await ctx.answerCallbackQuery();
    return;
  }

  reactionCooldown.set(cooldownKey, true);

  const isWaifu = ctx.botType === ChatType.WAIFU;

  try {
    if (action === "yes") {
      await prisma.$transaction(async (tx) => {
        const charModel = isWaifu ? tx.characterWaifu : tx.characterHusbando;
        await (charModel as any).update({
          where: { id: charId },
          data: { likes: { increment: 1 } },
        });

        const user = await tx.telegramUser.findUnique({
          where: { telegramId: BigInt(userId) },
          select: { waifuLikes: true, husbandoLikes: true },
        });

        if (user) {
          const likesField = isWaifu ? "waifuLikes" : "husbandoLikes";
          const currentLikes = (user as any)[likesField] as number[] || [];
          if (!currentLikes.includes(charId)) {
            await tx.telegramUser.update({
              where: { telegramId: BigInt(userId) },
              data: { [likesField]: { push: charId } },
            });
          }
        }
      });
    } else if (action === "no") {
      await prisma.$transaction(async (tx) => {
        const charModel = isWaifu ? tx.characterWaifu : tx.characterHusbando;
        await (charModel as any).update({
          where: { id: charId },
          data: { dislikes: { increment: 1 } },
        });

        const user = await tx.telegramUser.findUnique({
          where: { telegramId: BigInt(userId) },
          select: { waifuDislikes: true, husbandoDislikes: true },
        });

        if (user) {
          const dislikesField = isWaifu ? "waifuDislikes" : "husbandoDislikes";
          const currentDislikes = (user as any)[dislikesField] as number[] || [];
          if (!currentDislikes.includes(charId)) {
            await tx.telegramUser.update({
              where: { telegramId: BigInt(userId) },
              data: { [dislikesField]: { push: charId } },
            });
          }
        }
      });
    }

    characterCache.delete(`GetCharacterById:${isWaifu ? ChatType.WAIFU : ChatType.HUSBANDO}:${charId}`);

    const updatedChar = isWaifu
      ? await prisma.characterWaifu.findUnique({ where: { id: charId } })
      : await prisma.characterHusbando.findUnique({ where: { id: charId } });

    if (!updatedChar) return;

    const reply_markup = bts_yes_or_no(
      ctx,
      `random-character-yes-${charId}-${userId}`,
      `random-character-no-${charId}-${userId}`,
      updatedChar.likes.toString(),
      updatedChar.dislikes.toString(),
      "5289772607556568230",
      "5318868949402667784",
    );

    await ctx.editMessageReplyMarkup({ reply_markup }).catch(() => {});
    await ctx.answerCallbackQuery();
  } catch (e) {
    error(`randomCharacterCallback - erro`, e);
    await ctx.answerCallbackQuery();
  }
}
