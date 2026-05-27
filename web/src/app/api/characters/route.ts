import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/uteis/resolveMediaUrl";
import { Characterdb } from "@/lib/types";
import { unstable_cache } from "next/cache";

type WithDisplay<T> = T & { displayUrl: string | null };

async function resolveDisplayUrl(
  item: Characterdb,
  type: "waifu" | "husbando",
): Promise<string | null> {
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

interface CharactersParams {
  type: string | null;
  sort: string;
  search: string;
  rarityId: string | null;
  eventId: string | null;
  sourceType: string | null;
  anime: string | null;
  page: number;
}

const getCachedCharacters = unstable_cache(
  async (params: CharactersParams) => {
    const { type, sort, search, rarityId, eventId, sourceType, anime, page } = params;
    const take = 24;
    const skip = (page - 1) * take;
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

    if (anime) {
      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          { origem: { contains: anime, mode: "insensitive" } },
        ];
        delete whereClause.OR;
      } else {
        whereClause.origem = { contains: anime, mode: "insensitive" };
      }
    }

    let orderBy: any;
    switch (sort) {
      case "likes":
        orderBy = { likes: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "old":
        orderBy = { createdAt: "asc" };
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
        skip,
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
        skip,
        orderBy,
      });
      husbandos = await mapWithDisplay(rawHusbandos, "husbando");
    }

    return { waifus, husbandos };
  },
  ["characters-data"],
  { revalidate: 60, tags: ["characters"] },
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: CharactersParams = {
    type: url.searchParams.get("type") as "waifu" | "husbando" | null,
    sort: url.searchParams.get("sort") || "recent",
    search: url.searchParams.get("search") || "",
    rarityId: url.searchParams.get("rarity"),
    eventId: url.searchParams.get("event"),
    sourceType: url.searchParams.get("sourceType"),
    anime: url.searchParams.get("anime"),
    page: parseInt(url.searchParams.get("page") || "1"),
  };

  const data = await getCachedCharacters(params);
  return Response.json(data);
}
