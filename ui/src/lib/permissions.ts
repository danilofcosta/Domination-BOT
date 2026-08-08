import { prisma } from "@/lib/prisma";

export enum ProfileType {
  SUPREME = "SUPREME",
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
  BANNED = "BANNED",
}

export const PROFILE_TYPES: ProfileType[] = [
  ProfileType.SUPREME,
  ProfileType.SUPER_ADMIN,
  ProfileType.ADMIN,
  ProfileType.MODERATOR,
  ProfileType.USER,
  ProfileType.BANNED,
];

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

export const ALL_PERMISSIONS: Permission[] = [
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
];

export const DEFAULT_PERMISSIONS: Record<ProfileType, Permission[]> = {
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
  [ProfileType.MODERATOR]: ["view_users", "view_logs"],
  [ProfileType.USER]: [],
  [ProfileType.BANNED]: [],
};

let matrixCache: Record<ProfileType, Permission[]> | null = null;

export function invalidatePermissionCache() {
  matrixCache = null;
}

export async function getPermissionMatrix(): Promise<
  Record<ProfileType, Permission[]>
> {
  if (matrixCache) return matrixCache;

  const rows = await prisma.rolePermission.findMany();
  if (rows.length === 0) {
    await prisma.rolePermission.createMany({
      data: Object.entries(DEFAULT_PERMISSIONS).flatMap(([role, perms]) =>
        perms.map((permission) => ({ role, permission })),
      ),
      skipDuplicates: true,
    });
  }

  const matrix = { ...DEFAULT_PERMISSIONS };
  for (const row of rows) {
    const role = row.role as ProfileType;
    const permission = row.permission as Permission;
    if (matrix[role] && !matrix[role].includes(permission)) {
      matrix[role].push(permission);
    }
  }

  for (const role of PROFILE_TYPES) {
    matrix[role] = matrix[role].filter((p) =>
      (ALL_PERMISSIONS as string[]).includes(p),
    );
  }

  matrixCache = matrix;
  return matrix;
}

export async function hasPermission(
  profileType: ProfileType | null | undefined,
  permission: Permission,
): Promise<boolean> {
  if (!profileType) return false;
  if (profileType === ProfileType.SUPREME) return true;
  const matrix = await getPermissionMatrix();
  return matrix[profileType]?.includes(permission) ?? false;
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
  if (profileType === ProfileType.SUPREME) return [...ALL_PERMISSIONS];
  const matrix = await getPermissionMatrix();
  return matrix[profileType] ?? [];
}

export async function requirePermission(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const profileType = await getProfileType(userId);
  return hasPermission(profileType, permission);
}
