import { type MiddlewareFn } from "grammy";
import { type MyContext } from "./customTypes.js";
import { prisma } from "../../lib/prisma.js";
import { ProfileType } from "../../generated/prisma/client.js";

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

// Simple in-memory cache for group admin status
type CacheEntry = {
  isAdmin: boolean;
  timestamp: number;
};

const adminCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 60 seconds
const MAX_CACHE_SIZE = 1000; // Prevent memory leak

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

/**
 * Checks if a user is an admin of the designated management group with caching.
 */
async function isGroupAdmin(ctx: MyContext, userId: number): Promise<boolean> {
  const adminGroupId = process.env.GROUP_ADM;
  if (!adminGroupId) {
    console.warn("[Permissions] GROUP_ADM is not defined in environment variables.");
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
  } catch (error) {
    console.error(`[Permissions] Error checking group admin for user ${userId}:`, error);
    return false;
  }
}

/**
 * Fetches the user's role from the database.
 */
export async function getUserRole(userId: number): Promise<ProfileType> {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(userId) },
      select: { profileType: true },
    });

    return user?.profileType || ProfileType.USER;
  } catch (error) {
    console.error(`[Permissions] Error fetching role for user ${userId}:`, error);
    return ProfileType.USER;
  }
}

export async function isUserBanned(userId: number): Promise<boolean> {
  const role = await getUserRole(userId);
  return roleWeights[role] === roleWeights[ProfileType.BANNED];
}

/**
 * Middleware factory for role-based access control.
 * Grants access if:
 * 1. User is an admin of the GROUP_ADM group.
 * 2. User has a database profileType >= requiredRole.
 * 
 * @param requiredRole The minimum role required to access the command.
 */
export function onlyRole(requiredRole: ProfileType): MiddlewareFn<MyContext> {
  return async (ctx, next) => {
    try {
      const from = ctx.from;
      if (!from) {
        console.debug("[Permissions] Access denied: ctx.from is undefined.");
        return;
      }

      const userId = from.id;
      console.log(`[Permissions] Checking permissions for user ${userId} (${from.username || "no-username"}). Required: ${requiredRole}`);

      // 1. Check Group Admin Status (Special bypass)
      const isGroupAdm = await isGroupAdmin(ctx, userId);
      if (isGroupAdm) {
        console.log(`[Permissions] Access granted: User ${userId} is group admin.`);
        return await next();
      }

      // 2. Check Database Role Hierarchy
      const userRole = await getUserRole(userId);
      const userWeight = roleWeights[userRole];
      const requiredWeight = roleWeights[requiredRole];

      if (userWeight >= requiredWeight) {
        console.log(`[Permissions] Access granted: User ${userId} has role ${userRole} (required: ${requiredRole}).`);
        return await next();
      }

      console.log(`[Permissions] Access denied: User ${userId} has role ${userRole} (required: ${requiredRole}).`);
      
      const message = ctx.t 
        ? ctx.t("errors.no_permission") // Assuming i18n is used
        : "❌ Você não tem permissão suficiente para usar este comando.";

      return await ctx.reply(message);
    } catch (error) {
      console.error("[Permissions] Middleware error:", error);
      return await ctx.reply("❌ Ocorreu um erro interno ao verificar suas permissões.");
    }
  };
}
