"use client";

import { useState, useCallback } from "react";
import { GalleryLightbox } from "./gallery-lightbox";

type GalleryItem = {
  id: number;
  _type: "waifu" | "husbando";
  name: string;
  resolvedUrl: string;
  isVideo: boolean;
  createdAt: Date;
};

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  return (
    <>
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

      <GalleryLightbox
        items={items}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={closeLightbox}
      />
    </>
  );
}
