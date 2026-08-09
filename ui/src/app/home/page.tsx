import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTelegramName, getTelegramInfo } from "@/lib/telegram";
import { ThemeToggle } from "@/components/theme-toggle";
import { RefreshButton } from "@/components/refresh-button";
import { DashboardCharts } from "@/components/dashboard-charts";

type Activity = {
  type: string;
  label: string;
  detail: string;
  extra?: string;
  updatedAt: Date;
};

export default async function Home() {
  const [
    recentGroups,
    recentWaifus,
    recentHusbandos,
    recentHusbandoCols,
    recentWaifuCols,
  ] = await Promise.all([
    prisma.telegramGroup.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.characterWaifu.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        WaifuRarity: { include: { Rarity: true } },
        WaifuEvent: { include: { Event: true } },
      },
    }),
    prisma.characterHusbando.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        HusbandoRarity: { include: { Rarity: true } },
        HusbandoEvent: { include: { Event: true } },
      },
    }),
    prisma.husbandoCollection.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { CharacterHusbando: true, TelegramUser: true },
    }),
    prisma.waifuCollection.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { CharacterWaifu: true, TelegramUser: true },
    }),
  ]);

  const [waifuTotal, husbandoTotal, userTotal, groupTotal] = await Promise.all([
    prisma.characterWaifu.count(),
    prisma.characterHusbando.count(),
    prisma.telegramUser.count(),
    prisma.telegramGroup.count(),
  ]);

  const [
    bySourceW,
    bySourceH,
    rarityRows,
    waifuCreated,
    husbandoCreated,
    profileTypeRows,
    languageRows,
    mediaTypeW,
    mediaTypeH,
    topUsersW,
    topUsersH,
    topPopularityW,
    topPopularityH,
    eventRows,
    likeRowsW,
    likeRowsH,
  ] = await Promise.all([
    prisma.characterWaifu.groupBy({ by: ["sourceType"], _count: { _all: true } }),
    prisma.characterHusbando.groupBy({ by: ["sourceType"], _count: { _all: true } }),
    prisma.rarity.findMany({
      select: {
        name: true,
        emoji: true,
        _count: { select: { WaifuRarity: true, HusbandoRarity: true } },
      },
    }),
    prisma.characterWaifu.findMany({
      where: { createdAt: { gte: startOfLast14Days() } },
      select: { createdAt: true },
    }),
    prisma.characterHusbando.findMany({
      where: { createdAt: { gte: startOfLast14Days() } },
      select: { createdAt: true },
    }),
    prisma.telegramUser.groupBy({
      by: ["profileType"],
      _count: { _all: true },
    }),
    prisma.telegramUser.groupBy({ by: ["language"], _count: { _all: true } }),
    prisma.characterWaifu.groupBy({
      by: ["mediaType"],
      _count: { _all: true },
    }),
    prisma.characterHusbando.groupBy({
      by: ["mediaType"],
      _count: { _all: true },
    }),
    prisma.waifuCollection.groupBy({
      by: ["userId"],
      _sum: { count: true },
    }),
    prisma.husbandoCollection.groupBy({
      by: ["userId"],
      _sum: { count: true },
    }),
    prisma.characterWaifu.findMany({
      orderBy: { popularity: "desc" },
      take: 8,
      select: { name: true, popularity: true },
    }),
    prisma.characterHusbando.findMany({
      orderBy: { popularity: "desc" },
      take: 8,
      select: { name: true, popularity: true },
    }),
    prisma.event.findMany({
      select: {
        name: true,
        emoji: true,
        _count: { select: { WaifuEvent: true, HusbandoEvent: true } },
      },
    }),
    prisma.characterWaifu.findMany({
      orderBy: { likes: "desc" },
      take: 8,
      select: { name: true, likes: true },
    }),
    prisma.characterHusbando.findMany({
      orderBy: { likes: "desc" },
      take: 8,
      select: { name: true, likes: true },
    }),
  ]);

  const SOURCE_COLORS: Record<string, string> = {
    ANIME: "#8b5cf6",
    GAME: "#22c55e",
    MANGA: "#f59e0b",
    MOVIE: "#ef4444",
  };

  const sourceCounts: Record<string, number> = {};
  for (const row of [...bySourceW, ...bySourceH]) {
    sourceCounts[row.sourceType] =
      (sourceCounts[row.sourceType] ?? 0) + (row._count._all ?? 0);
  }

  const sourceTypeData = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value,
    color: SOURCE_COLORS[name] ?? "#8b5cf6",
  }));

  const waifusHusbandos = [
    { name: "Waifus", value: waifuTotal, color: "#ec4899" },
    { name: "Husbandos", value: husbandoTotal, color: "#06b6d4" },
  ];

  const rarityData = rarityRows
    .map((r) => ({
      label: `${r.emoji} ${r.name}`,
      value: r._count.WaifuRarity + r._count.HusbandoRarity,
    }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const dailyData = buildDailyData(waifuCreated, husbandoCreated);

  const PROFILE_COLORS: Record<string, string> = {
    SUPREME: "#f59e0b",
    SUPER_ADMIN: "#ef4444",
    ADMIN: "#8b5cf6",
    MODERATOR: "#06b6d4",
    USER: "#22c55e",
    BANNED: "#64748b",
  };

  const profileTypeData = profileTypeRows
    .map((r) => ({
      name: r.profileType,
      value: r._count._all ?? 0,
      color: PROFILE_COLORS[r.profileType] ?? "#8b5cf6",
    }))
    .filter((d) => d.value > 0);

  const LANGUAGE_COLORS: Record<string, string> = {
    PT: "#22c55e",
    EN: "#3b82f6",
    ES: "#f59e0b",
    JA: "#ec4899",
  };

  const languageData = languageRows
    .map((r) => ({
      name: r.language,
      value: r._count._all ?? 0,
      color: LANGUAGE_COLORS[r.language] ?? "#8b5cf6",
    }))
    .filter((d) => d.value > 0);

  const MEDIA_COLORS: Record<string, string> = {
    IMAGE_URL: "#8b5cf6",
    IMAGE_FILEID: "#ec4899",
    VIDEO_URL: "#06b6d4",
    VIDEO_FILEID: "#f59e0b",
    VIDEO_LOCAL: "#ef4444",
    IMAGE_LOCAL: "#22c55e",
  };

  const mediaCounts: Record<string, number> = {};
  for (const row of [...mediaTypeW, ...mediaTypeH]) {
    mediaCounts[row.mediaType] =
      (mediaCounts[row.mediaType] ?? 0) + (row._count._all ?? 0);
  }

  const mediaTypeData = Object.entries(mediaCounts).map(([name, value]) => ({
    name,
    value,
    color: MEDIA_COLORS[name] ?? "#8b5cf6",
  }));

  const userCols = new Map<string, number>();
  for (const row of [...topUsersW, ...topUsersH]) {
    const key = String(row.userId);
    userCols.set(key, (userCols.get(key) ?? 0) + (row._sum.count ?? 0));
  }

  const topUserIds = [...userCols.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => BigInt(id));

  const topTelegramUsers = await prisma.telegramUser.findMany({
    where: { telegramId: { in: topUserIds } },
    select: { telegramId: true, telegramData: true },
  });

  const userLabelById = new Map<string, string>();
  for (const tu of topTelegramUsers) {
    const { username } = getTelegramInfo(tu.telegramData);
    const label = username
      ? `@${username}`
      : getTelegramName(tu.telegramData);
    userLabelById.set(String(tu.telegramId), label);
  }

  const topUsersData = [...userCols.entries()]
    .map(([id, value]) => ({
      label: userLabelById.get(id) ?? `#${id}`,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topPopularityData = [...topPopularityW, ...topPopularityH]
    .map((c) => ({ label: c.name, value: c.popularity }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const eventData = eventRows
    .map((e) => ({
      label: `${e.emoji} ${e.name}`,
      value: e._count.WaifuEvent + e._count.HusbandoEvent,
    }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topLikesData = [...likeRowsW, ...likeRowsH]
    .map((c) => ({ label: c.name, value: c.likes }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

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
      const extra = [
        w.origem,
        rarities && `★ ${rarities}`,
        events && `◆ ${events}`,
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        type: "waifu" as const,
        label: "Waifu",
        detail: w.name,
        extra,
        updatedAt: w.updatedAt,
      };
    }),
    ...recentHusbandos.map((h) => {
      const rarities = h.HusbandoRarity.map((r) => r.Rarity.name).join(", ");
      const events = h.HusbandoEvent.map((e) => e.Event.name).join(", ");
      const extra = [
        h.origem,
        rarities && `★ ${rarities}`,
        events && `◆ ${events}`,
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        type: "husbando" as const,
        label: "Husbando",
        detail: h.name,
        extra,
        updatedAt: h.updatedAt,
      };
    }),
    ...recentCollections.map((c) => {
      const name = getTelegramName(c.TelegramUser.telegramData);
      const userName = name === "—" ? `#${c.userId}` : name;
      const isHusbando = "CharacterHusbando" in c;
      const characterName = isHusbando
        ? (c as any).CharacterHusbando?.name
        : (c as any).CharacterWaifu?.name;
      return {
        type: isHusbando
          ? ("collection-h" as const)
          : ("collection-w" as const),
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
          <div className="flex items-center gap-1">
            <RefreshButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Waifus" value={waifuTotal} />
        <StatCard label="Husbandos" value={husbandoTotal} />
        <StatCard label="Usuários" value={userTotal} />
        <StatCard label="Grupos" value={groupTotal} />
      </div>

      <DashboardCharts
        waifusHusbandos={waifusHusbandos}
        sourceTypeData={sourceTypeData}
        rarityData={rarityData}
        dailyData={dailyData}
        profileTypeData={profileTypeData}
        languageData={languageData}
        mediaTypeData={mediaTypeData}
        topUsersData={topUsersData}
        topPopularityData={topPopularityData}
        eventData={eventData}
        topLikesData={topLikesData}
      />

      <div className="flex-1 rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Atividades recentes
          </h2>
          <Link
            href="/logs/atividades"
            className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-[11px] font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
          >
            Ver mais
          </Link>
        </div>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma atividade recente.
          </p>
        ) : (
          <div className="space-y-2">
            {activities.map((a, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      a.type === "group"
                        ? "bg-blue-500/10 text-blue-400"
                        : a.type === "waifu"
                          ? "bg-pink-500/10 text-pink-400"
                          : a.type === "husbando"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : a.type === "collection-h"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-violet-500/10 text-violet-400"
                    }`}
                  >
                    {a.label}
                  </span>
                  <span className="flex-1 truncate font-medium">
                    {a.detail}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    {timeAgo(a.updatedAt)}
                  </span>
                </div>
                <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                  <span>Modificado: {a.updatedAt.toLocaleString("pt-BR")}</span>
                </div>
                {"extra" in a && a.extra && (
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {a.extra}
                  </p>
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
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight">
        {value.toLocaleString("pt-BR")}
      </p>
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

function startOfLast14Days(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
}

function buildDailyData(
  waifus: { createdAt: Date }[],
  husbandos: { createdAt: Date }[],
): { label: string; value: number }[] {
  const now = new Date();
  const created = [...waifus, ...husbandos].map((c) =>
    new Date(c.createdAt).toDateString(),
  );
  const countByDay = new Map<string, number>();
  for (const key of created) {
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13 + i);
    const key = d.toDateString();
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}`;
    return { label, value: countByDay.get(key) ?? 0 };
  });
}
