import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const waifus = await prisma.characterWaifu.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(waifus);
  } catch (error) {
    console.error("Error fetching waifus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
