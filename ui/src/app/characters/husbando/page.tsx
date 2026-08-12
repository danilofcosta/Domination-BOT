import { prisma } from "@/lib/prisma";
import { SourceType } from "../../../../generated/prisma/enums";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { CharacterEditDialog } from "@/components/character-edit-dialog";

export const dynamic = "force-dynamic";

type HusbandoPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SORT_OPTIONS = [
  { value: "popularity-desc", label: "Popularidade (maior)" },
  { value: "popularity-asc", label: "Popularidade (menor)" },
  { value: "likes-desc", label: "Likes (maior)" },
  { value: "likes-asc", label: "Likes (menor)" },
  { value: "name-asc", label: "Nome (A-Z)" },
  { value: "name-desc", label: "Nome (Z-A)" },
  { value: "createdAt-desc", label: "Recentes" },
  { value: "createdAt-asc", label: "Antigos" },
] as const;

const SOURCE_TYPES = ["", ...Object.keys(SourceType).filter((k) => isNaN(Number(k)))] as const;

export default async function HusbandoPage({ searchParams }: HusbandoPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const origem = typeof params.origem === "string" ? params.origem : "";
  const sourceType = typeof params.sourceType === "string" ? params.sourceType : "";
  const searchId = typeof params.id === "string" ? params.id : "";
  const eventCode = typeof params.event === "string" ? params.event : "";
  const rarityCode = typeof params.rarity === "string" ? params.rarity : "";
  const sort = typeof params.sort === "string" ? params.sort : "popularity-desc";
  const page = Math.max(1, typeof params.page === "string" ? Number(params.page) || 1 : 1);
  const perPage = 20;

  const [sortField, sortDir] = sort.split("-") as [string, "asc" | "desc"];

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (origem) where.origem = { contains: origem, mode: "insensitive" };
  if (sourceType) where.sourceType = sourceType as SourceType;
  if (searchId) {
    const idNum = Number(searchId);
    if (!isNaN(idNum)) where.id = idNum;
  }
  if (eventCode) where.HusbandoEvent = { some: { Event: { code: eventCode } } };
  if (rarityCode) where.HusbandoRarity = { some: { Rarity: { code: rarityCode } } };

  const orderBy: Record<string, "asc" | "desc"> = {};
  if (sortField === "name") orderBy.name = sortDir;
  else if (sortField === "createdAt") orderBy.createdAt = sortDir;
  else if (sortField === "likes") orderBy.likes = sortDir;
  else orderBy.popularity = sortDir;

  const [husbandos, total, events, rarities] = await Promise.all([
    prisma.characterHusbando.findMany({
      where: where as any,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        origem: true,
        popularity: true,
        sourceType: true,
        createdAt: true,
        slug: true,
        HusbandoRarity: {
          select: {
            Rarity: {
              select: { emoji: true, name: true, code: true },
            },
          },
        },
        HusbandoEvent: {
          select: {
            Event: {
              select: { emoji: true, name: true, code: true },
            },
          },
        },
      },
    }),
    prisma.characterHusbando.count({ where: where as any }),
    prisma.event.findMany({ orderBy: { name: "asc" }, select: { code: true, name: true, emoji: true } }),
    prisma.rarity.findMany({ orderBy: { name: "asc" }, select: { code: true, name: true, emoji: true } }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  function buildHref(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    if (searchId) sp.set("id", searchId);
    if (search) sp.set("search", search);
    if (origem) sp.set("origem", origem);
    if (sourceType) sp.set("sourceType", sourceType);
    if (eventCode) sp.set("event", eventCode);
    if (rarityCode) sp.set("rarity", rarityCode);
    if (sort !== "popularity-desc") sp.set("sort", sort);
    if (page > 1) sp.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    return `/characters/husbando${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Personagens
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Husbandos</h1>
          </div>
          <Link
            href="/characters"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar para estatísticas
          </Link>
        </div>
      </header>

      <form className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            ID
          </label>
          <input
            name="id"
            defaultValue={searchId}
            placeholder="Nº ID..."
            className="w-24 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Buscar
          </label>
          <input
            name="search"
            defaultValue={search}
            placeholder="Nome do personagem..."
            className="w-full rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Origem
          </label>
          <input
            name="origem"
            defaultValue={origem}
            placeholder="Anime, game..."
            className="w-40 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Tipo
          </label>
          <select
            name="sourceType"
            defaultValue={sourceType}
            className="w-32 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-border"
          >
            <option value="">Todos</option>
            {SOURCE_TYPES.filter(Boolean).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Evento
          </label>
          <select
            name="event"
            defaultValue={eventCode}
            className="w-36 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-border"
          >
            <option value="">Todos</option>
            {events.map((ev) => (
              <option key={ev.code} value={ev.code}>
                {ev.emoji} {ev.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Raridade
          </label>
          <select
            name="rarity"
            defaultValue={rarityCode}
            className="w-36 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-border"
          >
            <option value="">Todos</option>
            {rarities.map((r) => (
              <option key={r.code} value={r.code}>
                {r.emoji} {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Ordenar
          </label>
          <select
            name="sort"
            defaultValue={sort}
            className="w-44 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-border"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg border border-border/70 bg-card/60 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-card"
        >
          Filtrar
        </button>

        {(searchId || search || origem || sourceType || eventCode || rarityCode || sort !== "popularity-desc") && (
          <Link
            href="/characters/husbando"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            {total} {total === 1 ? "husbando encontrado" : "husbandos encontrados"}
          </h2>
        </div>

        {husbandos.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum husbando encontrado com esses filtros.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border/50 text-[11px] font-semibold tracking-[0.14em] uppercase">
                  <th className="w-10 px-2 py-2 text-center">ID</th>
                  <th className="px-2 py-2 text-left">Nome</th>
                  <th className="px-2 py-2 text-left">Origem</th>
                  <th className="px-2 py-2 text-left">Raridade</th>
                  <th className="px-2 py-2 text-left">Evento</th>
                  <th className="w-12 px-2 py-2 text-center">Tipo</th>
                  <th className="w-12 px-2 py-2 text-center">Pop.</th>
                  <th className="px-2 py-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {husbandos.map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-border/30 transition-colors hover:bg-border/20"
                  >
                    <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">{h.id}</td>
                    <td className="max-w-[180px] truncate px-2 py-2.5 font-medium">{h.name}</td>
                    <td className="max-w-[140px] truncate px-2 py-2.5 text-muted-foreground">{h.origem}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {h.HusbandoRarity.length > 0
                          ? h.HusbandoRarity.map((hr) => (
                              <span
                                key={hr.Rarity.code}
                                className="inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-border/20 px-1.5 py-0.5 text-xs"
                                title={hr.Rarity.name}
                              >
                                {hr.Rarity.emoji} {hr.Rarity.name}
                              </span>
                            ))
                          : <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {h.HusbandoEvent.length > 0
                          ? h.HusbandoEvent.map((he) => (
                              <span
                                key={he.Event.code}
                                className="inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-border/20 px-1.5 py-0.5 text-xs"
                                title={he.Event.name}
                              >
                                {he.Event.emoji} {he.Event.name}
                              </span>
                            ))
                          : <span className="text-muted-foreground text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs">{h.sourceType}</td>
                    <td className="px-2 py-2.5 text-center">{h.popularity}</td>
                    <td className="px-2 py-2.5 text-center">
                      <CharacterEditDialog
                        type="husbando"
                        id={h.id}
                        trigger={
                          <Button variant="outline" size="sm">
                            <PencilIcon className="size-3" />
                            Editar
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-sm backdrop-blur-md transition-colors hover:bg-card"
              >
                Anterior
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                  {p === page ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/80 text-sm font-semibold">
                      {p}
                    </span>
                  ) : (
                    <Link
                      href={buildHref({ page: String(p) })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-sm backdrop-blur-md transition-colors hover:bg-card"
                    >
                      {p}
                    </Link>
                  )}
                </span>
              ))}
            {page < totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-sm backdrop-blur-md transition-colors hover:bg-card"
              >
                Próximo
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
