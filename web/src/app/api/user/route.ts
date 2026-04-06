import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const telegramIdStr = url.searchParams.get("id");
  
  if (!telegramIdStr) {
    return NextResponse.json({ error: "Missing Telegram ID" }, { status: 400 });
  }

  const telegramId = BigInt(telegramIdStr);

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      include: {
        WaifuCollection: true,
        HusbandoCollection: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id.toString(),
      telegramId: user.telegramId.toString(),
      coins: user.coins,
      profileType: user.profileType,
      waifuCount: user.WaifuCollection.length,
      husbandoCount: user.HusbandoCollection.length,
      telegramData: user.telegramData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
