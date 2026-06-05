import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

const getCachedSessions = cache(
  async () => {
    const sessions = await prisma.botSession.findMany({
      orderBy: { key: "desc" },
    });

    return sessions.map(s => ({
      key: s.key,
      value: typeof s.value === 'string' ? JSON.parse(s.value) : s.value,
    }));
  },
  ["admin-sessions"],
  { revalidate: 60, tags: ["sessions"] },
);

export async function GET() {
  try {
    const data = await getCachedSessions();
    return new Response(JSON.stringify(data), {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.botSession.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao resetar sessões:", error);
    return NextResponse.json({ error: "Failed to reset sessions" }, { status: 500 });
  }
}
