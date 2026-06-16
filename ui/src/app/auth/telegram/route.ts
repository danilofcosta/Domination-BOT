import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateMap.get(ip);
  if (!record || now > record.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= 5) return false;
  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  if (!checkRateLimit(ip)) {
    return new Response("Muitas requisições. Tente novamente em 1 minuto.", { status: 429 });
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const verification = await prisma.verification.findFirst({
    where: { value: token },
  });

  if (!verification || verification.expiresAt < new Date()) {
    return new Response(
      `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#111;color:#eee">
        <div style="text-align:center"><h1>Token inválido ou expirado</h1>
        <p>Solicite um novo link usando /login no Telegram.</p></div></body></html>`,
      { status: 400, headers: { "content-type": "text/html;charset=utf-8" } },
    );
  }

  const telegramId = BigInt(verification.identifier);

  const telegramUser = await prisma.telegramUser.findUnique({
    where: { telegramId },
  });

  if (!telegramUser) {
    return new Response("Usuário do Telegram não encontrado.", { status: 404 });
  }

  let webUser = await prisma.user.findFirst({
    where: { telegramUserId: telegramUser.id },
    include: { accounts: true },
  });

  if (!webUser) {
    const userName = `User${telegramId}`;
    webUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: userName,
        email: `${telegramId}@telegram.domination`,
        emailVerified: true,
        telegramUserId: telegramUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: { accounts: true },
    });
  }

  if (!webUser) {
    return new Response("Erro ao criar usuário.", { status: 500 });
  }

  const sessionToken = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const ipAddress = request.headers.get("x-forwarded-for") ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await prisma.session.create({
    data: {
      id: sessionId,
      token: sessionToken,
      userId: webUser.id,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress,
      userAgent,
    },
  });

  await prisma.verification.delete({
    where: { id: verification.id },
  });

  const redirectUrl = webUser.accounts.some(a => a.providerId === "email")
    ? "/dashboard"
    : "/setup-password";

  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  response.cookies.set("better-auth.session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
