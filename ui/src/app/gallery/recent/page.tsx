import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/telegram/resolveMediaUrl";
import Link from "next/link";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const ITEMS_PER_PAGE = 30;

export default async function GalleryRecentPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const page = Math.max(1, typeof params.page === "string" ? Number(params.page) || 1 : 1);

  const perPage = ITEMS_PER_PAGE;
  const skip = (page - 1) * perPage;

  const mediaWhere = { mediaType: { in: ["IMAGE_URL", "IMAGE_FILEID"] as any } };

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
      </header>

      <Suspense fallback={<GallerySkeleton />}>
        <GalleryContent page={page} perPage={perPage} skip={skip} mediaWhere={mediaWhere} />
      </Suspense>
    </div>
  );
}

async function GalleryContent({
  page,
  perPage,
  skip,
  mediaWhere,
}: {
  page: number;
  perPage: number;
  skip: number;
  mediaWhere: Record<string, unknown>;
}) {
  const take = perPage + 1;

  const [waifus, husbandos] = await Promise.all([
    prisma.characterWaifu.findMany({
      where: mediaWhere as any,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.characterHusbando.findMany({
      where: mediaWhere as any,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  const waifuHasMore = waifus.length > perPage;
  const husbandoHasMore = husbandos.length > perPage;
  const hasMore = waifuHasMore || husbandoHasMore;

  const raw = [
    ...waifus.slice(0, perPage).map((w) => ({ ...w, _type: "waifu" as const })),
    ...husbandos.slice(0, perPage).map((h) => ({ ...h, _type: "husbando" as const })),
  ];

  const resolved = await Promise.all(
    raw.map(async (item) => ({
      ...item,
      resolvedUrl: (await resolveMediaUrl(item, item._type)).displayUrl,
    })),
  );

  const items = resolved
    .filter((item): item is typeof item & { resolvedUrl: string } =>
      !!item.resolvedUrl && item.resolvedUrl !== "/placeholder.png")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  function buildHref(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
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
      <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
        {items.map((item) => (
          <div
            key={`${item._type}-${item.id}`}
            className="group relative mb-4 inline-block w-full overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-md"
          >
            <img
              src={item.resolvedUrl}
              alt={item.name}
              className="h-auto w-full object-cover"
            />
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

      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
            >
              Anterior
            </Link>
          )}
          <span className="text-muted-foreground px-2 text-xs">Página {page}</span>
          {hasMore && (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
            >
              Próximo
            </Link>
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
