import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/telegram/resolveMediaUrl";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id: idStr } = await params;
  const id = Number(idStr);
  if (type !== "waifu" && type !== "husbando") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let character: any;
  if (type === "waifu") {
    character = await prisma.characterWaifu.findUnique({
      where: { id },
      include: {
        WaifuRarity: { select: { rarityId: true } },
        WaifuEvent: { select: { eventId: true } },
      },
    });
  } else {
    character = await prisma.characterHusbando.findUnique({
      where: { id },
      include: {
        HusbandoRarity: { select: { rarityId: true } },
        HusbandoEvent: { select: { eventId: true } },
      },
    });
  }
  if (!character) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { displayUrl, isVideo } = await resolveMediaUrl(character, type);

  const [allRarities, allEvents] = await Promise.all([
    prisma.rarity.findMany({ orderBy: { name: "asc" } }),
    prisma.event.findMany({ orderBy: { name: "asc" } }),
  ]);

  const currentRarityIds = type === "waifu"
    ? character.WaifuRarity.map((wr: any) => wr.rarityId)
    : character.HusbandoRarity.map((hr: any) => hr.rarityId);

  const currentEventIds = type === "waifu"
    ? character.WaifuEvent.map((we: any) => we.eventId)
    : character.HusbandoEvent.map((he: any) => he.eventId);

  return NextResponse.json({
    character: {
      id: character.id,
      name: character.name,
      origem: character.origem,
      slug: character.slug,
      mediaType: character.mediaType,
      media: character.media,
      sourceType: character.sourceType,
      extras: character.extras,
    },
    displayUrl,
    isVideo,
    currentRarityIds,
    currentEventIds,
    allRarities,
    allEvents,
  });
}
