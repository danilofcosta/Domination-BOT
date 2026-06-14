import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AtividadesPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "";
  const page = Math.max(1, typeof params.page === "string" ? Number(params.page) || 1 : 1);
  const perPage = 30;

  const [allGroups, allWaifus, allHusbandos, allHusbandoCollections, allWaifuCollections] = await Promise.all([
    prisma.telegramGroup.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.characterWaifu.findMany({
      orderBy: { updatedAt: "desc" },
      include: { WaifuRarity: { include: { Rarity: true } }, WaifuEvent: { include: { Event: true } } },
    }),
    prisma.characterHusbando.findMany({
      orderBy: { updatedAt: "desc" },
      include: { HusbandoRarity: { include: { Rarity: true } }, HusbandoEvent: { include: { Event: true } } },
    }),
    prisma.husbandoCollection.findMany({
      orderBy: { updatedAt: "desc" },
      include: { CharacterHusbando: true, TelegramUser: true },
    }),
    prisma.waifuCollection.findMany({
      orderBy: { updatedAt: "desc" },
      include: { CharacterWaifu: true, TelegramUser: true },
    }),
  ]);

  type RawActivity = {
    type: "group" | "waifu" | "husbando" | "collection-h" | "collection-w";
    data: typeof allGroups[0] | typeof allWaifus[0] | typeof allHusbandos[0] | typeof allHusbandoCollections[0] | typeof allWaifuCollections[0];
    updatedAt: Date;
  };

  const raw: RawActivity[] = [
    ...allGroups.map((g) => ({ type: "group" as const, data: g, updatedAt: g.updatedAt })),
    ...allWaifus.map((w) => ({ type: "waifu" as const, data: w, updatedAt: w.updatedAt })),
    ...allHusbandos.map((h) => ({ type: "husbando" as const, data: h, updatedAt: h.updatedAt })),
    ...allHusbandoCollections.map((c) => ({ type: "collection-h" as const, data: c, updatedAt: c.updatedAt })),
    ...allWaifuCollections.map((c) => ({ type: "collection-w" as const, data: c, updatedAt: c.updatedAt })),
  ]
    .filter((a) => !type || a.type === type)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const total = raw.length;
  const totalPages = Math.ceil(total / perPage);
  const items = raw.slice((page - 1) * perPage, page * perPage);

  function buildHref(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    if (type) sp.set("type", type);
    if (page > 1) sp.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    return `/logs/atividades${qs ? `?${qs}` : ""}`;
  }

  const typeOptions = [
    { value: "", label: "Todas" },
    { value: "group", label: "Grupos" },
    { value: "waifu", label: "Waifus" },
    { value: "husbando", label: "Husbandos" },
    { value: "collection-h", label: "Coleção H" },
    { value: "collection-w", label: "Coleção W" },
  ];

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Logs
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Atividades ({total})
            </h1>
          </div>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {typeOptions.map((opt) => (
          <Link
            key={opt.value}
            href={buildHref({ type: opt.value, page: "" })}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium shadow-xs transition-colors ${
              type === opt.value
                ? "border-border/70 bg-accent"
                : "border-border/70 bg-card/60 backdrop-blur-md hover:bg-accent"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="flex-1 space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma atividade encontrada.</p>
        ) : (
          items.map((a, i) => (
            <ActivityRow key={i} activity={a} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
            >
              Anterior
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-1">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-muted-foreground px-1 text-xs">...</span>
                )}
                {p === page ? (
                  <span className="rounded-lg border border-border/70 bg-accent px-3 py-1.5 text-xs font-medium shadow-xs">
                    {p}
                  </span>
                ) : (
                  <Link
                    href={buildHref({ page: String(p) })}
                    className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
                  >
                    {p}
                  </Link>
                )}
              </span>
            ))}
          {page < totalPages && (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
            >
              Próximo
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityRow({ activity }: { activity: { type: string; data: any; updatedAt: Date } }) {
  const { type, data, updatedAt } = activity;

  if (type === "group") {
    const g = data as { id: number; groupId: bigint; groupName: string; updatedAt: Date };
    return (
      <div className="rounded-lg border border-border/40 bg-card/40 px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
            Grupo
          </span>
          <span className="flex-1 truncate font-medium">{g.groupName}</span>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </div>
        <div className="text-muted-foreground mt-1 flex gap-4 text-[11px]">
          <span>ID: {g.id}</span>
          <span>Group ID: {String(g.groupId)}</span>
        </div>
      </div>
    );
  }

  if (type === "waifu") {
    const w = data as {
      id: number; name: string; origem: string; popularity: number; likes: number; dislikes: number;
      sourceType: string; WaifuRarity: Array<{ Rarity: { name: string; emoji: string } }>;
      WaifuEvent: Array<{ Event: { name: string; emoji: string } }>;
      updatedAt: Date;
    };
    const rarities = w.WaifuRarity.map((r) => `${r.Rarity.emoji} ${r.Rarity.name}`).join(" ");
    const events = w.WaifuEvent.map((e) => `${e.Event.emoji} ${e.Event.name}`).join(" ");
    return (
      <div className="rounded-lg border border-border/40 bg-card/40 px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="shrink-0 rounded-full bg-pink-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-pink-400">
            Waifu
          </span>
          <span className="flex-1 truncate font-medium">{w.name}</span>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
          <span>#{w.id}</span>
          <span>{w.origem}</span>
          <span>{w.sourceType}</span>
          <span>👍 {w.likes} 👎 {w.dislikes}</span>
          <span>🔥 {w.popularity}</span>
          {rarities && <span>{rarities}</span>}
          {events && <span>{events}</span>}
        </div>
      </div>
    );
  }

  if (type === "collection-h" || type === "collection-w") {
    const isH = type === "collection-h";
    const c = data as any;
    const userData = c.TelegramUser?.telegramData as Record<string, unknown> | null;
    const userName = (userData?.first_name as string) ?? `#${c.userId}`;
    const characterName = isH ? c.CharacterHusbando?.name : c.CharacterWaifu?.name ?? "?";
    return (
      <div className="rounded-lg border border-border/40 bg-card/40 px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            isH ? "bg-emerald-500/10 text-emerald-400" : "bg-violet-500/10 text-violet-400"
          }`}>
            {isH ? "Coleção H" : "Coleção W"}
          </span>
          <span className="flex-1 truncate font-medium">{userName}</span>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </div>
        <div className="text-muted-foreground mt-1 flex gap-4 text-[11px]">
          <span>Adicionou {characterName}</span>
          <span>x{c.count}</span>
        </div>
      </div>
    );
  }

  if (type === "husbando") {
    const h = data as {
      id: number; name: string; origem: string; popularity: number; likes: number; dislikes: number;
      sourceType: string; HusbandoRarity: Array<{ Rarity: { name: string; emoji: string } }>;
      HusbandoEvent: Array<{ Event: { name: string; emoji: string } }>;
      updatedAt: Date;
    };
    const rarities = h.HusbandoRarity.map((r) => `${r.Rarity.emoji} ${r.Rarity.name}`).join(" ");
    const events = h.HusbandoEvent.map((e) => `${e.Event.emoji} ${e.Event.name}`).join(" ");
    return (
      <div className="rounded-lg border border-border/40 bg-card/40 px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="shrink-0 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
            Husbando
          </span>
          <span className="flex-1 truncate font-medium">{h.name}</span>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
          <span>#{h.id}</span>
          <span>{h.origem}</span>
          <span>{h.sourceType}</span>
          <span>👍 {h.likes} 👎 {h.dislikes}</span>
          <span>🔥 {h.popularity}</span>
          {rarities && <span>{rarities}</span>}
          {events && <span>{events}</span>}
        </div>
      </div>
    );
  }

  return null;
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
