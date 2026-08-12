import { Suspense } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/lib/permissions";
import { getGalleryItems, type GallerySort } from "@/lib/gallery";
import { SourceType } from "../../../../generated/prisma/enums";
import { GalleryGrid } from "@/components/gallery-grid";
import { GalleryFilterBar } from "@/components/gallery-filter-bar";
import { GalleryHeaderActions } from "@/components/gallery-header-actions";

export const dynamic = "force-dynamic";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SOURCE_TYPES = ["all", ...Object.keys(SourceType)] as const;
const MEDIA_TYPES_FILTER = ["all", "IMAGE", "VIDEO"] as const;
const SORTS: GallerySort[] = ["recent", "name_asc", "name_desc", "popularity"];

export default async function GalleryRecentPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const typeFilter =
    params.type === "waifu" || params.type === "husbando" ? params.type : "all";
  const sourceType =
    params.sourceType && SOURCE_TYPES.includes(params.sourceType as any)
      ? (params.sourceType as typeof SOURCE_TYPES[number])
      : "all";
  const mediaType =
    params.mediaType && MEDIA_TYPES_FILTER.includes(params.mediaType as any)
      ? (params.mediaType as typeof MEDIA_TYPES_FILTER[number])
      : "all";
  const sortParam = typeof params.sort === "string" ? params.sort : "recent";
  const sort: GallerySort = SORTS.includes(sortParam as GallerySort)
    ? (sortParam as GallerySort)
    : "recent";
  const rarityId =
    typeof params.rarityId === "string" &&
    !isNaN(Number(params.rarityId)) &&
    Number(params.rarityId) > 0
      ? params.rarityId
      : "all";
  const eventId =
    typeof params.eventId === "string" &&
    !isNaN(Number(params.eventId)) &&
    Number(params.eventId) > 0
      ? params.eventId
      : "all";

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;
  let sessionUserId: string | null = null;
  if (sessionToken) {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      select: { userId: true },
    });
    sessionUserId = session?.userId ?? null;
  }

  const permissions = sessionUserId ? await getUserPermissions(sessionUserId) : [];
  const canAdd = permissions.includes("manage_characters");
  const canManageRarities = permissions.includes("manage_rarities");
  const canManageEvents = permissions.includes("manage_events");

  const [result, allRarities, allEvents] = await Promise.all([
    getGalleryItems({
      search: search || undefined,
      typeFilter: typeFilter as "all" | "waifu" | "husbando",
      sourceType: sourceType !== "all" ? sourceType : undefined,
      mediaType: mediaType !== "all" ? mediaType : undefined,
      rarityId: rarityId !== "all" ? Number(rarityId) : undefined,
      eventId: eventId !== "all" ? Number(eventId) : undefined,
      sort,
    }),
    prisma.rarity.findMany({
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true, emoji: true },
    }),
    prisma.event.findMany({
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true, emoji: true },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Galeria
            </p>
          </div>
          <GalleryHeaderActions
            canAdd={canAdd}
            canManageRarities={canManageRarities}
            canManageEvents={canManageEvents}
            allRarities={allRarities}
            allEvents={allEvents}
          />
        </div>
        <GalleryFilterBar
          search={search}
          typeFilter={typeFilter}
          sourceType={sourceType}
          mediaType={mediaType}
          rarityId={rarityId}
          eventId={eventId}
          sort={sort}
          rarities={allRarities}
          events={allEvents}
        />
      </header>

      <Suspense fallback={<GallerySkeleton />}>
        <GalleryGrid
          initialItems={result.items.map((item) => ({
            id: item.id,
            _type: item._type,
            name: item.name,
            resolvedUrl: item.resolvedUrl,
            isVideo: item.isVideo,
            createdAt: item.createdAt,
          }))}
          initialCursor={result.nextCursor}
          initialHasMore={result.hasMore}
          filters={{
            search: search || undefined,
            type: typeFilter !== "all" ? typeFilter : undefined,
            sourceType: sourceType !== "all" ? sourceType : undefined,
            mediaType: mediaType !== "all" ? mediaType : undefined,
            rarityId,
            eventId,
            sort,
          }}
          canManageCharacters={canAdd}
        />
      </Suspense>
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="mb-4 inline-block w-full animate-pulse rounded-xl border border-border/70 bg-card/60"
        >
          <div className="aspect-[3/4] bg-muted" />
        </div>
      ))}
    </div>
  );
}
