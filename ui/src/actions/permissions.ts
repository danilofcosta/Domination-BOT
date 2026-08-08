"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PERMISSIONS,
  PROFILE_TYPES,
  invalidatePermissionCache,
  getPermissionMatrix,
  type Permission,
  type ProfileType,
} from "@/lib/permissions";

async function requireSupreme(): Promise<{ allowed: boolean; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value;
  if (!token) return { allowed: false, error: "Não autenticado." };

  const session = await prisma.session.findUnique({
    where: { token },
    select: { userId: true },
  });
  if (!session) return { allowed: false, error: "Sessão inválida." };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { telegramUserId: true },
  });
  if (!user?.telegramUserId) return { allowed: false, error: "Sem permissão." };

  const tu = await prisma.telegramUser.findUnique({
    where: { id: user.telegramUserId },
    select: { profileType: true },
  });
  if (!tu || tu.profileType !== "SUPREME") {
    return { allowed: false, error: "Sem permissão." };
  }

  return { allowed: true };
}

type MatrixInput = Record<string, string[]>;

export async function saveRolePermissions(matrix: MatrixInput) {
  const auth = await requireSupreme();
  if (!auth.allowed) return { success: false, message: auth.error! };

  const validRoles = new Set(PROFILE_TYPES);
  const validPerms = new Set<string>([
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
  ]);

  const entries: { role: string; permission: string }[] = [];
  for (const [role, perms] of Object.entries(matrix)) {
    if (!validRoles.has(role as ProfileType)) continue;
    if (role === "SUPREME") continue;
    for (const perm of perms) {
      if (validPerms.has(perm)) entries.push({ role, permission: perm });
    }
  }

  try {
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { role: { not: "SUPREME" } } }),
      prisma.rolePermission.createMany({ data: entries, skipDuplicates: true }),
    ]);
    invalidatePermissionCache();
    revalidatePath("/setup/admins");
    return { success: true, message: "Permissões salvas com sucesso!" };
  } catch (e) {
    return { success: false, message: "Erro ao salvar: " + String(e) };
  }
}

export async function restoreDefaultPermissions() {
  const auth = await requireSupreme();
  if (!auth.allowed) return { success: false, message: auth.error! };

  const entries = Object.entries(DEFAULT_PERMISSIONS).flatMap(
    ([role, perms]) => perms.map((permission) => ({ role, permission })),
  );

  try {
    await prisma.rolePermission.deleteMany();
    await prisma.rolePermission.createMany({ data: entries, skipDuplicates: true });
    invalidatePermissionCache();
    revalidatePath("/setup/admins");
    const matrix = await getPermissionMatrix();
    const serialized: Record<string, string[]> = {};
    for (const [role, perms] of Object.entries(matrix)) {
      serialized[role] = perms as string[];
    }
    return { success: true, message: "Padrões restaurados!", matrix: serialized };
  } catch (e) {
    return { success: false, message: "Erro ao restaurar: " + String(e) };
  }
}

export async function getRolePermissionsMatrix(): Promise<
  Record<string, string[]>
> {
  const matrix = await getPermissionMatrix();
  return Object.fromEntries(
    Object.entries(matrix).map(([role, perms]) => [
      role,
      perms as Permission[],
    ]),
  );
}
