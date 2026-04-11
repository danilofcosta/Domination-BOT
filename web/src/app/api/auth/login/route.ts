import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSessionToken, ADMIN_ROLES, verifyPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp, recordFailedAttempt } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`login:${clientIp}`);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        { error: "Login e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        webLogin: login,
      },
    });

    if (!user || !user.webPassword) {
      recordFailedAttempt(`login:${clientIp}`);
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.webPassword);
    if (!isValidPassword) {
      recordFailedAttempt(`login:${clientIp}`);
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    if (!ADMIN_ROLES.includes(user.profileType as "ADMIN" | "SUPER_ADMIN" | "SUPREME")) {
      recordFailedAttempt(`login:${clientIp}`);
      return NextResponse.json(
        { error: "Acesso negado. Você não tem permissão de administrador." },
        { status: 403 }
      );
    }

    const token = await createSessionToken({
      telegramId: user.telegramId.toString(),
      profileType: user.profileType,
      firstName: user.telegramData ? (user.telegramData as any).first_name || "Admin" : "Admin",
    });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      user: {
        profileType: user.profileType,
      },
    });
  } catch (error) {
    console.error("[Auth Login API] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}