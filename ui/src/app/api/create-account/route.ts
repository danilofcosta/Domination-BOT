import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token, username, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token é obrigatório." }, { status: 400 });
    }
    if (!username || typeof username !== "string" || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Usuário inválido." },
        { status: 400 },
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    const verification = await prisma.verification.findFirst({
      where: { value: token },
    });

    if (!verification || verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este nome de usuário já está em uso." },
        { status: 400 },
      );
    }

    const telegramId = BigInt(verification.identifier);
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { telegramId },
    });

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Usuário do Telegram não encontrado." },
        { status: 404 },
      );
    }

    let webUser = await prisma.user.findFirst({
      where: { telegramUserId: telegramUser.id },
      include: { accounts: true },
    });

    if (webUser && webUser.accounts.some(a => a.providerId === "email")) {
      return NextResponse.json(
        { error: "Esta conta do Telegram já possui um cadastro." },
        { status: 400 },
      );
    }

    if (webUser) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: webUser.id,
          providerId: "email",
          userId: webUser.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      await prisma.user.update({
        where: { id: webUser.id },
        data: { username },
      });
      await prisma.telegramUser.update({
        where: { id: telegramUser.id },
        data: { webPassword: hashedPassword },
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      webUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: username,
          email: `${telegramId}@telegram.domination`,
          emailVerified: true,
          username,
          telegramUserId: telegramUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          accounts: {
            create: {
              id: crypto.randomUUID(),
              accountId: "",
              providerId: "email",
              password: hashedPassword,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
        include: { accounts: true },
      });
      await prisma.telegramUser.update({
        where: { id: telegramUser.id },
        data: { webPassword: hashedPassword, webLogin: username },
      });
    }

    const sessionToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        id: sessionId,
        token: sessionToken,
        userId: webUser.id,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.verification.delete({
      where: { id: verification.id },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("create-account error:", err);
    return NextResponse.json(
      { error: "Erro interno ao criar conta." },
      { status: 500 },
    );
  }
}
