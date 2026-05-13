import { fetchCharacterBySlug } from "@/lib/api"
import { resolveCharacterMedia } from "@/lib/resolve-media"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface DetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CharacterDetailPage({ params }: DetailPageProps) {
  const { slug } = await params
  const character = await fetchCharacterBySlug(slug)

  if (!character) {
    return notFound()
  }

  const { displayUrl, isVideo } = resolveCharacterMedia(character)

  const rarities = "WaifuRarity" in character
    ? character.WaifuRarity
    : "HusbandoRarity" in character
    ? character.HusbandoRarity
    : []

  const rarity = rarities?.[0]?.Rarity

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-4">
          <Link href="/home" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="font-heading text-xl font-bold tracking-tight">Detalhes do Personagem</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          <div className="relative rounded-3xl overflow-hidden bg-muted/50 border border-border/40 shadow-2xl flex justify-center items-center">
            {isVideo ? (
              <video
                src={displayUrl ?? "/placeholder.png"}
                controls
                className="w-full h-auto max-h-[50vh] md:max-h-[80vh] object-contain"
              />
            ) : (
              <img
                src={displayUrl ?? "/placeholder.png"}
                alt={character.name}
                className="w-full h-auto max-h-[50vh] md:max-h-[80vh] object-contain md:object-cover"
              />
            )}
            {rarity && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-white/90 text-black backdrop-blur-sm border-none font-bold text-xs uppercase tracking-wider px-3 py-1">
                  {rarity.emoji} {rarity.name}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Sparkles className="size-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">{character.type}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2">
                {character.name}
              </h2>
              <p className="text-muted-foreground text-lg uppercase tracking-widest font-medium">
                {character.origem} &bull; {character.sourceType}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-muted/30 border border-border/40">
              <h3 className="font-semibold text-lg mb-4">Estatísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm">Likes</span>
                  <span className="text-2xl font-bold">{character.likes || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground text-sm">ID Interno</span>
                  <span className="text-2xl font-bold">#{character.id}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
