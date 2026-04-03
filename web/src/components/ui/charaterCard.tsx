"use client"

import * as React from "react"
import Link from "next/link";
import { Character } from "@/lib/types";
import { MediaType } from "../../../generated/prisma/enums";
import { resolveTelegramMedia } from "@/app/admin/actions";

import { CharacterMedia } from "@/components/character-media";

type CharacterCardProps = {
  item: Character;
  type: "waifu" | "husbando";
};

export function CharacterCard({ item, type }: CharacterCardProps) {
  return (
    <Link
      href={`/characters/${item.slug}`}
      className="block break-inside-avoid rounded-2xl overflow-hidden group relative isolate bg-card shadow-sm hover:shadow-xl transition-all duration-500 mb-4"
    >
      <div className="relative aspect-2/3 overflow-hidden">
        <CharacterMedia item={item} type={type} />

        {/* Overlay Progressivo */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Info Container */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <div className="space-y-1">
            <h3 className="text-accent text-lg font-black uppercase tracking-tighter leading-none italic group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest truncate">
              {item.origem}
            </p>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span
              className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border ${
                type === "waifu" 
                  ? "bg-pink-500/10 text-pink-500 border-pink-500/20" 
                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              }`}
            >
              {type}
            </span>
            
            <span className="text-[10px] text-white/40 font-mono">
              #{item.id}
            </span>
          </div>
        </div>
      </div>
      
      {/* Decorative Border on Hover */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/30 rounded-2xl transition-all duration-500 pointer-events-none" />
    </Link>
  );
}