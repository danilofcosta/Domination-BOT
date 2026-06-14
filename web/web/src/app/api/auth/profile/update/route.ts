import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  verifySessionToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 },
      );
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, newLogin } = body;

    const user = await prisma.user.findFirst({
      where: { telegramId: BigInt(session.telegramId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    if (newPassword || newLogin) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Senha atual é obrigatória para alterações." },
          { status: 400 },
        );
      }

      if (!user.webPassword) {
        return NextResponse.json(
          { error: "Usuário não possui senha configurada." },
          { status: 400 },
        );
      }

      const isValid = await verifyPassword(currentPassword, user.webPassword);
      if (!isValid) {
        return NextResponse.json(
          { error: "Senha atual incorreta." },
          { status: 401 },
        );
      }
    }

    const updateData: Record<string, string> = {};

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Nova senha deve ter no mínimo 6 caracteres." },
          { status: 400 },
        );
      }
      updateData.webPassword = await hashPassword(newPassword);
    }

    if (newLogin) {
      if (newLogin.length < 3) {
        return NextResponse.json(
          { error: "Login deve ter no mínimo 3 caracteres." },
          { status: 400 },
        );
      }

      const existing = await prisma.user.findFirst({
        where: { webLogin: newLogin, telegramId: { not: BigInt(session.telegramId) } },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Este login já está em uso." },
          { status: 409 },
        );
      }

      updateData.webLogin = newLogin;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhuma alteração fornecida." },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Profile Update API] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
