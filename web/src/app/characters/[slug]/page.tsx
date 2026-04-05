import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Calendar,
  Gem,
  ArrowLeft,
  Share2,
  SparklesIcon,
  ZapIcon,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CharacterMedia } from "@/components/character-media";
import { Footer } from "@/components/home/footer";
import { ApiCharacter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { LikeButton } from "./like-button";
import { ShareButton } from "./share-button";

async function getCharacter(slug: string) {
  // Tentar encontrar o tipo no slug (ex: nome-personagem_waifu)
  const typeHint = slug.includes("waifu") ? "waifu" : "husbando";
  let mainSlug = slug.replace(`_${typeHint}`, "");
  mainSlug = decodeURIComponent(mainSlug);
  console.log(mainSlug);

  // Se tiver a dica, buscar na tabela certa
  if (typeHint === "waifu" || typeHint === "husbando") {
    const character =
      typeHint === "waifu"
        ? await prisma.characterWaifu.findUnique({
          where: { slug: mainSlug },
          include: {
            WaifuEvent: { include: { Event: true } },
            WaifuRarity: { include: { Rarity: true } },
          },
        })
        : await prisma.characterHusbando.findUnique({
          where: { slug: mainSlug },
          include: {
            HusbandoEvent: { include: { Event: true } },
            HusbandoRarity: { include: { Rarity: true } },
          },
        })


    if (character) return { ...character, type: typeHint };
  }

  // Fallback: Buscar em ambas as tabelas
  const [waifu, husbando] = await Promise.all([
    prisma.characterWaifu.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" } },
      include: {
        WaifuEvent: { include: { Event: true } },
        WaifuRarity: { include: { Rarity: true } },
      },
    }),
    prisma.characterHusbando.findFirst({
      where: { slug: { equals: slug, mode: "insensitive" } },
      include: {
        HusbandoEvent: { include: { Event: true } },
        HusbandoRarity: { include: { Rarity: true } },
      },
    }),
  ]);

  if (waifu) return { ...waifu, type: "waifu" as const };
  if (husbando) return { ...husbando, type: "husbando" as const };
  return null;
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const character = await getCharacter(slug);

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black italic opacity-20 mb-4">
          404_NOT_FOUND
        </h1>
        <Link href="/">
          <Badge
            variant="outline"
            className="px-6 py-2 cursor-pointer hover:bg-primary/10 transition-colors"
          >
            Voltar ao Grid
          </Badge>
        </Link>
      </div>
    );
  }

  return <CharacterDetailView character={character} />;
}

