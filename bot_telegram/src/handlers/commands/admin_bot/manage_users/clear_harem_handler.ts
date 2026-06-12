import { prisma } from "../../../../lib/prisma.js";
import { ProfileType, type MyContext } from "../../../../utils/customTypes.js";
import { info, warn, error } from "../../../../utils/log.js";
import { getUserRole, roleWeights } from "../../../../utils/permissions.js";
import { Extract_id_user } from "../../../../utils/extract_id_user.js";
import { Sendmedia } from "../../../../utils/sendmedia.js";
import { bts_yes_or_no } from "../../../../utils/btns.js";
import { setHarem } from "../../../../cache/cache.js";

export async function clearHaremHandler(ctx: MyContext) {
  const result = await Extract_id_user(ctx);

  if (!result?.id) {
    return await Sendmedia({
      ctx,
      caption: ctx.t("clearharem_usage"),
    });
  }

  const targetRole = await getUserRole(result.id);
  if (roleWeights[targetRole] >= roleWeights[ProfileType.SUPER_ADMIN]) {
    warn("clearHaremHandler - tentativa de limpar harem de admin", {
      adminId: ctx.from?.id,
      targetId: result.id,
      targetRole,
    });
    await Sendmedia({ ctx, caption: ctx.t("clearharem_cannot_admin") });
    return;
  }

  info("clearHaremHandler - confirmacao", { adminId: ctx.from?.id, targetId: result.id });

  return await ctx.reply(ctx.t("clearharem_confirm"), {
    reply_markup: bts_yes_or_no(
      ctx,
      `clearharem_${result.id}_yes`,
      `clearharem_${result.id}_no`,
      ctx.t("clearharem_yes"),
      ctx.t("clearharem_no"),
    ),
  });
}

export async function clearHaremCallback(ctx: MyContext) {
  const [_, userIdStr, action] = ctx.match
    ? (ctx.match as any).input.split("_")
    : [];
  const userId = Number(userIdStr);

  if (!userId || isNaN(userId)) {
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === "no") {
    await ctx.deleteMessage().catch(() => {});
    await ctx.answerCallbackQuery();
    return;
  }

  if (action === "yes") {
    const targetRole = await getUserRole(userId);
    if (roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN]) {
      await ctx.deleteMessage().catch(() => {});
      await ctx.reply(ctx.t("clearharem_cannot_admin"));
      await ctx.answerCallbackQuery();
      return;
    }

    await prisma.$transaction([
      prisma.husbandoCollection.deleteMany({ where: { userId: BigInt(userId) } }),
      prisma.waifuCollection.deleteMany({ where: { userId: BigInt(userId) } }),
    ]);

    setHarem(userId, null);

    await ctx.deleteMessage().catch(() => {});
    await ctx.reply(ctx.t("clearharem_success"));
    await ctx.answerCallbackQuery();
  }
}
