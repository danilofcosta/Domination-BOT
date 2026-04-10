import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "desc" },
      include: {
        _count: {
          select: {
            WaifuCollection: true,
            HusbandoCollection: true,
          }
        },
        CharacterWaifu: {
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        },
        CharacterHusbando: {
          include: {
            HusbandoEvent: { include: { Event: true } },
            HusbandoRarity: { include: { Rarity: true } },
          },  
        },
      },
    })
    
    return NextResponse.json(users.map(u => ({
      ...u,
      telegramId: u.telegramId.toString(),
    })))
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}