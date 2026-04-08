import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/uteis/resolveMediaUrl ";
import { Characterdb } from "@/lib/types";

type WithDisplay<T> = T & { displayUrl: string | null };

async function resolveDisplayUrl(item: Characterdb, type: "waifu" | "husbando"): Promise<string | null> {
  const media = await resolveMediaUrl(item, type);
  return media.displayUrl;
}

async function mapWithDisplay<T extends Characterdb>(
  items: T[],
  type: "waifu" | "husbando",
): Promise<WithDisplay<T>[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      displayUrl: await resolveDisplayUrl(item, type),
    })),
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type") as "waifu" | "husbando" | null;
  const sort = url.searchParams.get("sort") || "recent";
  const search = url.searchParams.get("search") || "";
  const rarityId = url.searchParams.get("rarity");
  const eventId = url.searchParams.get("event");
  const sourceType = url.searchParams.get("sourceType");

  const take = 50;
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { origem: { contains: search, mode: "insensitive" } },
    ];
  }

  if (sourceType) {
    whereClause.sourceType = sourceType;
  }

  let orderBy: any;
  switch (sort) {
    case "likes":
      orderBy = { likes: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  let waifus: any[] = [];
  let husbandos: any[] = [];

  if (!type || type === "waifu") {
    const waifuWhere: any = { ...whereClause };
    
    if (rarityId) {
      waifuWhere.WaifuRarity = { some: { rarityId: parseInt(rarityId) } };
    }
    if (eventId) {
      waifuWhere.WaifuEvent = { some: { eventId: parseInt(eventId) } };
    }

    const rawWaifus = await prisma.characterWaifu.findMany({
      where: waifuWhere,
      take,
      orderBy,
    });
    waifus = await mapWithDisplay(rawWaifus, "waifu");
  }

  if (!type || type === "husbando") {
    const husbandoWhere: any = { ...whereClause };
    
    if (rarityId) {
      husbandoWhere.HusbandoRarity = { some: { rarityId: parseInt(rarityId) } };
    }
    if (eventId) {
      husbandoWhere.HusbandoEvent = { some: { eventId: parseInt(eventId) } };
    }

    const rawHusbandos = await prisma.characterHusbando.findMany({
      where: husbandoWhere,
      take,
      orderBy,
    });
    husbandos = await mapWithDisplay(rawHusbandos, "husbando");
  }

  return Response.json({ waifus, husbandos });
}
