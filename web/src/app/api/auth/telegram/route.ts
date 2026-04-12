import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  validateTelegramHash,
  createSessionToken,
  ADMIN_ROLES,
  type TelegramAuthData,
} from "@/lib/auth/auth";
import {
  checkRateLimit,
  getClientIp,
  recordFailedAttempt,
} from "@/lib/auth/rate-limit";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`telegram:${clientIp}`);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    const body: TelegramAuthData = await req.json();

    // 1. Validar hash do Telegram
    if (!validateTelegramHash(body)) {
      recordFailedAttempt(`telegram:${clientIp}`);
      return NextResponse.json(
        { error: "Dados de autenticação inválidos." },
        { status: 401 },
      );
    }

    // 2. Buscar usuário no banco
    const telegramId = BigInt(body.id);
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      recordFailedAttempt(`telegram:${clientIp}`);
      return NextResponse.json(
        { error: "Usuário não encontrado. Você precisa usar o bot primeiro." },
        { status: 404 },
      );
    }

    // 3. Verificar se tem role admin
    if (!ADMIN_ROLES.includes(user.profileType as any)) {
      recordFailedAttempt(`telegram:${clientIp}`);
      return NextResponse.json(
        { error: "Acesso negado. Você não tem permissão de administrador." },
        { status: 403 },
      );
    }

    // 4. Criar JWT session token
    const token = await createSessionToken({
      telegramId: user.telegramId.toString(),
      profileType: user.profileType,
      firstName: body.first_name,
      photoUrl: body.photo_url,
    });

    // 5. Setar cookie httpOnly
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return NextResponse.json({
      success: true,
      user: {
        firstName: body.first_name,
        profileType: user.profileType,
      },
    });
  } catch (error) {
    console.error("[Auth API] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
