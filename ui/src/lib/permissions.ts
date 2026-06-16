import { prisma } from "@/lib/prisma";

export enum ProfileType {
  SUPREME = "SUPREME",
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
  BANNED = "BANNED",
}

const hierarchy: Record<ProfileType, number> = {
  [ProfileType.SUPREME]: 0,
  [ProfileType.SUPER_ADMIN]: 1,
  [ProfileType.ADMIN]: 2,
  [ProfileType.MODERATOR]: 3,
  [ProfileType.USER]: 4,
  [ProfileType.BANNED]: 5,
};

export type Permission =
  | "manage_admins"
  | "manage_users"
  | "manage_characters"
  | "manage_events"
  | "manage_rarities"
  | "manage_groups"
  | "manage_config"
  | "manage_limits"
  | "manage_drop"
  | "view_users"
  | "view_logs";

const permissionsMap: Record<ProfileType, Permission[]> = {
  [ProfileType.SUPREME]: [
    "manage_admins",
    "manage_users",
    "manage_characters",
    "manage_events",
    "manage_rarities",
    "manage_groups",
    "manage_config",
    "manage_limits",
    "manage_drop",
    "view_users",
    "view_logs",
  ],
  [ProfileType.SUPER_ADMIN]: [
    "manage_users",
    "manage_characters",
    "manage_events",
    "manage_rarities",
    "manage_groups",
    "manage_config",
    "manage_limits",
    "manage_drop",
    "view_users",
    "view_logs",
  ],
  [ProfileType.ADMIN]: [
    "manage_characters",
    "manage_events",
    "manage_rarities",
    "manage_groups",
    "manage_config",
    "manage_drop",
    "view_users",
    "view_logs",
  ],
  [ProfileType.MODERATOR]: [
    "view_users",
    "view_logs",
  ],
  [ProfileType.USER]: [],
  [ProfileType.BANNED]: [],
};

export function hasPermission(
  profileType: ProfileType | null | undefined,
  permission: Permission,
): boolean {
  if (!profileType) return false;
  return permissionsMap[profileType]?.includes(permission) ?? false;
}

export function hasMinProfileType(
  profileType: ProfileType | null | undefined,
  minType: ProfileType,
): boolean {
  if (!profileType) return false;
  const userLevel = hierarchy[profileType];
  const requiredLevel = hierarchy[minType];
  return userLevel <= requiredLevel;
}

export async function getProfileType(
  userId: string,
): Promise<ProfileType | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { telegramUserId: true },
  });

  if (!user?.telegramUserId) return null;

  const telegramUser = await prisma.telegramUser.findUnique({
    where: { id: user.telegramUserId },
    select: { profileType: true },
  });

  return (telegramUser?.profileType as ProfileType) ?? null;
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const profileType = await getProfileType(userId);
  if (!profileType) return [];
  return permissionsMap[profileType] ?? [];
}

export async function requirePermission(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const profileType = await getProfileType(userId);
  return hasPermission(profileType, permission);
}
