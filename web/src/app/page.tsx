"use client";

import { Footer } from "@/components/home/footer";
import { MenuFloating } from "@/components/home/MenuFloating";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/ui/charaterCard";
import { ApiCharacter, Character } from "@/lib/types";
import { CommandIcon } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";
function normalizeCharacters(
  waifus: ApiCharacter[],
  husbandos: ApiCharacter[],
): Character[] {
  return [
    ...waifus.map((w) => ({ ...w, type: "waifu" as const })),
    ...husbandos.map((h) => ({ ...h, type: "husbando" as const })),
  ];
}

export default function Home() {
  const [collection, setCollection] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/home");
        const data = await res.json();
        const normalized = normalizeCharacters(
          data.waifus || [],
          data.husbandos || [],
        );
        setCollection(normalized);
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCollection = collection.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.origem.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-linear-to-tl   h-screen ">
      {/* <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
              <CommandIcon className="size-5 text-primary" />
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter hidden sm:block">
              Domination
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                variant="ghost"
                className="font-bold text-xs uppercase tracking-widest hidden sm:flex"
              >
                Admin
              </Button>
            </Link>
            <div className="h-4 w-px bg-border mx-2" />
            <ThemeToggle />
          </nav>
        </div>
      </header> */}

      {/* 🖼️ MASONRY FEED */}
      <main className=" mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg ">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h2 className="sm:text-3xl font-black uppercase tracking-tighter italic">
                Adicionados Recentemente
              </h2>
            </div>
            {/* <p className="text-xs text-muted-foreground uppercase tracking-widest ml-4">Monitoramento de Feed_Híbrido</p> */}
          </div>

          {/* <div className="hidden md:flex gap-2">
                    <span className="text-sm font-bold text-muted-foreground/40 italic">Sincronizado via Node_Cluster_Delta</span>
                 </div> */}
        </div>

        {loading ? (
          <div className="columns-2 md:columns-6 lg:columns-8 gap-2 space-y-6 px-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid aspect-2/3 bg-muted animate-pulse rounded-2xl mb-6"
              />
            ))}
          </div>
        ) : filteredCollection.length === 0 ? (
          <div className="py-32 text-center rounded-[3rem] border-2 border-dashed border-primary/5 bg-muted/20">
            <p className="text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
              Nenhuma Personagem Encontrado
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4">
            {filteredCollection.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="break-inside-avoid mb-6 animate-in fade-in zoom-in duration-700"
              >
                <CharacterCard item={item} type={item.type} />
              </div>
            ))}
          </div>
        )}
      </main>

      <MenuFloating></MenuFloating>
      <Footer />
    </div>
  );
}

//
