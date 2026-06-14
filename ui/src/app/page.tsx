import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Activity = {
  type: string;
  label: string;
  detail: string;
  extra?: string;
  updatedAt: Date;
};

export default async function Home() {
  const [recentGroups, recentWaifus, recentHusbandos, recentHusbandoCols, recentWaifuCols] = await Promise.all([
    prisma.telegramGroup.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.characterWaifu.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { WaifuRarity: { include: { Rarity: true } }, WaifuEvent: { include: { Event: true } } },
    }),
    prisma.characterHusbando.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { HusbandoRarity: { include: { Rarity: true } }, HusbandoEvent: { include: { Event: true } } },
    }),
    prisma.husbandoCollection.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { CharacterHusbando: true, User: true },
    }),
    prisma.waifuCollection.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { CharacterWaifu: true, User: true },
    }),
  ]);

  const [waifuTotal, husbandoTotal, userTotal, groupTotal] = await Promise.all([
    prisma.characterWaifu.count(),
    prisma.characterHusbando.count(),
    prisma.user.count(),
    prisma.telegramGroup.count(),
  ]);

  const recentCollections = [...recentHusbandoCols, ...recentWaifuCols];

  const activities: Activity[] = [
    ...recentGroups.map((g) => ({
      type: "group" as const,
      label: "Grupo",
      detail: g.groupName,
      extra: `ID ${g.groupId}`,
      updatedAt: g.updatedAt,
    })),
    ...recentWaifus.map((w) => {
      const rarities = w.WaifuRarity.map((r) => r.Rarity.name).join(", ");
      const events = w.WaifuEvent.map((e) => e.Event.name).join(", ");
      const extra = [w.origem, rarities && `★ ${rarities}`, events && `◆ ${events}`].filter(Boolean).join(" · ");
      return { type: "waifu" as const, label: "Waifu", detail: w.name, extra, updatedAt: w.updatedAt };
    }),
    ...recentHusbandos.map((h) => {
      const rarities = h.HusbandoRarity.map((r) => r.Rarity.name).join(", ");
      const events = h.HusbandoEvent.map((e) => e.Event.name).join(", ");
      const extra = [h.origem, rarities && `★ ${rarities}`, events && `◆ ${events}`].filter(Boolean).join(" · ");
      return { type: "husbando" as const, label: "Husbando", detail: h.name, extra, updatedAt: h.updatedAt };
    }),
    ...recentCollections.map((c) => {
      const userData = c.User.telegramData as Record<string, unknown> | null;
      const userName = (userData?.first_name as string) ?? `#${c.userId}`;
      const isHusbando = "CharacterHusbando" in c;
      const characterName = isHusbando
        ? (c as any).CharacterHusbando?.name
        : (c as any).CharacterWaifu?.name;
      return {
        type: isHusbando ? "collection-h" as const : "collection-w" as const,
        label: isHusbando ? "Coleção H" : "Coleção W",
        detail: `${userName} adicionou ${characterName}`,
        extra: `x${c.count}`,
        updatedAt: c.updatedAt,
      };
    }),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Painel
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {greeting()}, admin Domination
            </h1>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Waifus" value={waifuTotal} />
        <StatCard label="Husbandos" value={husbandoTotal} />
        <StatCard label="Usuários" value={userTotal} />
        <StatCard label="Grupos" value={groupTotal} />
      </div>

      <div className="flex-1 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Atividades recentes</h2>
          <Link
            href="/logs/atividades"
            className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-[11px] font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
          >
            Ver mais
          </Link>
        </div>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma atividade recente.</p>
        ) : (
          <div className="space-y-2">
            {activities.map((a, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    a.type === "group"
                      ? "bg-blue-500/10 text-blue-400"
                      : a.type === "waifu"
                        ? "bg-pink-500/10 text-pink-400"
                        : a.type === "husbando"
                          ? "bg-cyan-500/10 text-cyan-400"
                          : a.type === "collection-h"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-violet-500/10 text-violet-400"
                  }`}>
                    {a.label}
                  </span>
                  <span className="flex-1 truncate font-medium">{a.detail}</span>
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    {timeAgo(a.updatedAt)}
                  </span>
                </div>
                {"extra" in a && a.extra && (
                  <p className="text-muted-foreground mt-1 text-[11px]">{a.extra}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return date.toLocaleDateString("pt-BR");
}
