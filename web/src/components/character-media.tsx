"use client"

import * as React from "react"
import { Character } from "@/lib/types";
import { MediaType } from "../../generated/prisma/enums";
import { resolveTelegramMedia } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type CharacterMediaProps = {
  item: Character | any; 
  type: "waifu" | "husbando";
  className?: string;
  priority?: boolean;
  fill?: boolean;
};

export function CharacterMedia({ item, type, className, priority, fill }: CharacterMediaProps) {
  const [url, setUrl] = React.useState<string | null>(null);

  
  // Extrair tipo de mídia com segurança
  const mediaType = item?.mediaType || MediaType.IMAGE_URL;
  const isVideo = mediaType === MediaType.VIDEO_URL || mediaType === MediaType.VIDEO_FILEID;
  const isFileId = mediaType === MediaType.IMAGE_FILEID || mediaType === MediaType.VIDEO_FILEID;
  const islocal = mediaType === MediaType.IMAGE_LOCAL || mediaType === MediaType.VIDEO_LOCAL;

  React.useEffect(() => {
    let isMounted = true;

    async function resolve() {
      // 1. Caso base: URL direta (ou se não for um FileID)
      if (!isFileId) {
        if (isMounted) setUrl(item?.media || "/placeholder.png"); 
        return;
      }

      // 2. Cache: Se o banco já tiver o linkweb (presumindo que o Admin injetou o dado)
      if (item?.linkweb) {
        if (isMounted) setUrl(item?.linkweb);
        return;
      }

      // 3. Fallback: Buscar do Telegram via Server Action
      try {
        const resolved = await resolveTelegramMedia(item?.media!, type);
        if (isMounted && resolved) setUrl(resolved);
      } catch (err) {
        console.error("Erro ao resolver mídias:", err);
        if (isMounted) setUrl("/placeholder.png");
      }
    }

    resolve();
    return () => { isMounted = false; };
  }, [item?.media, item?.linkweb, type, isFileId]);

  const baseClasses = cn(
    "w-full h-full object-cover transition-all duration-700",
    className
  );

  // Placeholder de carregamento enquanto o link é resolvido (somente para FileIDs)
  if (!url && isFileId) {
    return (
      <div className={cn("w-full h-full bg-muted animate-pulse flex items-center justify-center", className)}>
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  

  // Fallback visual
  const finalUrl = url || "/placeholder.png";

  if (isVideo) {
    return (
      <video
        src={finalUrl}
        autoPlay
        loop
        muted
        playsInline
        className={baseClasses}
      />
    );
  }

  return (
    <img
      src={finalUrl}
      alt={item?.name || "Character"}
      className={baseClasses}
      loading={priority ? "eager" : "lazy"}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/placeholder.png";
      }}
    />
  );
}
