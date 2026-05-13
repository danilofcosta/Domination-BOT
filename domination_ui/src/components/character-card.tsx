"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { resolveCharacterMedia } from "@/lib/resolve-media"
import type { Character } from "@/lib/types"
import { Heart, MessageCircle } from "lucide-react"

 export interface CharacterCardProps {
  character: Character
  className?: string
}

export function CharacterCard({ character, className }: CharacterCardProps) {
  let { displayUrl , isVideo } = resolveCharacterMedia(character
  )
  if (!displayUrl) {
    displayUrl = "/video-placeholder.png"
    isVideo = false

  }
  const rarities = "WaifuRarity" in character
    ? character.WaifuRarity
    : "HusbandoRarity" in character
    ? character.HusbandoRarity
    : []

  const rarity = rarities?.[0]?.Rarity

  return (
    <div className={cn("group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-muted/50 transition-all hover:shadow-xl border border-border/40", className)}>
      <Link href={`/home/detail/${character.slug}`} className="block relative aspect-auto min-h-[100px] bg-muted">

        {isVideo ? (
          <video
            src={displayUrl}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            autoPlay
            loop
            muted
          />
        ) : (
          <img
            src={displayUrl}
            alt={character.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {rarity && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              className="bg-white/90 text-black backdrop-blur-sm border-none font-bold text-[10px] uppercase tracking-wider hover:bg-white"
            >
              {rarity.emoji} {rarity.name}
            </Badge>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col p-4 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <div className="flex items-center justify-between text-white">
            <div className="flex gap-3">
              <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                <Heart className="size-4" />
                <span className="text-xs font-medium">{character.likes || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                <MessageCircle className="size-4" />
                <span className="text-xs font-medium">0</span>
              </button>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-3">
        <h3 className="font-sans text-sm font-bold truncate leading-tight">
          {character.name}
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground font-medium truncate uppercase tracking-tighter">
          {character.id} &bull; {character.origem} &bull; {character.sourceType}
        </p>
      </div>
    </div>
  )
}
