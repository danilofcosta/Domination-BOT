import { prisma } from "@/lib/prisma";
import { CreateCharacterDialog } from "@/components/create-character-dialog";

export const dynamic = "force-dynamic";

async function getStats() {
  const [waifuAgg, husbandoAgg, topWaifu, topHusbando, allRarities, allEvents] = await Promise.all([
    prisma.characterWaifu.aggregate({
      _count: true,
      _sum: { likes: true, dislikes: true },
      _avg: { popularity: true },
    }),
    prisma.characterHusbando.aggregate({
      _count: true,
      _sum: { likes: true, dislikes: true },
      _avg: { popularity: true },
    }),
    prisma.characterWaifu.findMany({
      orderBy: { popularity: "desc" },
      take: 5,
      select: { id: true, name: true, origem: true, popularity: true, likes: true, dislikes: true },
    }),
    prisma.characterHusbando.findMany({
      orderBy: { popularity: "desc" },
      take: 5,
      select: { id: true, name: true, origem: true, popularity: true, likes: true, dislikes: true },
    }),
    prisma.rarity.findMany({ orderBy: { name: "asc" } }),
    prisma.event.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { waifuAgg, husbandoAgg, topWaifu, topHusbando, allRarities, allEvents };
}

export default async function CharactersHome() {
  const { waifuAgg, husbandoAgg, topWaifu, topHusbando, allRarities, allEvents } = await getStats();

  const totalWaifu = waifuAgg._count;
  const totalHusbando = husbandoAgg._count;
  const totalCharacters = totalWaifu + totalHusbando;
  const totalLikes = (waifuAgg._sum.likes ?? 0) + (husbandoAgg._sum.likes ?? 0);
  const totalDislikes = (waifuAgg._sum.dislikes ?? 0) + (husbandoAgg._sum.dislikes ?? 0);
  const avgPopularity =
    totalCharacters > 0
      ? Math.round(
          ((waifuAgg._avg.popularity ?? 0) * totalWaifu +
            (husbandoAgg._avg.popularity ?? 0) * totalHusbando) /
            totalCharacters
        )
      : 0;

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Personagens
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Estatísticas de Personagens
            </h1>
          </div>
          <div className="flex gap-2">
            <CreateCharacterDialog type="waifu" allRarities={allRarities} allEvents={allEvents} />
            <CreateCharacterDialog type="husbando" allRarities={allRarities} allEvents={allEvents} />
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Personagens" value={totalCharacters} />
        <StatCard label="Total de Waifus" value={totalWaifu} />
        <StatCard label="Total de Husbandos" value={totalHusbando} />
        <StatCard label="Popularidade Média" value={avgPopularity} />
        <StatCard label="Total de Likes" value={totalLikes} />
        <StatCard label="Total de Dislikes" value={totalDislikes} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RankingSection title="Top 5 Waifus" items={topWaifu} />
        <RankingSection title="Top 5 Husbandos" items={topHusbando} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}

function RankingSection({
  title,
  items,
}: {
  title: string;
  items: { id: number; name: string; origem: string; popularity: number; likes: number; dislikes: number }[];
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full bg-border/50 text-xs font-bold">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-muted-foreground text-xs">{item.origem}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-400">+{item.likes}</span>
              <span className="text-red-400">-{item.dislikes}</span>
              <span className="text-muted-foreground font-semibold">{item.popularity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
