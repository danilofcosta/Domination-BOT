import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveMediaUrl } from "@/lib/telegram/resolveMediaUrl";
import { CharacterEditForm } from "@/components/character-edit-form";
import Link from "next/link";

type Props = {
  params: Promise<{ type: string; id: string }>;
};

export default async function CharacterDetailPage({ params }: Props) {
  const { type, id: idStr } = await params;
  const id = Number(idStr);

  if (type !== "waifu" && type !== "husbando") notFound();
  if (!Number.isFinite(id)) notFound();

  if (type === "waifu") return <WaifuPage id={id} />;
  return <HusbandoPage id={id} />;
}

async function WaifuPage({ id }: { id: number }) {
  const character = await prisma.characterWaifu.findUnique({
    where: { id },
    include: {
      WaifuRarity: { select: { Rarity: { select: { id: true, code: true, name: true, emoji: true } } } },
      WaifuEvent: { select: { Event: { select: { id: true, code: true, name: true, emoji: true } } } },
    },
  });
  if (!character) notFound();

  const { displayUrl, isVideo } = await resolveMediaUrl(character, "waifu");
  const rarities = character.WaifuRarity.map((wr) => wr.Rarity);
  const events = character.WaifuEvent.map((we) => we.Event);

  const [allRarities, allEvents] = await Promise.all([
    prisma.rarity.findMany({ orderBy: { name: "asc" } }),
    prisma.event.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <PageLayout
      type="waifu"
      character={character}
      displayUrl={displayUrl}
      isVideo={isVideo}
      rarities={rarities}
      events={events}
      allRarities={allRarities}
      allEvents={allEvents}
    />
  );
}

async function HusbandoPage({ id }: { id: number }) {
  const character = await prisma.characterHusbando.findUnique({
    where: { id },
    include: {
      HusbandoRarity: { select: { Rarity: { select: { id: true, code: true, name: true, emoji: true } } } },
      HusbandoEvent: { select: { Event: { select: { id: true, code: true, name: true, emoji: true } } } },
    },
  });
  if (!character) notFound();

  const { displayUrl, isVideo } = await resolveMediaUrl(character, "husbando");
  const rarities = character.HusbandoRarity.map((hr) => hr.Rarity);
  const events = character.HusbandoEvent.map((he) => he.Event);

  const [allRarities, allEvents] = await Promise.all([
    prisma.rarity.findMany({ orderBy: { name: "asc" } }),
    prisma.event.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <PageLayout
      type="husbando"
      character={character}
      displayUrl={displayUrl}
      isVideo={isVideo}
      rarities={rarities}
      events={events}
      allRarities={allRarities}
      allEvents={allEvents}
    />
  );
}

type RarityOrEvent = {
  id: number;
  code: string;
  name: string;
  emoji: string;
};

type PageChar = {
  id: number;
  name: string;
  origem: string;
  slug: string;
  mediaType: string;
  media: string;
  sourceType: string;
  popularity: number;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
  extras: unknown;
  addby: unknown;
};

function PageLayout({
  type,
  character,
  displayUrl,
  isVideo,
  rarities,
  events,
  allRarities,
  allEvents,
}: {
  type: "waifu" | "husbando";
  character: PageChar;
  displayUrl: string | null;
  isVideo: boolean;
  rarities: RarityOrEvent[];
  events: RarityOrEvent[];
  allRarities: RarityOrEvent[];
  allEvents: RarityOrEvent[];
}) {
  const backHref = `/characters/${type}`;

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              <Link href={backHref} className="hover:text-foreground transition-colors">
                {type === "waifu" ? "Waifus" : "Husbandos"}
              </Link>
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              #{character.id} — {character.name}
            </h1>
          </div>
          <Link
            href={backHref}
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar para lista
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60 shadow-xs">
          {displayUrl ? (
            isVideo ? (
              <video
                src={displayUrl}
                className="h-auto w-full object-cover"
                controls
              />
            ) : (
              <img
                src={displayUrl}
                alt={character.name}
                className="h-auto w-full object-cover"
              />
            )
          ) : (
            <div className="flex aspect-square items-center justify-center bg-muted text-muted-foreground text-sm">
              Sem imagem
            </div>
          )}

          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Slug</span>
              <span className="text-sm font-mono">{character.slug}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Popularidade</span>
              <span className="text-sm font-semibold">{character.popularity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Likes</span>
              <span className="text-sm">{character.likes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Dislikes</span>
              <span className="text-sm">{character.dislikes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Criado em</span>
              <span className="text-sm">
                {new Date(character.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Atualizado em</span>
              <span className="text-sm">
                {new Date(character.updatedAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
            {(() => {
              const addby = character.addby;
              if (!addby || typeof addby !== "object") return null;
              const obj = addby as Record<string, unknown>;
              const name = obj.first_name
                ? `${obj.first_name}${obj.last_name ? ` ${obj.last_name}` : ""}`
                : obj.name;
              const userId = obj.id;
              return (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Adicionado por</span>
                  {userId && name ? (
                    <a
                      href={`tg://user?id=${userId}`}
                      className="text-sm hover:text-blue-400 transition-colors"
                    >
                      {String(name)}
                    </a>
                  ) : (
                    <span className="text-sm">{name ? String(name) : "—"}</span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Informações</h2>
              <CharacterEditForm
                type={type}
                character={{
                  id: character.id,
                  name: character.name,
                  origem: character.origem,
                  slug: character.slug,
                  mediaType: character.mediaType,
                  media: character.media,
                  sourceType: character.sourceType,
                  extras: character.extras,
                }}
                displayUrl={displayUrl}
                isVideo={isVideo}
                currentRarityIds={rarities.map((r) => r.id)}
                currentEventIds={events.map((e) => e.id)}
                allRarities={allRarities}
                allEvents={allEvents}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Origem</p>
                <p className="font-medium">{character.origem}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Fonte</p>
                <p className="font-medium">{character.sourceType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Mídia</p>
                <p className="font-medium">{character.mediaType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Slug</p>
                <p className="font-mono text-xs">{character.slug}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Raridades</h2>
            <div className="flex flex-wrap gap-2">
              {rarities.length > 0
                ? rarities.map((r) => (
                    <span
                      key={r.code}
                      className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-border/20 px-2 py-1 text-sm"
                    >
                      {r.emoji} {r.name}
                    </span>
                  ))
                : <span className="text-muted-foreground text-sm">Nenhuma raridade atribuída</span>}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Eventos</h2>
            <div className="flex flex-wrap gap-2">
              {events.length > 0
                ? events.map((e) => (
                    <span
                      key={e.code}
                      className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-border/20 px-2 py-1 text-sm"
                    >
                      {e.emoji} {e.name}
                    </span>
                  ))
                : <span className="text-muted-foreground text-sm">Nenhum evento atribuído</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
