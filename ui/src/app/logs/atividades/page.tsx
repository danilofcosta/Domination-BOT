import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getTelegramName } from "@/lib/telegram";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type RawActivity = {
  type: "group" | "waifu" | "husbando" | "collection-h" | "collection-w";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  updatedAt: Date;
};

export default async function AtividadesPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "";
  const page = Math.max(1, typeof params.page === "string" ? Number(params.page) || 1 : 1);
  const perPage = 30;

  const [allGroups, allWaifus, allHusbandos, allHusbandoCollections, allWaifuCollections] =
    await Promise.all([
      prisma.telegramGroup.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          groupId: true,
          groupName: true,
          configuration: true,
          addedBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.characterWaifu.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          WaifuRarity: { include: { Rarity: true } },
          WaifuEvent: { include: { Event: true } },
        },
      }),
      prisma.characterHusbando.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          HusbandoRarity: { include: { Rarity: true } },
          HusbandoEvent: { include: { Event: true } },
        },
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

  const raw: RawActivity[] = [
    ...allGroups.map((g) => ({ type: "group" as const, data: g, updatedAt: g.updatedAt })),
    ...allWaifus.map((w) => ({ type: "waifu" as const, data: w, updatedAt: w.updatedAt })),
    ...allHusbandos.map((h) => ({ type: "husbando" as const, data: h, updatedAt: h.updatedAt })),
    ...allHusbandoCollections.map((c) => ({
      type: "collection-h" as const,
      data: c,
      updatedAt: c.updatedAt,
    })),
    ...allWaifuCollections.map((c) => ({
      type: "collection-w" as const,
      data: c,
      updatedAt: c.updatedAt,
    })),
  ]
    .filter((a) => !type || a.type === type)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const total = raw.length;
  const totalPages = Math.ceil(total / perPage);
  const items = raw.slice((page - 1) * perPage, page * perPage);

  return (
    <Suspense>
      <Content
        type={type}
        page={page}
        total={total}
        totalPages={totalPages}
        items={items}
      />
    </Suspense>
  );
}

