import { NextRequest, NextResponse } from "next/server";
import { getGalleryItems, type GallerySort } from "@/lib/gallery";

const SORTS = ["recent", "name_asc", "name_desc", "popularity"] as const;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const sortParam = sp.get("sort");
  const rarityParam = sp.get("rarityId");
  const eventParam = sp.get("eventId");

  const result = await getGalleryItems({
    cursor: sp.get("cursor"),
    search: sp.get("search") || undefined,
    typeFilter: (sp.get("type") as "all" | "waifu" | "husbando") ?? "all",
    sourceType: sp.get("sourceType") || undefined,
    mediaType: sp.get("mediaType") || undefined,
    rarityId: rarityParam && !isNaN(Number(rarityParam)) ? Number(rarityParam) : undefined,
    eventId: eventParam && !isNaN(Number(eventParam)) ? Number(eventParam) : undefined,
    sort: sortParam && SORTS.includes(sortParam as any) ? (sortParam as GallerySort) : undefined,
  });

  return NextResponse.json(result);
}
