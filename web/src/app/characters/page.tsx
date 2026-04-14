"use client";

import { Footer } from "@/components/home/footer";
import { MenuFloating } from "@/components/home/MenuFloating";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CharacterCard } from "@/components/ui/charaterCard";
import { ApiCharacter, Character } from "@/lib/types";
import { CommandIcon, SearchIcon, SlidersHorizontal, X, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type CharacterType = "all" | "waifu" | "husbando";
type SortBy = "recent" | "old" | "likes" | "name";

export default function CharactersPage() {
  const [collection, setCollection] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [characterType, setCharacterType] = useState<CharacterType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [filters, setFilters] = useState({
    rarity: "",
    event: "",
    sourceType: "",
    anime: "",
  });
  const [options, setOptions] = useState({
    rarities: [] as { id: number; name: string; emoji: string }[],
    events: [] as { id: number; name: string; emoji: string }[],
    sourceTypes: ["ANIME", "GAME", "MANGA", "MOVIE"],
    animeNames: [] as string[],
  });

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchFiltersOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/characters/filters");
      if (res.ok) {
        const data = await res.json();
        setOptions({
          rarities: data.rarities || [],
          events: data.events || [],
          sourceTypes: ["ANIME", "GAME", "MANGA", "MOVIE"],
          animeNames: data.animeNames || [],
        });
      }
    } catch (err) {
      console.error("Erro ao carregar filtros:", err);
    }
  }, []);

  const fetchCharacters = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      const params = new URLSearchParams();
      if (characterType !== "all") params.set("type", characterType);
      params.set("sort", sortBy);
      params.set("page", pageNum.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filters.rarity) params.set("rarity", filters.rarity);
      if (filters.event) params.set("event", filters.event);
      if (filters.sourceType) params.set("sourceType", filters.sourceType);
      if (filters.anime) params.set("anime", filters.anime);

      const res = await fetch(`/api/characters?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao buscar personagens");
      
      const data = await res.json();
      const normalized = normalizeCharacters(data.waifus || [], data.husbandos || []);
      
      if (append) {
        setCollection(prev => [...prev, ...normalized]);
      } else {
        setCollection(normalized);
      }
      
      // Se não retornou nada ou retornou menos que o esperado, pode ser o fim
      setHasMore(normalized.length >= 24);
    } catch (err) {
      console.error("Erro ao carregar personagens:", err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [characterType, sortBy, debouncedSearch, filters]);

  useEffect(() => {
    fetchFiltersOptions();
  }, [fetchFiltersOptions]);

  useEffect(() => {
    setPage(1);
    fetchCharacters(1, false);
  }, [characterType, sortBy, debouncedSearch, filters, fetchCharacters]);

  const loadMore = useCallback(() => {
    if (!fetchingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCharacters(nextPage, true);
    }
  }, [fetchingMore, hasMore, loading, page, fetchCharacters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !fetchingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = document.querySelector("#infinite-scroll-trigger");
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, fetchingMore]);

  const hasActiveFilters = filters.rarity || filters.event || filters.sourceType || filters.anime;

  const clearFilters = () => {
    setFilters({ rarity: "", event: "", sourceType: "", anime: "" });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
              <CommandIcon className="size-5 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">
              Explorar
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/">
              <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest">
                Início
              </Button>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
        {/* Search and Filters Toggle */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou anime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-11 bg-muted/50 border-primary/10 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 w-11 shrink-0 ${showFilters || hasActiveFilters ? "bg-primary/10 border-primary/30" : ""}`}
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-muted/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Filtros</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                    <X className="size-3 mr-1" /> Limpar
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={filters.rarity} onValueChange={(v) => setFilters(f => ({ ...f, rarity: v }))}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Raridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.rarities.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.emoji} {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.event} onValueChange={(v) => setFilters(f => ({ ...f, event: v }))}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.events.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.emoji} {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.sourceType} onValueChange={(v) => setFilters(f => ({ ...f, sourceType: v }))}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Tipo de Mídia" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.sourceTypes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.anime} onValueChange={(v) => setFilters(f => ({ ...f, anime: v }))}>
                  <SelectTrigger className="h-10 bg-background">
                    <SelectValue placeholder="Anime" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.animeNames.map((anime) => (
                      <SelectItem key={anime} value={anime}>
                        {anime}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Badges */}
          {hasActiveFilters && !showFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.rarity && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                  {options.rarities.find(r => r.id.toString() === filters.rarity)?.emoji} Raridade
                  <button onClick={() => setFilters(f => ({ ...f, rarity: "" }))} className="ml-1 hover:bg-muted rounded p-0.5">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.event && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                  {options.events.find(e => e.id.toString() === filters.event)?.emoji} Evento
                  <button onClick={() => setFilters(f => ({ ...f, event: "" }))} className="ml-1 hover:bg-muted rounded p-0.5">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.sourceType && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                  {filters.sourceType}
                  <button onClick={() => setFilters(f => ({ ...f, sourceType: "" }))} className="ml-1 hover:bg-muted rounded p-0.5">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {filters.anime && (
                <Badge variant="secondary" className="gap-1 pl-2 pr-1">
                  {filters.anime}
                  <button onClick={() => setFilters(f => ({ ...f, anime: "" }))} className="ml-1 hover:bg-muted rounded p-0.5">
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Type Tabs and Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {(["all", "waifu", "husbando"] as CharacterType[]).map((type) => (
              <Button
                key={type}
                variant={characterType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => setCharacterType(type)}
                className={`font-bold text-xs uppercase tracking-wider ${
                  characterType === type 
                    ? type === "waifu" ? "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30" 
                    : type === "husbando" ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                    : ""
                    : ""
                }`}
              >
                {type === "all" ? "Todos" : type === "waifu" ? "Waifus" : "Husbandos"}
              </Button>
            ))}
          </div>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="h-9 w-auto min-w-[140px] bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="old">Mais Antigos</SelectItem>
              <SelectItem value="likes">Mais Curtidos</SelectItem>
              <SelectItem value="name">Ordem Alfabética</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {loading ? "Carregando..." : `${collection.length} personagem(ns) encontrado(s)`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 gap-2 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="break-inside-avoid aspect-2/3 bg-muted animate-pulse rounded-xl mb-2 sm:mb-4" />
            ))}
          </div>
        ) : collection.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-primary/10 bg-muted/20">
            <SparklesIcon className="size-12 text-primary/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-bold uppercase tracking-wider">
              Nenhum personagem encontrado
            </p>
            {(debouncedSearch || hasActiveFilters) && (
              <Button variant="ghost" className="mt-4" onClick={() => { setSearch(""); clearFilters(); }}>
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-6 gap-2 sm:gap-3 lg:gap-4">
            {collection.map((item) => (
              <div key={`${item.type}-${item.id}`} className="break-inside-avoid mb-2 sm:mb-3 lg:mb-4">
                <CharacterCard item={item} type={item.type} />
              </div>
            ))}
          </div>
        )}

        {/* Loading trigger for infinite scroll */}
        <div id="infinite-scroll-trigger" className="h-20 flex items-center justify-center">
          {fetchingMore && (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <SparklesIcon className="size-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Carregando mais...</span>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MenuFloating />
    </div>
  );
}

function normalizeCharacters(waifus: ApiCharacter[], husbandos: ApiCharacter[]): Character[] {
  return [
    ...waifus.map((w) => ({ ...w, type: "waifu" as const })),
    ...husbandos.map((h) => ({ ...h, type: "husbando" as const })),
  ];
}
