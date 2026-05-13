"use client"

import { useState, useEffect } from "react"
import { useInfiniteCharacters } from "@/hooks"
import { CharacterCard } from "@/components/character-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [search, setSearch] = useState("")
  const [activeType, setActiveType] = useState<"all" | "waifu" | "husbando">("all")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCharacters(
    activeType === "all" ? undefined : activeType,
    debouncedSearch || undefined,
    30,
  )

  const characters = data?.pages.flatMap((p) => p.data) ?? []

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    )

    const target = document.getElementById("scroll-trigger")
    if (target) observer.observe(target)

    return () => observer.disconnect()
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  return (
    <div className="bg-background min-h-screen">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="mx-auto max-w-[1800px] px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary animate-pulse" />
            <h1 className="font-heading text-xl font-bold tracking-tight">Explorar</h1>
          </div>

          <div className="flex w-full md:max-w-md items-center relative">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar personagens ou obras..."
              className="pl-10 h-10 bg-muted/50 border-none ring-offset-background focus-visible:ring-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-full overflow-hidden">
            <Button
              variant={activeType === "all" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full h-8 text-xs px-4 border-2"
              onClick={() => setActiveType("all")}
            >
              Tudo
            </Button>
            <Button
              variant={activeType === "waifu" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full h-8 text-xs px-4"
              onClick={() => setActiveType("waifu")}
            >
              Waifus
            </Button>
            <Button
              variant={activeType === "husbando" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full h-8 text-xs px-4"
              onClick={() => setActiveType("husbando")}
            >
              Husbandos
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1800px] px-6 py-8">
        {isLoading && characters.length === 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="mb-4 break-inside-avoid">
                <Skeleton className="w-full rounded-2xl h-[250px]" style={{ height: `${200 + (i % 3) * 100}px` }} />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : characters.length > 0 ? (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4">
              {characters.map((char) => (
                <CharacterCard key={`${char.type}-${char.id}`} character={char} />
              ))}
            </div>
            {isFetchingNextPage && (
              <div className="flex justify-center py-10">
                <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div id="scroll-trigger" className="h-10" />
            {!hasNextPage && characters.length > 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">
                Você chegou ao fim da lista. ✨
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Filter className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum personagem encontrado</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Tente ajustar seus filtros ou termos de pesquisa para encontrar o que procura.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
