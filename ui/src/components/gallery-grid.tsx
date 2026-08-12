"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GalleryLightbox } from "./gallery-lightbox";
import { LoaderIcon } from "lucide-react";

type GalleryItem = {
  id: number;
  _type: "waifu" | "husbando";
  name: string;
  resolvedUrl: string;
  isVideo: boolean;
  createdAt: Date;
};

type GalleryFilters = {
  search?: string;
  type?: string;
  sourceType?: string;
  mediaType?: string;
  rarityId?: string;
  eventId?: string;
  sort?: string;
};

interface GalleryGridProps {
  initialItems: GalleryItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
  filters: GalleryFilters;
  canManageCharacters: boolean;
}

export function GalleryGrid({
  initialItems,
  initialCursor,
  initialHasMore,
  filters,
  canManageCharacters,
}: GalleryGridProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
    setLoading(false);
    loadingRef.current = false;
  }, [filtersKey]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !cursor) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    loadingRef.current = true;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("cursor", cursor);
      if (filters.search) params.set("search", filters.search);
      if (filters.type && filters.type !== "all") params.set("type", filters.type);
      if (filters.sourceType && filters.sourceType !== "all")
        params.set("sourceType", filters.sourceType);
      if (filters.mediaType && filters.mediaType !== "all")
        params.set("mediaType", filters.mediaType);
      if (filters.rarityId && filters.rarityId !== "all")
        params.set("rarityId", filters.rarityId);
      if (filters.eventId && filters.eventId !== "all")
        params.set("eventId", filters.eventId);
      if (filters.sort) params.set("sort", filters.sort);

      const res = await fetch(`/api/gallery?${params}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Falha ao carregar mais itens");

      const data = await res.json();

      setItems((prev) => {
        const map = new Map<string, GalleryItem>();
        for (const item of prev) {
          map.set(`${item._type}-${item.id}`, item);
        }
        for (const item of data.items) {
          map.set(`${item._type}-${item.id}`, item);
        }
        return [...map.values()];
      });

      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
    } finally {
      if (!controller.signal.aborted) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [cursor, filters]);

  useEffect(() => {
    if (!hasMore || loadingRef.current) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleItemDeleted = useCallback(
    (type: "waifu" | "husbando", id: number) => {
      setItems((prev) => prev.filter((x) => !(x._type === type && x.id === id)));
      setLightboxOpen(false);
    },
    [],
  );

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {items.length === 1
            ? "1 personagem"
            : `${items.length} personagens`}
        </p>
      </div>

      <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6">
        {items.map((item, index) => (
          <button
            key={`${item._type}-${item.id}`}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative mb-4 inline-block w-full overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-md text-left cursor-pointer"
          >
            {item.isVideo ? (
              <video
                src={item.resolvedUrl}
                className="h-auto w-full object-cover"
                autoPlay
                muted
                poster="poster.jpg"
                //loop
                playsInline
              />
            ) : (
              <img
                loading="lazy"
                src={item.resolvedUrl}
                alt={item.name}
                className="h-auto w-full object-cover"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <p className="truncate text-sm font-medium text-white drop-shadow-sm">
                {item.name}
              </p>
              <p className="text-[10px] text-white/60">
                {new Date(item.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <span
              className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                item._type === "waifu"
                  ? "bg-pink-500/70 text-white"
                  : "bg-cyan-500/70 text-white"
              }`}
            >
              {item._type === "waifu" ? "Waifu" : "Husbando"} #{item.id}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {hasMore && !loading && <div ref={sentinelRef} className="h-4" />}

      {!hasMore && items.length > 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">
          acabou :(
        </p>
      )}

      {items.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/70 bg-card/60 p-12 text-center backdrop-blur-md">
          <p className="text-lg font-semibold text-foreground">
            Nenhum resultado encontrado
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente ajustar seus filtros de busca.
          </p>
        </div>
      )}

      <GalleryLightbox
        items={items}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={closeLightbox}
        canManageCharacters={canManageCharacters}
        onItemDeleted={handleItemDeleted}
      />
    </>
  );
}
