import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, error: "Token é obrigatório." },
        { status: 400 },
      );
    }

    const verification = await prisma.verification.findFirst({
      where: { value: token },
    });

    if (!verification) {
      return NextResponse.json(
        { valid: false, error: "Token inválido." },
        { status: 400 },
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Token expirado. Solicite um novo." },
        { status: 400 },
      );
    }

    const rawId = verification.identifier;
    if (!rawId || !/^\d+$/.test(rawId)) {
      return NextResponse.json(
        { valid: false, error: "Token inválido." },
        { status: 400 },
      );
    }

    const telegramId = BigInt(rawId);
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { telegramId },
    });

    if (!telegramUser) {
      return NextResponse.json(
        { valid: false, error: "Token inválido." },
        { status: 400 },
      );
    }

    return NextResponse.json({ valid: true, telegramId: Number(telegramId) });
  } catch (err) {
    console.error("verify-telegram-token error:", err);
    return NextResponse.json(
      { valid: false, error: "Erro interno." },
      { status: 500 },
    );
  }
}
