import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return NextResponse.json({ user: null });
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ user: null });
  }

  const permissions = await getUserPermissions(session.user.id);

  let telegramUser = null;

  if (session.user.telegramUserId) {
    const found = await prisma.telegramUser.findUnique({
      where: { id: session.user.telegramUserId },
    });
    if (found) {
      telegramUser = {
        id: found.id,
        telegramId: found.telegramId.toString(),
        profileType: found.profileType,
        telegramData: found.telegramData,
      };
    }
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      username: session.user.username,
      image: session.user.image,
      telegramUser,
      permissions,
    },
  });
}
