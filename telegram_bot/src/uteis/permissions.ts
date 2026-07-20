import { prisma } from "../lib/prisma.js";
import { getOrSet, permissionCache } from "../cache/cache.js";
import { error } from "./log.js";
import { ProfileType } from "../../generated/prisma/client.js";
import type { MyContext } from "./CustomTypes.js";

export const roleWeights: Record<ProfileType, number> = {
  [ProfileType.BANNED]: -1,
  [ProfileType.USER]: 0,
  [ProfileType.MODERATOR]: 1,
  [ProfileType.ADMIN]: 2,
  [ProfileType.SUPER_ADMIN]: 3,
  [ProfileType.SUPREME]: 4,
};

export async function getUserRole(userId: number): Promise<ProfileType> {
  try {
    const cached = await getOrSet(permissionCache, String(userId), async () => {
      const user = await prisma.telegramUser.findUnique({
        where: { telegramId: BigInt(userId) },
        select: { profileType: true },
      });
      return user?.profileType ?? ProfileType.USER;
    });
    return cached;
  } catch (e) {
    error("getUserRole - erro ao buscar role", e);
    return ProfileType.USER;
  }
}

export function onlyRoleBotAdmin(minPermission: ProfileType) {
  return async (ctx: MyContext, next: () => Promise<void>) => {
    const userRole = await getUserRole(ctx.from?.id ?? 0);
    if (roleWeights[userRole] >= roleWeights[minPermission]) {
      await next();
    } else {
      await ctx.reply(ctx.t("error-admin-bot-only"));
    }
  };
}
