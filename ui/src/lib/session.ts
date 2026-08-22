import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  getProfileType,
  hasPermission,
  type Permission,
} from "@/lib/permissions";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    select: { userId: true },
  });
  return session?.userId ?? null;
}

export async function sessionHasPermission(
  permission: Permission,
): Promise<boolean> {
  const userId = await getSessionUserId();
  if (!userId) return false;
  const profileType = await getProfileType(userId);
  return hasPermission(profileType, permission);
}
