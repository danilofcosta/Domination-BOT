import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, banned } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const telegramId = BigInt(userId);
    
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const profileType = banned ? "BANNED" : "USER";

    await prisma.user.update({
      where: { telegramId },
      data: { profileType },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao banir usuário:", error);
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 });
  }
}
