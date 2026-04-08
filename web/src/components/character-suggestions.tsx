import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CharacterMedia } from "@/components/character-media";
import { Badge } from "@/components/ui/badge";
import { SparklesIcon, ShuffleIcon } from "lucide-react";

interface CharacterSuggestionsProps {
  character: {
    id: number;
    slug: string;
    name: string;
    origem: string;
    sourceType: string;
    WaifuEvent?: { eventId: number }[];
    HusbandoEvent?: { eventId: number }[];
    WaifuRarity?: { rarityId: number }[];
    HusbandoRarity?: { rarityId: number }[];
  };
  type: "waifu" | "husbando";
}

export async function CharacterSuggestions({ character, type }: CharacterSuggestionsProps) {
  const eventIds = character.WaifuEvent?.map((e: any) => e.eventId) 
    || character.HusbandoEvent?.map((e: any) => e.eventId) 
    || [];
  
  const rarityIds = character.WaifuRarity?.map((r: any) => r.rarityId)
    || character.HusbandoRarity?.map((r: any) => r.rarityId)
    || [];

  const isWaifu = type === "waifu";
  const model = isWaifu ? prisma.characterWaifu : prisma.characterHusbando;
  const eventRelation = isWaifu ? "WaifuEvent" : "HusbandoEvent";
  const rarityRelation = isWaifu ? "WaifuRarity" : "HusbandoRarity";

  let suggestions: any[] = [];

  if (eventIds.length > 0) {
    suggestions = await (model as any).findMany({
      where: {
        id: { not: character.id },
        OR: [
          { origem: character.origem },
          { [eventRelation]: { some: { eventId: { in: eventIds } } } },
          { [rarityRelation]: { some: { rarityId: { in: rarityIds } } } },
        ],
      },
      take: 8,
      orderBy: { popularity: "desc" },
      include: {
        [rarityRelation]: { include: { Rarity: true } },
      },
    });
  }

  if (suggestions.length < 4) {
    const relatedByOrigem = await (model as any).findMany({
      where: {
        id: { not: character.id },
        origem: character.origem,
      },
      take: 8 - suggestions.length,
      orderBy: { createdAt: "desc" },
      include: {
        [rarityRelation]: { include: { Rarity: true } },
      },
    });
    
    const existingIds = new Set(suggestions.map((s: any) => s.id));
    suggestions = [...suggestions, ...relatedByOrigem.filter((r: any) => !existingIds.has(r.id))];
  }

  if (suggestions.length < 4) {
    const randomChars = await (model as any).findMany({
      where: { id: { not: character.id } },
      take: 8,
      orderBy: { likes: "desc" },
      include: {
        [rarityRelation]: { include: { Rarity: true } },
      },
    });
    
    const existingIds = new Set(suggestions.map((s: any) => s.id));
    suggestions = [...suggestions, ...randomChars.filter((r: any) => !existingIds.has(r.id))];
  }

  suggestions = suggestions.slice(0, 8);

  if (suggestions.length === 0) return null;

  const hasSameOrigem = suggestions.some((s: any) => s.origem === character.origem);
  const hasSameEvent = suggestions.some((s: any) => 
    (s.WaifuEvent || s.HusbandoEvent)?.some((e: any) => eventIds.includes(e.eventId))
  );

  let title = "Sugestões";
  if (hasSameEvent) title = `Mais de ${character.origem}`;
  else if (hasSameOrigem) title = `Do Mesmo Universo`;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        {hasSameEvent ? (
          <SparklesIcon className="size-6 text-primary" />
        ) : (
          <ShuffleIcon className="size-6 text-primary" />
        )}
        <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">
          {title}
        </h2>
        {hasSameEvent && (
          <Badge variant="outline" className="text-xs font-bold">
            {character.origem}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {suggestions.map((char: any) => {
          const slug = `${char.slug}_${type}`;
          const rarities = char[rarityRelation] || [];
          const topRarity = rarities[0]?.Rarity;

          return (
            <Link
              key={char.id}
              href={`/characters/${slug}`}
              className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-muted"
            >
              <CharacterMedia
                item={char}
                type={type}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {topRarity && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg text-sm">
                  {topRarity.emoji}
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider truncate opacity-60">
                  {char.origem}
                </p>
                <h3 className="text-sm sm:text-lg font-black uppercase italic tracking-tight leading-tight line-clamp-2">
                  {char.name}
                </h3>
              </div>

              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-2xl sm:rounded-3xl transition-colors" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
