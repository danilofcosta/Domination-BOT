"use client";

import { Footer } from "@/components/home/footer";
import { MenuFloating } from "@/components/home/MenuFloating";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/ui/charaterCard";
import { ApiCharacter, Character } from "@/lib/types";
import { CommandIcon, Heart } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function normalizeCharacters(
  waifus: ApiCharacter[],
  husbandos: ApiCharacter[],
): Character[] {
  return [
    ...waifus.map((w) => ({ ...w, type: "waifu" as const })),
    ...husbandos.map((h) => ({ ...h, type: "husbando" as const })),
  ];
}

function HomeContent() {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "recent";
  const isPopular = sort === "likes";

  const [collection, setCollection] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const intersectRef = useRef<HTMLDivElement>(null);
  const take = 24;

  const loadData = async (currentSkip: number, append: boolean) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(`/api/home?skip=${currentSkip}&take=${take}&sort=${sort}`);
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
    sessionStorage.removeItem("home_scroll_data");
    sessionStorage.removeItem("home_scroll_skip");
    setSkip(0);
    setHasMore(true);
    loadData(0, false);
  }, [sort]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
         const nextSkip = skip + take;
         setSkip(nextSkip);
         loadData(nextSkip, true);
      }
    }, { threshold: 0.1 });

    if (intersectRef.current) {
      observer.observe(intersectRef.current);
    }

    return () => observer.disconnect();
  }, [skip, loading, loadingMore, hasMore]);

  return (
    <>
      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
        <div className="flex items-end justify-between mb-6 sm:mb-8 px-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-5 sm:h-6 w-1 bg-primary rounded-full" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter italic">
                {isPopular ? "Mais Populares" : "Adicionados Recentemente"}
              </h2>
            </div>
          </div>
          <Link href="/characters">
            <Button variant="outline" size="sm" className="font-bold text-xs uppercase tracking-widest">
              Ver Todos
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 gap-2 sm:gap-4 px-2">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="break-inside-avoid aspect-2/3 bg-muted animate-pulse rounded-xl sm:rounded-2xl mb-2 sm:mb-4" />
            ))}
          </div>
        ) : collection.length === 0 ? (
          <div className="py-20 sm:py-32 text-center rounded-2xl sm:rounded-[2rem] border-2 border-dashed border-primary/10 bg-muted/20 mx-2">
            <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm sm:text-base">
              Nenhum personagem disponível
            </p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 gap-2 sm:gap-3 lg:gap-4 px-2">
              {collection.map((item) => (
                <div key={`${item.type}-${item.id}`} className="break-inside-avoid mb-2 sm:mb-3 lg:mb-4">
                  <CharacterCard item={item} type={item.type} />
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div ref={intersectRef} className="w-full h-16 sm:h-20 flex items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-primary">
                    <div className="size-4 sm:size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Carregando mais...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
              <CommandIcon className="size-5 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">
              Domination
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/characters">
              <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest">
                Explorar
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest hidden md:flex">
                Admin
              </Button>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 py-6 sm:py-10">
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 gap-2 sm:gap-4 px-2">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="break-inside-avoid aspect-2/3 bg-muted animate-pulse rounded-xl sm:rounded-2xl mb-2 sm:mb-4" />
            ))}
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>

      <MenuFloating />
      <Footer />
    </div>
  );
}
