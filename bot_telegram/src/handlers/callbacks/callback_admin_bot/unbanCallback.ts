import { prisma } from "../../../lib/prisma.js";
import { ProfileType, type MyContext } from "../../../utils/customTypes.js";
import { info, warn, error } from "../../../utils/log.js";
import { getUserRole, roleWeights } from "../../../utils/permissions.js";
import { CreateOneBtn } from "../../../utils/btns.js";
import { mentionUser } from "../../../utils/mention_user.js";
import { permissionCache } from "../../../cache/cache.js";

export async function unbanCallback(ctx: MyContext) {
  if (!ctx.match) return;

  const targetId = Number(ctx.match[1]);
  if (!targetId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(targetId) },
      select: { id: true, profileType: true, telegramData: true },
    });

    if (!user) {
      await ctx.answerCallbackQuery({ text: ctx.t("banuser-not-found") });
      return;
    }

    if (user.profileType !== ProfileType.BANNED) {
      await ctx.answerCallbackQuery({ text: "Usuário não está banido." });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { profileType: ProfileType.USER },
    });

    permissionCache.delete(String(targetId));

    info("unbanCallback - usuário desbanido", { adminId: ctx.from?.id, targetId });

    const data = user.telegramData as Record<string, any> | null;
    const name = data?.first_name || targetId.toString();

    await ctx.editMessageText(
      `${mentionUser(name, targetId)} <code>${targetId} ${ProfileType.USER}</code>`,
      {
        reply_markup: CreateOneBtn({
          text: ctx.t("maneger-user-ban-btn"),
          callback: `maneger_user_ban-${targetId}`,
        }),
      }
    );

    await ctx.answerCallbackQuery();
  } catch (e) {
    error("unbanCallback - erro", e);
    await ctx.answerCallbackQuery({ text: ctx.t("banuser-unban-error") });
  }
}
