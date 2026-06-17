import { NextRequest, NextResponse } from "next/server";
import { getGalleryItems } from "@/lib/gallery";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const result = await getGalleryItems({
    cursor: sp.get("cursor"),
    search: sp.get("search") || undefined,
    typeFilter: (sp.get("type") as "all" | "waifu" | "husbando") ?? "all",
    sourceType: sp.get("sourceType") || undefined,
    mediaType: sp.get("mediaType") || undefined,
  });

  return NextResponse.json(result);
}
