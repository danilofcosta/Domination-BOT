"use client";

import { Footer } from "@/components/home/footer";
import { MenuFloating } from "@/components/home/MenuFloating";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/ui/charaterCard";
import { ApiCharacter, Character } from "@/lib/types";
import { CommandIcon } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useState, useRef, useEffect } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const intersectRef = useRef<HTMLDivElement>(null);
  const take = 20;

  const loadData = async (currentSkip: number, append: boolean) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(`/api/home?skip=${currentSkip}&take=${take}`);
      const data = await res.json();
      const normalized = normalizeCharacters(data.waifus || [], data.husbandos || []);
      
      if (normalized.length === 0) {
        setHasMore(false);
      } else {
        setCollection(prev => {
          let newCollection;
          if (append) {
             const existingIds = new Set(prev.map(p => `${p.type}-${p.id}`));
             const uniqueNew = normalized.filter(n => !existingIds.has(`${n.type}-${n.id}`));
             newCollection = [...prev, ...uniqueNew];
          } else {
             newCollection = normalized;
          }
          
          sessionStorage.setItem("home_scroll_data", JSON.stringify(newCollection));
          sessionStorage.setItem("home_scroll_skip", currentSkip.toString());
          return newCollection;
        });
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useLayoutEffect(() => {
    const savedSkip = sessionStorage.getItem("home_scroll_skip");
    const savedData = sessionStorage.getItem("home_scroll_data");

    if (savedSkip && savedData) {
      setSkip(parseInt(savedSkip, 10));
      setCollection(JSON.parse(savedData));
      setLoading(false);
    } else {
      setSkip(0);
      setHasMore(true);
      loadData(0, false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && !loadingMore && hasMore && search === "") {
         const nextSkip = skip + take;
         setSkip(nextSkip);
         loadData(nextSkip, true);
      }
    }, { threshold: 0.1 });

    if (intersectRef.current) {
      observer.observe(intersectRef.current);
    }

    return () => observer.disconnect();
  }, [skip, loading, loadingMore, hasMore, search]);

  const filteredCollection = collection.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.origem.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-linear-to-tl   h-screen ">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/20">
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
      </header>

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
          <div className="columns-5 m-auto md:columns-6 lg:columns-8 gap-2 space-y-6 px-2">
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
              Nenhum Personagem Encontrado
            </p>
          </div>
        ) : (
          <>
            <div className="columns-2 md:columns-3 lg:columns-6 gap-4  p-4">
              {filteredCollection.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="break-inside-avoid mb-6 animate-in fade-in zoom-in duration-700"
                >
                  <CharacterCard item={item} type={item.type} />
                </div>
              ))}
            </div>
            
            {/* Infinite Scroll Trigger */}
            {hasMore && search === "" && (
              <div ref={intersectRef} className="w-full h-20 flex items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-primary opacity-60">
                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Carregando mais...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <MenuFloating></MenuFloating>
      <Footer />
    </div>
  );
}

//
