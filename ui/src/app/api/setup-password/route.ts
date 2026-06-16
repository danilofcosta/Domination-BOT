import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
  }

  const { password } = await request.json();

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const existingAccount = await prisma.account.findFirst({
    where: { userId: session.userId, providerId: "email" },
  });

  if (existingAccount) {
    return NextResponse.json({ error: "Você já possui uma senha cadastrada." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: session.userId,
      providerId: "email",
      userId: session.userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const webUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { telegramUserId: true },
  });

  if (webUser?.telegramUserId) {
    await prisma.telegramUser.update({
      where: { id: webUser.telegramUserId },
      data: { webPassword: hashedPassword },
    });
  }

  return NextResponse.json({ success: true });
}