function Content({
  type,
  page,
  total,
  totalPages,
  items,
}: {
  type: string;
  page: number;
  total: number;
  totalPages: number;
  items: RawActivity[];
}) {
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
    { value: "collection-h", label: "Colecao H" },
    { value: "collection-w", label: "Colecao W" },
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
              Atividades <span className="text-muted-foreground text-base font-normal">({total})</span>
            </h1>
          </div>
          <Link
            href="/home"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {typeOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={type === opt.value ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={buildHref({ type: opt.value, page: "" })}>
              {opt.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex-1 space-y-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma atividade encontrada.</p>
        ) : (
          items.map((a, i) => <ActivityRow key={i} activity={a} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildHref({ page: String(page - 1) })}>Anterior</Link>
            </Button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-1">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-muted-foreground px-1 text-xs">...</span>
                )}
                {p === page ? (
                  <Button variant="default" size="sm" className="pointer-events-none">
                    {p}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={buildHref({ page: String(p) })}>{p}</Link>
                  </Button>
                )}
              </span>
            ))}
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildHref({ page: String(page + 1) })}>Proximo</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityRow({
  activity,
}: {
  activity: RawActivity;
}) {
  const { type, data, updatedAt } = activity;

  if (type === "group") {
    const g = data as {
      id: number;
      groupId: bigint;
      groupName: string;
      configuration: unknown;
      addedBy: unknown;
      createdAt: Date;
    };
    const config = (g.configuration as Record<string, unknown>) ?? {};
    const addedBy = (g.addedBy as Record<string, unknown>) ?? null;
    const addedByName =
      addedBy?.first_name || addedBy?.username || addedBy?.Nome
        ? String(addedBy?.first_name || addedBy?.username || addedBy?.Nome)
        : "—";
    return (
      <Card size="sm">
        <CardContent className="flex items-start gap-3 py-3">
          <Badge variant="secondary" className="mt-0.5 shrink-0 text-[10px] uppercase tracking-wider">
            Grupo
          </Badge>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{g.groupName}</p>
            <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
              <span>ID: {g.id}</span>
              <span>Group ID: {String(g.groupId)}</span>
              <span>Criado: {g.createdAt.toLocaleString("pt-BR")}</span>
              <span>Modificado: {updatedAt.toLocaleString("pt-BR")}</span>
              <span>Adicionado por: {addedByName}</span>
              <span>Chaves de config: {Object.keys(config).length}</span>
            </div>
            {Object.keys(config).length > 0 && (
              <p className="text-muted-foreground mt-1 truncate text-[10px]">
                {Object.entries(config)
                  .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                  .join(" · ")}
              </p>
            )}
          </div>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </CardContent>
      </Card>
    );
  }

  if (type === "waifu") {
    const w = data as {
      id: number; name: string; origem: string; popularity: number; likes: number; dislikes: number;
      sourceType: string; mediaType: string; createdAt: Date; addby: unknown; linkweb: string | null;
      WaifuRarity: Array<{ Rarity: { name: string } }>;
      WaifuEvent: Array<{ Event: { name: string } }>;
    };
    const addby = (w.addby as Record<string, unknown>) ?? null;
    const addbyName =
      addby?.first_name || addby?.username || addby?.Nome
        ? String(addby?.first_name || addby?.username || addby?.Nome)
        : "—";
    return (
      <Card size="sm">
        <CardContent className="flex items-start gap-3 py-3">
          <Badge variant="secondary" className="mt-0.5 shrink-0 bg-pink-500/10 text-pink-500 text-[10px] uppercase tracking-wider">
            Waifu
          </Badge>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{w.name}</p>
            <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
              <span>#{w.id}</span>
              <span>{w.origem}</span>
              <span>{w.sourceType}</span>
              <span>{w.mediaType}</span>
              <span>{w.likes} curtidas / {w.dislikes} nao curtidas</span>
              <span>Popularidade: {w.popularity}</span>
              <span>Criado: {w.createdAt.toLocaleString("pt-BR")}</span>
              <span>Adicionado por: {addbyName}</span>
              {w.WaifuRarity.length > 0 && (
                <span>Raridades: {w.WaifuRarity.map((r) => r.Rarity.name).join(", ")}</span>
              )}
              {w.WaifuEvent.length > 0 && (
                <span>Eventos: {w.WaifuEvent.map((e) => e.Event.name).join(", ")}</span>
              )}
            </div>
          </div>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </CardContent>
      </Card>
    );
  }

  if (type === "husbando") {
    const h = data as {
      id: number; name: string; origem: string; popularity: number; likes: number; dislikes: number;
      sourceType: string; mediaType: string; createdAt: Date; addby: unknown; linkweb: string | null;
      HusbandoRarity: Array<{ Rarity: { name: string } }>;
      HusbandoEvent: Array<{ Event: { name: string } }>;
    };
    const addby = (h.addby as Record<string, unknown>) ?? null;
    const addbyName =
      addby?.first_name || addby?.username || addby?.Nome
        ? String(addby?.first_name || addby?.username || addby?.Nome)
        : "—";
    return (
      <Card size="sm">
        <CardContent className="flex items-start gap-3 py-3">
          <Badge variant="secondary" className="mt-0.5 shrink-0 bg-cyan-500/10 text-cyan-500 text-[10px] uppercase tracking-wider">
            Husbando
          </Badge>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{h.name}</p>
            <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
              <span>#{h.id}</span>
              <span>{h.origem}</span>
              <span>{h.sourceType}</span>
              <span>{h.mediaType}</span>
              <span>{h.likes} curtidas / {h.dislikes} nao curtidas</span>
              <span>Popularidade: {h.popularity}</span>
              <span>Criado: {h.createdAt.toLocaleString("pt-BR")}</span>
              <span>Adicionado por: {addbyName}</span>
              {h.HusbandoRarity.length > 0 && (
                <span>Raridades: {h.HusbandoRarity.map((r) => r.Rarity.name).join(", ")}</span>
              )}
              {h.HusbandoEvent.length > 0 && (
                <span>Eventos: {h.HusbandoEvent.map((e) => e.Event.name).join(", ")}</span>
              )}
            </div>
          </div>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </CardContent>
      </Card>
    );
  }

  if (type === "collection-h" || type === "collection-w") {
    const isH = type === "collection-h";
    const c = data as any;
    const name = getTelegramName(c.TelegramUser?.telegramData);
    const userName = name === "—" ? `#${c.userId}` : name;
    const characterName = isH ? c.CharacterHusbando?.name : c.CharacterWaifu?.name ?? "?";
    const character = isH ? c.CharacterHusbando : c.CharacterWaifu;
    const userId = String(c.userId);
    return (
      <Card size="sm">
        <CardContent className="flex items-start gap-3 py-3">
          <Badge
            variant="secondary"
            className={`mt-0.5 shrink-0 text-[10px] uppercase tracking-wider ${
              isH
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-violet-500/10 text-violet-500"
            }`}
          >
            {isH ? "Colecao H" : "Colecao W"}
          </Badge>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{userName}</p>
            <div className="text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
              <span>Telegram ID: {userId}</span>
              <span>Char ID: {c.characterId}</span>
              <span>Quantidade: {c.count}</span>
              {c.fromIdChat != null && <span>Origem do chat: {String(c.fromIdChat)}</span>}
              <span>Adicionado: {c.createdAt.toLocaleString("pt-BR")}</span>
              {character?.origem && <span>Origem: {character.origem}</span>}
            </div>
            <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
              Adicionou {characterName} &times;{c.count}
            </p>
          </div>
          <span className="text-muted-foreground shrink-0 text-[11px]">{timeAgo(updatedAt)}</span>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atras`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atras`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atras`;
  return date.toLocaleDateString("pt-BR");
}
