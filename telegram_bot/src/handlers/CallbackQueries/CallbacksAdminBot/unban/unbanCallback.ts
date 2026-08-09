import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../utils/customTypes.js";
import { ProfileType } from "../../../../../generated/prisma/client.js";
import {
  getUserRole,
  onlyRoleBotAdmin,
  roleWeights,
} from "../../../../utils/permissions.js";
import { permissionCache } from "../../../../cache/cache.js";
import { editOrSendText } from "../../../../utils/telegram/editOrSendText.js";
import { info, warn, error } from "../../../../utils/log.js";

export async function unbanCallback(ctx: MyContext) {
  await onlyRoleBotAdmin(ProfileType.ADMIN)(ctx, async () => {
    await unbanCallbackService(ctx);
  });
}

async function unbanCallbackService(ctx: MyContext) {
  try {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    const match = data.match(/^unban_(yes|no)_(-?\d+)_(-?\d+)$/);
    if (!match) {
      await ctx.answerCallbackQuery();
      return;
    }

    const action = match[1]!;
    const targetId = Number(match[2]!);
    const executorId = Number(match[3]!);

    if (ctx.from?.id !== executorId) {
      warn("unban - callback de outro usuario", {
        fromId: ctx.from?.id,
        executorId,
        targetId,
      });
      await ctx.answerCallbackQuery(ctx.t("unban_error_not_requester"));
      return;
    }

    if (action === "no") {
      info("unban - cancelado pelo executor", { executorId, targetId });
      await editOrSendText({ ctx, caption: ctx.t("unban_cancelled") });
      return;
    }

    const targetRole = await getUserRole(targetId);

    if (roleWeights[targetRole] !== roleWeights[ProfileType.BANNED]) {
      warn("unban - alvo nao esta banido no confirmacao", {
        executorId,
        targetId,
        targetRole,
      });
      await ctx.answerCallbackQuery(ctx.t("unban_error_not_banned"));
      return;
    }

    await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(targetId) },
      update: { profileType: ProfileType.USER },
      create: {
        telegramId: BigInt(targetId),
        profileType: ProfileType.USER,
        telegramData: {},
        waifuConfig: {},
        husbandoConfig: {},
      },
    });

    permissionCache.delete(String(targetId));

    info("unban - usuario desbanido", {
      executorId,
      targetId,
    });
    await editOrSendText({ ctx, caption: ctx.t("unban_success") });
  } catch (e) {
    error("unban - erro ao desbanir usuario", e);
    await ctx.answerCallbackQuery(
      ctx.t("unban_error", { error: "erro interno" }),
    );
  }
}
