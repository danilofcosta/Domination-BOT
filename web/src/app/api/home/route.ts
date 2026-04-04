import { resolveMediaUrl } from "@/lib/uteis/resolveMediaUrl ";

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

// 🔹 Função genérica para mapear qualquer lista
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

export async function GET() {
  const [waifusRaw, husbandosRaw] = await Promise.all([
    prisma.characterWaifu.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    prisma.characterHusbando.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let [waifus, husbandos] = await Promise.all([
    mapWithDisplay(waifusRaw, "waifu"),
    mapWithDisplay(husbandosRaw, "husbando"),
  ]);
  return Response.json({ waifus, husbandos });
}
