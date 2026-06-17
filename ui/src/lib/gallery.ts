import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/telegram/resolveMediaUrl";
import { MediaType, SourceType } from "../../generated/prisma/enums";

export type GalleryItemRaw = {
  id: number;
  _type: "waifu" | "husbando";
  name: string;
  origem: string;
  slug: string;
  mediaType: string;
  media: string;
  linkweb?: string | null;
  linkwebExpiresAt?: Date | string | null;
  createdAt: Date;
  sourceType: string;
};

export type GalleryItem = GalleryItemRaw & {
  resolvedUrl: string;
  isVideo: boolean;
};

export type GalleryParams = {
  cursor?: string | null;
  search?: string;
  typeFilter?: "all" | "waifu" | "husbando";
  sourceType?: string;
  mediaType?: string;
  perPage?: number;
};

export type GalleryResponse = {
  items: GalleryItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

const DEFAULT_PER_PAGE = 30;

function getMediaTypes(mediaType?: string): MediaType[] | undefined {
  if (mediaType === "VIDEO")
    return ["VIDEO_URL", "VIDEO_FILEID", "VIDEO_LOCAL"] as MediaType[];
  if (mediaType === "IMAGE")
    return ["IMAGE_URL", "IMAGE_FILEID", "IMAGE_LOCAL"] as MediaType[];
  return undefined;
}

export function encodeCursor(
  createdAt: Date,
  type: "waifu" | "husbando",
  id: number,
): string {
  return `${createdAt.getTime()}_${type}_${id}`;
}

export function decodeCursor(cursor: string): {
  createdAt: Date;
  type: "waifu" | "husbando";
  id: number;
} {
  const [ts, type, idStr] = cursor.split("_");
  return {
    createdAt: new Date(Number(ts)),
    type: type as "waifu" | "husbando",
    id: Number(idStr),
  };
}

function buildConditions(
  params: GalleryParams,
  cursor?: string | null,
): Record<string, unknown>[] {
  const conditions: Record<string, unknown>[] = [];

  if (params.search) {
    conditions.push({
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        {
          origem: { contains: params.search, mode: "insensitive" as const },
        },
        ...(isNaN(Number(params.search))
          ? []
          : [{ id: Number(params.search) }]),
      ],
    });
  }

  if (params.sourceType && params.sourceType !== "all") {
    conditions.push({ sourceType: params.sourceType as SourceType });
  }

  const mediaTypes = getMediaTypes(params.mediaType);
  if (mediaTypes) {
    conditions.push({ mediaType: { in: mediaTypes as any } });
  }

  if (cursor) {
    const decoded = decodeCursor(cursor);
    conditions.push({
      OR: [
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      ],
    });
  }

  return conditions;
}

function buildWhere(
  params: GalleryParams,
  cursor?: string | null,
): Record<string, unknown> {
  const conditions = buildConditions(params, cursor);
  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

export async function getGalleryItems(
  params: GalleryParams,
): Promise<GalleryResponse> {
  const perPage = params.perPage ?? DEFAULT_PER_PAGE;
  const take = perPage + 1;

  type CharRow = {
    id: number;
    name: string;
    origem: string;
    slug: string;
    mediaType: string;
    media: string;
    linkweb: string | null;
    linkwebExpiresAt: Date | null;
    createdAt: Date;
    sourceType: string;
  };

  const [waifus, husbandos] = (await Promise.all([
    params.typeFilter !== "husbando"
      ? prisma.characterWaifu.findMany({
          where: buildWhere(params, params.cursor),
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take,
        })
      : Promise.resolve([]),
    params.typeFilter !== "waifu"
      ? prisma.characterHusbando.findMany({
          where: buildWhere(params, params.cursor),
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take,
        })
      : Promise.resolve([]),
  ])) as [CharRow[], CharRow[]];

  const waifuHasMore = waifus.length > perPage;
  const husbandoHasMore = husbandos.length > perPage;
  const rawHasMore = waifuHasMore || husbandoHasMore;

  const raw: GalleryItemRaw[] = [
    ...waifus.slice(0, perPage).map((w) => ({ ...w, _type: "waifu" as const })),
    ...husbandos.slice(0, perPage).map((h) => ({
      ...h,
      _type: "husbando" as const,
    })),
  ];

  raw.sort((a, b) => {
    const d = b.createdAt.getTime() - a.createdAt.getTime();
    if (d !== 0) return d;
    return b.id - a.id;
  });

  const resolved = await Promise.all(
    raw.map(async (item) => {
      const { displayUrl, isVideo } = await resolveMediaUrl(item, item._type);
      return { ...item, resolvedUrl: displayUrl || "/placeholder.png", isVideo };
    }),
  );

  const valid = resolved.filter(
    (item): item is GalleryItem =>
      !!item.resolvedUrl && item.resolvedUrl !== "/placeholder.png",
  );

  const items = valid.slice(0, perPage);
  const lastItem = items[items.length - 1];
  const nextCursor =
    rawHasMore && lastItem
      ? encodeCursor(lastItem.createdAt, lastItem._type, lastItem.id)
      : null;

  return { items, nextCursor, hasMore: rawHasMore };
}
