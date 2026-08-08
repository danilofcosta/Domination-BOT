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
  popularity: number;
};

export type GalleryItem = GalleryItemRaw & {
  resolvedUrl: string;
  isVideo: boolean;
};

export type GallerySort = "recent" | "name_asc" | "name_desc" | "popularity";

export type GalleryParams = {
  cursor?: string | null;
  search?: string;
  typeFilter?: "all" | "waifu" | "husbando";
  sourceType?: string;
  mediaType?: string;
  rarityId?: number;
  eventId?: number;
  sort?: GallerySort;
  perPage?: number;
};

export type GalleryResponse = {
  items: GalleryItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

const DEFAULT_PER_PAGE = 30;

type SortConfig = {
  field: "createdAt" | "name" | "popularity";
  dir: "asc" | "desc";
  keyOf: (item: GalleryItemRaw) => string | number;
  keyToValue: (key: string) => string | number | Date;
};

const SORT_CONFIG: Record<GallerySort, SortConfig> = {
  recent: {
    field: "createdAt",
    dir: "desc",
    keyOf: (item) => item.createdAt.getTime(),
    keyToValue: (key) => new Date(Number(key)),
  },
  name_asc: {
    field: "name",
    dir: "asc",
    keyOf: (item) => item.name,
    keyToValue: (key) => key,
  },
  name_desc: {
    field: "name",
    dir: "desc",
    keyOf: (item) => item.name,
    keyToValue: (key) => key,
  },
  popularity: {
    field: "popularity",
    dir: "desc",
    keyOf: (item) => item.popularity,
    keyToValue: (key) => Number(key),
  },
};

function getMediaTypes(mediaType?: string): MediaType[] | undefined {
  if (mediaType === "VIDEO")
    return ["VIDEO_URL", "VIDEO_FILEID", "VIDEO_LOCAL"] as MediaType[];
  if (mediaType === "IMAGE")
    return ["IMAGE_URL", "IMAGE_FILEID", "IMAGE_LOCAL"] as MediaType[];
  return undefined;
}

export type DecodedCursor = {
  sort: GallerySort;
  key: string;
  type: "waifu" | "husbando";
  id: number;
};

export function encodeCursor(
  sort: GallerySort,
  item: { createdAt: Date; name: string; popularity: number; _type: "waifu" | "husbando"; id: number },
): string {
  const cfg = SORT_CONFIG[sort];
  const key = cfg.keyOf(item as GalleryItemRaw);
  return `${sort}|${key}|${item._type}|${item.id}`;
}

export function decodeCursor(cursor: string): DecodedCursor | null {
  const parts = cursor.split("|");
  if (parts.length !== 4) return null;
  const [sort, key, type, idStr] = parts;
  if (!(sort in SORT_CONFIG)) return null;
  if (type !== "waifu" && type !== "husbando") return null;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return null;
  return { sort: sort as GallerySort, key, type, id };
}

function typeRank(type: "waifu" | "husbando"): number {
  return type === "waifu" ? 0 : 1;
}

function compareRows(
  a: GalleryItemRaw,
  b: GalleryItemRaw,
  sort: GallerySort,
): number {
  const cfg = SORT_CONFIG[sort];
  const ka = cfg.keyOf(a);
  const kb = cfg.keyOf(b);
  let c = ka < kb ? -1 : ka > kb ? 1 : 0;
  if (cfg.dir === "desc") c = -c;
  if (c !== 0) return c;

  const ra = typeRank(a._type);
  const rb = typeRank(b._type);
  if (ra !== rb) return ra - rb;

  return cfg.dir === "asc" ? a.id - b.id : b.id - a.id;
}

function buildConditions(
  params: GalleryParams,
  cursor: string | null | undefined,
  table: "waifu" | "husbando",
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

  if (params.rarityId) {
    const rel = table === "waifu" ? "WaifuRarity" : "HusbandoRarity";
    conditions.push({ [rel]: { some: { rarityId: params.rarityId } } });
  }

  if (params.eventId) {
    const rel = table === "waifu" ? "WaifuEvent" : "HusbandoEvent";
    conditions.push({ [rel]: { some: { eventId: params.eventId } } });
  }

  const sort = params.sort ?? "recent";
  const decoded = cursor ? decodeCursor(cursor) : null;

  if (decoded) {
    const cfg = SORT_CONFIG[decoded.sort];
    const keyVal = cfg.keyToValue(decoded.key);
    const cmpOp = cfg.dir === "asc" ? "gt" : "lt";
    const eqOp = cfg.dir === "asc" ? "gt" : "lt";

    const fieldCmp = { [cfg.field]: { [cmpOp]: keyVal } };
    const fieldEq = { [cfg.field]: keyVal };

    const rankT = typeRank(table);
    const rankC = typeRank(decoded.type);

    let eqBranch: Record<string, unknown> | null;
    if (rankT > rankC) {
      eqBranch = fieldEq;
    } else if (rankT === rankC) {
      eqBranch = { ...fieldEq, id: { [eqOp]: decoded.id } };
    } else {
      eqBranch = null;
    }

    conditions.push(eqBranch ? { OR: [fieldCmp, eqBranch] } : fieldCmp);
  }

  return conditions;
}

function buildWhere(
  params: GalleryParams,
  cursor: string | null | undefined,
  table: "waifu" | "husbando",
): Record<string, unknown> {
  const conditions = buildConditions(params, cursor, table);
  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

function orderByFor(sort: GallerySort): Record<string, "asc" | "desc">[] {
  const cfg = SORT_CONFIG[sort];
  return [{ [cfg.field]: cfg.dir }, { id: cfg.dir }];
}

export async function getGalleryItems(
  params: GalleryParams,
): Promise<GalleryResponse> {
  const perPage = params.perPage ?? DEFAULT_PER_PAGE;
  const take = perPage + 1;
  const sort = params.sort ?? "recent";

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
    popularity: number;
  };

  const [waifus, husbandos] = (await Promise.all([
    params.typeFilter !== "husbando"
      ? prisma.characterWaifu.findMany({
          where: buildWhere(params, params.cursor, "waifu"),
          orderBy: orderByFor(sort) as any,
          take,
        })
      : Promise.resolve([]),
    params.typeFilter !== "waifu"
      ? prisma.characterHusbando.findMany({
          where: buildWhere(params, params.cursor, "husbando"),
          orderBy: orderByFor(sort) as any,
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

  raw.sort((a, b) => compareRows(a, b, sort));

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
    rawHasMore && lastItem ? encodeCursor(sort, lastItem) : null;

  return { items, nextCursor, hasMore: rawHasMore };
}
