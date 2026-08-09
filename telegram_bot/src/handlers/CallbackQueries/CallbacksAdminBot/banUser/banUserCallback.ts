import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { ProfileType } from "../../../../../generated/prisma/client.js";
import {
  getUserRole,
  onlyRoleBotAdmin,
  roleWeights,
} from "../../../../uteis/permissions.js";
import { permissionCache } from "../../../../cache/cache.js";
import { EditOrSendText } from "../../../../uteis/uteis_telegram/EditOrSendText.js";
import { info, warn, error } from "../../../../uteis/log.js";

export async function banUserCallback(ctx: MyContext) {
  await onlyRoleBotAdmin(ProfileType.ADMIN)(ctx, async () => {
    await banUserCallbackService(ctx);
  });
}

async function banUserCallbackService(ctx: MyContext) {
  try {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    const match = data.match(/^ban_(yes|no)_(-?\d+)_(-?\d+)$/);
    if (!match) {
      await ctx.answerCallbackQuery();
      return;
    }

    const action = match[1]!;
    const targetId = Number(match[2]!);
    const executorId = Number(match[3]!);

    if (ctx.from?.id !== executorId) {
      warn("ban - callback de outro usuario", {
        fromId: ctx.from?.id,
        executorId,
        targetId,
      });
      await ctx.answerCallbackQuery(ctx.t("ban_error_not_requester"));
      return;
    }

    if (action === "no") {
      info("ban - cancelado pelo executor", { executorId, targetId });
      await EditOrSendText({ ctx, caption: ctx.t("ban_cancelled") });
      return;
    }

    const executorRole = await getUserRole(executorId);
    const targetRole = await getUserRole(targetId);

    if (
      roleWeights[targetRole] >= roleWeights[ProfileType.ADMIN] &&
      roleWeights[executorRole] < roleWeights[ProfileType.SUPER_ADMIN]
    ) {
      warn("ban - permissao insuficiente no confirmacao", {
        executorId,
        targetId,
        executorRole,
        targetRole,
      });
      await ctx.answerCallbackQuery(ctx.t("ban_error_need_super_admin"));
      return;
    }

    await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(targetId) },
      update: { profileType: ProfileType.BANNED },
      create: {
        telegramId: BigInt(targetId),
        profileType: ProfileType.BANNED,
        telegramData: {},
        waifuConfig: {},
        husbandoConfig: {},
      },
    });

    permissionCache.delete(String(targetId));

    info("ban - usuario banido", {
      executorId,
      executorRole,
      targetId,
      targetRole,
    });
    await EditOrSendText({ ctx, caption: ctx.t("ban_success") });
  } catch (e) {
    error("ban - erro ao executar ban", e);
    await ctx.answerCallbackQuery(
      ctx.t("ban_error", { error: "erro interno" }),
    );
  }
}
