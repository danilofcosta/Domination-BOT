import { type MiddlewareFn } from "grammy";
import { ProfileType, type MyContext } from "./customTypes.js";
import { prisma } from "../lib/prisma.js";
import { adminGroupCache, permissionCache, getOrSet } from "../cache/cache.js";
import { warn, error, debug, info } from "./log.js";
import { Sendmedia } from "./sendmedia.js";

/**
 * Weights for the profile types to handle hierarchy.
 * BANNED (-1) < USER (0) < MOD (1) < ADMIN (2) < OWNER (3)
 */
export const roleWeights: Record<ProfileType, number> = {
  [ProfileType.BANNED]: -1,
  [ProfileType.USER]: 0,
  [ProfileType.MODERATOR]: 1,
  [ProfileType.ADMIN]: 2,
  [ProfileType.SUPER_ADMIN]: 3,
  [ProfileType.SUPREME]: 4,
};

async function isGroupAdmin(ctx: MyContext, userId: number): Promise<boolean> {
  const adminGroupId = process.env.GROUP_ADM;
  if (!adminGroupId) {
    warn("[Permissions] GROUP_ADM não definido");
    return false;
  }

  const cacheKey = `${adminGroupId}:${userId}`;
  const cached = adminGroupCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const member = await ctx.api.getChatMember(adminGroupId, userId);
    const isAdmin = ["administrator", "creator"].includes(member.status);
    adminGroupCache.set(cacheKey, isAdmin);
    return isAdmin;
  } catch (e) {
    error(
      `[Permissions] Erro ao verificar admin do grupo para usuário ${userId}`,
      e,
    );
    return false;
  }
}

export async function getUserRole(userId: number): Promise<ProfileType> {
  try {
    const role = await getOrSet(permissionCache, String(userId), async () => {
      const user = await prisma.telegramUser.findUnique({
        where: { telegramId: BigInt(userId) },
        select: { profileType: true },
      });
      return { role: (user?.profileType as ProfileType) || ProfileType.USER };
    });
    return role.role as ProfileType;
  } catch (e) {
    error(`[Permissions] Erro ao buscar role para usuário ${userId}`, e);
    return ProfileType.USER;
  }
}

export async function isUserBanned(userId: number): Promise<boolean> {
  const role = await getUserRole(userId);
  return roleWeights[role] === roleWeights[ProfileType.BANNED];
}

export function onlyRoleBotAdmin(
  requiredRole: ProfileType,
): MiddlewareFn<MyContext> {
  return async (ctx, next) => {
    try {
      const from = ctx.from;
      if (!from) {
        debug("[Permissions] Access denied: ctx.from is undefined.");
        return;
      }

      const userId = from.id;
      debug(
        `[Permissions] Verificando permissões para usuário ${userId} (${from.username || "no-username"}). Required: ${requiredRole}`,
      );

      const isGroupAdm = await isGroupAdmin(ctx, userId);
      if (isGroupAdm) {
        info(
          `[Permissions] Acesso concedido: Usuário ${userId} é admin do grupo.`,
        );
        return await next();
      }

      const userRole = await getUserRole(userId);
      const userWeight = roleWeights[userRole];
      const requiredWeight = roleWeights[requiredRole];

      if (userWeight >= requiredWeight) {
        info(
          `[Permissions] Acesso concedido: Usuário ${userId} tem role ${userRole} (requerido: ${requiredRole}).`,
        );
        return await next();
      }

      debug(
        `[Permissions] Acesso negado: Usuário ${userId} tem role ${userRole} (requerido: ${requiredRole}).`,
      );

      const message = ctx.t
        ? ctx.t("errors.no_permission")
        : "❌ Você não tem permissão suficiente para usar este comando.";

      return await Sendmedia({ ctx, caption: message });
    } catch (e) {
      error("[Permissions] Erro no middleware", e);

      return await Sendmedia({
        ctx,
        caption: "❌ Ocorreu um erro interno ao verificar suas permissões.",
      });
    }
  };
}