function CharacterDetailView({ character }: { character: any }) {
  const rarities = character.WaifuRarity || character.HusbandoRarity || [];
  const events = character.WaifuEvent || character.HusbandoEvent || [];

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-700 selection:bg-primary/30">
      {/* 🔮 HERO SECTION WITH BACKDROP */}
      <div className="relative min-h-[85vh] w-full overflow-hidden flex flex-col group">
        {/* Dynamic Backdrop */}
        <div className="absolute inset-0 z-0">
          <CharacterMedia
            item={character}
            type={character.type}
            className="w-full h-full  object-cover blur-2xl scale-110 opacity-40 brightness-50"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto flex-1 flex flex-col justify-end pt-32 pb-16 px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/"
            className="absolute top-8 left-6 lg:left-8 flex items-center gap-3 text-muted-foreground hover:text-primary transition-all group/back"
          >
            <div className="p-3 rounded-2xl bg-card/40 backdrop-blur-xl border border-primary/5 group-hover/back:border-primary/20 transition-all shadow-xl">
              <ArrowLeft className="size-5" />
            </div>
            <span className="font-black uppercase tracking-widest text-[10px] hidden sm:block">
              Menu Principal
            </span>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-end">
            {/* 🖼️ MAIN PORTRAIT */}
            <div className="relative w-68 sm:w-80 lg:w-100 shrink-0 aspect-2/3 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(var(--primary-rgb),0.2)] border border-primary/10 group/img">
              <CharacterMedia
                item={character}
                type={character.type}
                className="w-full h-full object-cover group-hover/img:scale-140 transition-transform duration-1000 ease-out"
              />

              {/* Rarity Flares */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                {rarities.map((r: any) => (
                  <div
                    key={r.rarityId}
                    className="px-2  bg-background/20 backdrop-blur-xl border border-primary/10 rounded-2xl flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-right duration-500"
                  >
                    <span className="text-xl rotate-12">{r.Rarity.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-foreground">
                      {r.Rarity.code}
                    </span>
                  </div>
                ))}
              </div>

              {/* ID Tag */}
              <div className="absolute bottom-6 left-6 px-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                <span className="text-[10px] font-mono text-white/60">
                  #{character.id}
                </span>
              </div>
            </div>

            {/* 📝 INFO PANEL */}
            <div className="flex-1 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">
                    {character.sourceType}
                  </Badge>
                  <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">
                    {character.origem}
                  </span>
                </div>

                <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-foreground leading-[0.9] decoration-primary transition-all">
                  {character.name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
                {/* <button className="px-10 py-5 bg-primary text-primary-foreground rounded-3xl font-black uppercase italic italic tracking-tighter text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30">
                  <SparklesIcon className="size-5" /> Favoritar
                </button> */}
                <LikeButton
                  characterId={character.id}
                  characterType={character.type}
                  initialLikes={character.likes || 0}
                  slug={character.slug}
                />

                <ShareButton
                  name={character.name}
                  slug={character.slug}
                  type={character.type}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 DETAILS GRID */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left Column: Story/Info */}
        <div className="lg:col-span-2 space-y-20">
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                Sobre a Entidade
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xl font-medium max-w-3xl">
              Em destaque no universo de{" "}
              <span className="text-foreground underline decoration-primary/30">
                {character.origem}
              </span>
              , o personagem{" "}
              <span className="text-foreground underline decoration-primary/30">
                {character.name}
              </span>{" "}
              é uma peça fundamental no ecossistema Domination. Sincronizado
              originalmente em{" "}
              {new Date(character.createdAt).toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
                day: "numeric",
              })}
              .
            </p>
          </section>

          {events.length > 0 && (
            <section className="space-y-10">
              <div className="flex items-center gap-4">
                <Calendar className="size-8 text-primary" />
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                  Eventos Ativos
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((e: any) => (
                  <div
                    key={e.eventId}
                    className="group/event p-6 bg-card/30 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] flex items-center gap-6 hover:border-primary/20 hover:bg-card/50 transition-all duration-300"
                  >
                    <div className="size-16 shrink-0 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl group-hover/event:scale-110 transition-transform">
                      {e.Event.emoji}
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase italic tracking-tighter leading-none mb-1">
                        {e.Event.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                        {e.Event.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Stats sidebar */}
        <aside className="space-y-8">
          <div className="p-10 bg-card/20 backdrop-blur-2xl border border-primary/10 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group/stats">
            {/* Background Decoration */}
            <Gem className="absolute -top-10 -right-10 size-48 text-primary/5 rotate-12 group-hover/stats:scale-110 group-hover/stats:rotate-0 transition-all duration-700" />

            <h4 className="text-[10px] font-black uppercase text-center text-muted-foreground/40 tracking-[0.4em] border-b border-primary/5 pb-6">
              Status Operacional
            </h4>

            <div className="space-y-6">
              <div className="flex justify-between items-center bg-background/40 p-6 rounded-3xl border border-white/5">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest block opacity-40">
                    Popularidade
                  </span>
                  <span className="text-lg font-black uppercase italic">
                    Nível Global
                  </span>
                </div>
                <span className="text-3xl font-mono font-black text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]">
                  #{character.popularity || 0}
                </span>
              </div>

              <div className="flex justify-between items-center bg-background/40 p-6 rounded-3xl border border-white/5">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest block opacity-40">
                    Aprovação
                  </span>
                  <span className="text-lg font-black uppercase italic">
                    Likes Totais
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-mono font-black text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                    {character.likes || 0}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-background/40 p-6 rounded-3xl border border-white/5">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest block opacity-40">
                    Sincronização
                  </span>
                  <span className="text-lg font-black uppercase italic">
                    Cópias Ativas
                  </span>
                </div>
                <span className="text-3xl font-mono font-black opacity-30">
                  0
                </span>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 text-primary/40 text-[10px] font-bold uppercase tracking-widest justify-center">
                  <ZapIcon className="size-3" /> Atualizado em{" "}
                  {new Date(character.updatedAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Footer></Footer>
    </div>
  );
}
