import { prisma } from "../../../../lib/prisma.js";
import type { MyContext } from "../../../../uteis/CustomTypes.js";
import { ProfileType } from "../../../../../generated/prisma/client.js";
import { permissionCache } from "../../../../cache/cache.js";
import { info, error } from "../../../../uteis/log.js";

export async function reload(ctx: MyContext) {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    if (chatId !== Number(process.env.GROUP_ADM)) {
      error("reload - grupo nao e de adms", chatId);
      return;
    }

    const chatAdministrators = await ctx.api.getChatAdministrators(chatId);
    const admins = chatAdministrators.filter((a) => !a.user.is_bot);

    const adminIds = admins.map((a) => BigInt(a.user.id));

    const existingUsers = await prisma.telegramUser.findMany({
      where: { telegramId: { in: adminIds } },
      select: { telegramId: true, profileType: true },
    });

    const existingIds = new Set(existingUsers.map((u) => String(u.telegramId)));

    const usersToPromote = existingUsers.filter(
      (u) => u.profileType === ProfileType.USER,
    );

    let count = 0;

    if (usersToPromote.length > 0) {
      const result = await prisma.telegramUser.updateMany({
        where: { telegramId: { in: usersToPromote.map((u) => u.telegramId) } },
        data: { profileType: ProfileType.ADMIN },
      });
      count += result.count;
    }

    for (const admin of admins) {
      if (existingIds.has(String(admin.user.id))) continue;

      await prisma.telegramUser.upsert({
        where: { telegramId: BigInt(admin.user.id) },
        update: { profileType: ProfileType.ADMIN },
        create: {
          telegramId: BigInt(admin.user.id),
          profileType: ProfileType.ADMIN,
          telegramData: {},
          waifuConfig: {},
          husbandoConfig: {},
        },
      });
      count += 1;
    }

    for (const user of existingUsers) {
      permissionCache.delete(String(user.telegramId));
    }

    if (count === 0) {
      await ctx.reply(ctx.t("reload_no_users"));
      return;
    }

    info("reload", chatId, "atualizados", count);
    await ctx.reply(ctx.t("reload_success", { count: String(count) }));
  } catch (e) {
    error("reload - erro ao atualizar adms", e);
    await ctx.reply(ctx.t("reload_error", { error: "erro interno" }));
  }
}
