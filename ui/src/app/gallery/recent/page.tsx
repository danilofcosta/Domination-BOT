import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/telegram/resolveMediaUrl";
import { MediaType, SourceType } from "../../../../generated/prisma/enums";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ITEMS_PER_PAGE = 30;
const SOURCE_TYPES = ["all", ...Object.keys(SourceType)] as const;
const MEDIA_TYPES_FILTER = ["all", "IMAGE", "VIDEO"] as const;

export default async function GalleryRecentPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const page = Math.max(1, typeof params.page === "string" ? Number(params.page) || 1 : 1);
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

  const perPage = ITEMS_PER_PAGE;
  const skip = (page - 1) * perPage;

  const getMediaTypeFilter = (type: typeof mediaType): MediaType[] => {
    if (type === "VIDEO") return ["VIDEO_URL", "VIDEO_FILEID", "VIDEO_LOCAL"] as MediaType[];
    if (type === "IMAGE") return ["IMAGE_URL", "IMAGE_FILEID", "IMAGE_LOCAL"] as MediaType[];
    return Object.values(MediaType);
  };

  const mediaWhere = {
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(sourceType !== "all" ? { sourceType: sourceType as SourceType } : {}),
    ...(mediaType !== "all" ? { mediaType: { in: getMediaTypeFilter(mediaType) } } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Galeria
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Recentes</h1>
          </div>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
        <form action="/gallery/recent" method="get" className="mt-4 grid gap-3">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
              <label htmlFor="search" className="sr-only">
                Buscar
              </label>
              <Input
                id="search"
                name="search"
                defaultValue={search}
                placeholder="Buscar por nome"
              />
              <label htmlFor="type" className="sr-only">
                Filtrar por tipo
              </label>
              <select
                id="type"
                name="type"
                defaultValue={typeFilter}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Todos</option>
                <option value="waifu">Waifu</option>
                <option value="husbando">Husbando</option>
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label htmlFor="sourceType" className="sr-only">
                Filtrar por SourceType
              </label>
              <select
                id="sourceType"
                name="sourceType"
                defaultValue={sourceType}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Fonte</option>
                {SOURCE_TYPES.filter((type) => type !== "all").map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label htmlFor="mediaType" className="sr-only">
                Filtrar por MediaType
              </label>
              <select
                id="mediaType"
                name="mediaType"
                defaultValue={mediaType}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">Tipo de mídia</option>
                <option value="IMAGE">Fotos</option>
                <option value="VIDEO">Vídeos</option>
              </select>
            </div>
          </div>
          <Button type="submit">
            Buscar
          </Button>
        </form>
      </header>

      <Suspense fallback={<GallerySkeleton />}>
        <GalleryContent
          page={page}
          perPage={perPage}
          skip={skip}
          mediaWhere={mediaWhere}
          search={search}
          typeFilter={typeFilter}
          sourceType={sourceType}
          mediaType={mediaType}
        />
      </Suspense>
    </div>
  );
}

async function GalleryContent({
  page,
  perPage,
  skip,
  mediaWhere,
  search,
  typeFilter,
  sourceType,
  mediaType,
}: {
  page: number;
  perPage: number;
  skip: number;
  mediaWhere: Record<string, unknown>;
  search: string;
  typeFilter: "all" | "waifu" | "husbando";
  sourceType: typeof SOURCE_TYPES[number];
  mediaType: typeof MEDIA_TYPES_FILTER[number];
}) {
  const take = perPage + 1;

  const [waifus, husbandos] = await Promise.all([
    typeFilter !== "husbando"
      ? prisma.characterWaifu.findMany({
          where: mediaWhere as any,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        })
      : Promise.resolve([] as any),
    typeFilter !== "waifu"
      ? prisma.characterHusbando.findMany({
          where: mediaWhere as any,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        })
      : Promise.resolve([] as any),
  ]);

  const waifuHasMore = waifus.length > perPage;
  const husbandoHasMore = husbandos.length > perPage;
  const hasMore = waifuHasMore || husbandoHasMore;

  const raw = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...waifus.slice(0, perPage).map((w: any) => ({ ...w, _type: "waifu" as const })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...husbandos.slice(0, perPage).map((h: any) => ({ ...h, _type: "husbando" as const })),
  ];
const resolved = await Promise.all(
  raw.map(async (item) => {
    const { displayUrl, isVideo } = await resolveMediaUrl(
      item,
      item._type,
    );

    return {
      ...item,
      resolvedUrl: displayUrl,
      isVideo,
    };
  }),
);

const items = resolved
  .filter(
    (
      item,
    ): item is typeof item & {
      resolvedUrl: string;
      isVideo: boolean;
    } =>
      !!item.resolvedUrl &&
      item.resolvedUrl !== "/placeholder.png",
  )
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  function buildHref(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (typeFilter !== "all") sp.set("type", typeFilter);
    if (sourceType !== "all") sp.set("sourceType", sourceType);
    if (mediaType !== "all") sp.set("mediaType", mediaType);
    if (page > 1) sp.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    return `/gallery/recent${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/60 p-12 text-center backdrop-blur-md">
          <p className="text-lg font-semibold text-foreground">Nenhum resultado encontrado</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente ajustar seus filtros de busca.
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
          {items.map((item) => (
          <div
            key={`${item._type}-${item.id}`}
            className="group relative mb-4 inline-block w-full overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-md"
          >
        {item.isVideo ? (
  <video
    src={item.resolvedUrl}
    className="h-auto w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
  />
) : (
  <img
    src={item.resolvedUrl}
    alt={item.name}
    className="h-auto w-full object-cover"
  />
)}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <p className="truncate text-sm font-medium text-white drop-shadow-sm">{item.name}</p>
              <p className="text-[10px] text-white/60">
                {new Date(item.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              item._type === "waifu" ? "bg-pink-500/70 text-white" : "bg-cyan-500/70 text-white"
            }`}>
              {item._type === "waifu" ? "Waifu" : "Husbando"} #{item.id}
            </span>
          </div>
        ))}
        </div>
      )}

      {(page > 1 || hasMore) && items.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildHref({ page: String(page - 1) })}>
                Anterior
              </Link>
            </Button>
          )}
          <span className="text-muted-foreground px-2 text-xs">Página {page}</span>
          {hasMore && (
            <Button asChild variant="outline" size="sm">
              <Link href={buildHref({ page: String(page + 1) })}>
                Próximo
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
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
