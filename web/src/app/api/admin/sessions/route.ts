import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { key: "desc" },
    });

    return NextResponse.json(sessions.map(s => ({
      key: s.key,
      value: typeof s.value === 'string' ? JSON.parse(s.value) : s.value,
    })));
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.session.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao resetar sessões:", error);
    return NextResponse.json({ error: "Failed to reset sessions" }, { status: 500 });
  }
}
