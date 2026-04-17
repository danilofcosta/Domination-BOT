import { resolveMediaUrl } from "@/lib/uteis/resolveMediaUrl";

import { prisma } from "@/lib/prisma";
import { Characterdb } from "@/lib/types";

type WithDisplay<T> = T & {
  displayUrl: string | null;
};

async function resolveDisplayUrl(
  item: Characterdb,
  type: "waifu" | "husbando",
): Promise<string | null> {
  const media = await resolveMediaUrl(item, type);
  const { displayUrl, isVideo } = media;
  return displayUrl;
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
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "20");
  const sort = url.searchParams.get("sort") || "recent";
  console.log(`Home sort: ${sort}, take: ${take}, skip: ${skip}`);
  let orderBy: any;
  if (sort === "likes") {
    orderBy = [{ likes: "desc" }, { id: "asc" }];
  } else {
    orderBy = [{ createdAt: "desc" }, { id: "asc" }];
  }
  try {
    const [waifusRaw, husbandosRaw] = await Promise.all([
      prisma.characterWaifu.findMany({
        skip,
        take,
        orderBy,
      }),
      prisma.characterHusbando.findMany({
        skip,
        take,
        orderBy,
      }),
    ]);

    const [waifus, husbandos] = await Promise.all([
      mapWithDisplay(waifusRaw, "waifu"),
      mapWithDisplay(husbandosRaw, "husbando"),
    ]);

    return Response.json({
      waifus,
      husbandos,
    });
  } catch (e: any) {
    console.log("Erro  em buscar dados:", `CODIGO ${e.code}: ${e.message}`, e);
    return Response.json({
      waifus: [],
      husbandos: [],
    });
  }
}
