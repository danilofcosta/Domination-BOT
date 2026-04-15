import { type MiddlewareFn } from "grammy";
import { type MyContext } from "./customTypes.js";
import { prisma } from "../../lib/prisma.js";
import { ProfileType } from "../../generated/prisma/client.js";
import { warn, error, debug, info } from "./log.js";

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

type CacheEntry = {
  isAdmin: boolean;
  timestamp: number;
};

const adminCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000;
const MAX_CACHE_SIZE = 1000;

function cleanupCache() {
  if (adminCache.size >= MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, entry] of adminCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        adminCache.delete(key);
      }
    }
    if (adminCache.size >= MAX_CACHE_SIZE) {
      const oldestKeys = [...adminCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.floor(MAX_CACHE_SIZE * 0.3))
        .map(([key]) => key);
      oldestKeys.forEach((key) => adminCache.delete(key));
    }
  }
}

async function isGroupAdmin(ctx: MyContext, userId: number): Promise<boolean> {
  const adminGroupId = process.env.GROUP_ADM;
  if (!adminGroupId) {
    warn("[Permissions] GROUP_ADM não definido");
    return false;
  }

  const cacheKey = `${adminGroupId}:${userId}`;
  const now = Date.now();
  const cached = adminCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.isAdmin;
  }

  cleanupCache();

  try {
    const member = await ctx.api.getChatMember(adminGroupId, userId);
    const isAdmin = ["administrator", "creator"].includes(member.status);
    
    adminCache.set(cacheKey, { isAdmin, timestamp: now });
    return isAdmin;
  } catch (e) {
    error(`[Permissions] Erro ao verificar admin do grupo para usuário ${userId}`, e);
    return false;
  }
}

export async function getUserRole(userId: number): Promise<ProfileType> {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(userId) },
      select: { profileType: true },
    });

    return user?.profileType || ProfileType.USER;
  } catch (e) {
    error(`[Permissions] Erro ao buscar role para usuário ${userId}`, e);
    return ProfileType.USER;
  }
}

export async function isUserBanned(userId: number): Promise<boolean> {
  const role = await getUserRole(userId);
  return roleWeights[role] === roleWeights[ProfileType.BANNED];
}

export function onlyRoleBotAdmin(requiredRole: ProfileType): MiddlewareFn<MyContext> {
  return async (ctx, next) => {
    try {
      const from = ctx.from;
      if (!from) {
        debug("[Permissions] Access denied: ctx.from is undefined.");
        return;
      }

      const userId = from.id;
      debug(`[Permissions] Verificando permissões para usuário ${userId} (${from.username || "no-username"}). Required: ${requiredRole}`);

      const isGroupAdm = await isGroupAdmin(ctx, userId);
      if (isGroupAdm) {
        info(`[Permissions] Acesso concedido: Usuário ${userId} é admin do grupo.`);
        return await next();
      }

      const userRole = await getUserRole(userId);
      const userWeight = roleWeights[userRole];
      const requiredWeight = roleWeights[requiredRole];

      if (userWeight >= requiredWeight) {
        info(`[Permissions] Acesso concedido: Usuário ${userId} tem role ${userRole} (requerido: ${requiredRole}).`);
        return await next();
      }

      debug(`[Permissions] Acesso negado: Usuário ${userId} tem role ${userRole} (requerido: ${requiredRole}).`);
      
      const message = ctx.t 
        ? ctx.t("errors.no_permission")
        : "❌ Você não tem permissão suficiente para usar este comando.";

      return await ctx.reply(message);
    } catch (e) {
      error("[Permissions] Erro no middleware", e);
      return await ctx.reply("❌ Ocorreu um erro interno ao verificar suas permissões.");
    }
  };
}
