import { prisma } from "@/lib/prisma";
import { getTelegramImageUrl } from "@/lib/telegram";
import { MediaType } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gem, ArrowLeft, Share2 } from "lucide-react";

export default async function WaifuDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const waifu = await prisma.characterWaifu.findFirst({
    where: { 
      slug: {
        equals: slug,
        mode: 'insensitive'
      }
    },
    include: {
      events: { include: { event: true } },
      rarities: { include: { rarity: true } },
    },
  });

  if (!waifu) notFound();
  const w = waifu as any;

  const displayUrl =
    waifu.linkweb && waifu.linkwebExpiresAt && new Date(waifu.linkwebExpiresAt) > new Date()
      ? waifu.linkweb
      : waifu.mediaType === MediaType.IMAGE_URL || waifu.mediaType === MediaType.VIDEO_URL
        ? waifu.media
        : await getTelegramImageUrl(waifu.media || "", "waifu");

  const isVideo = waifu.mediaType === MediaType.VIDEO_URL || waifu.mediaType === MediaType.VIDEO_FILEID;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-pink-500/30">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          {displayUrl ? (
            isVideo ? (
              <video src={displayUrl} autoPlay loop muted className="w-full h-full object-cover blur-sm scale-105 opacity-40" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayUrl} alt="" className="w-full h-full object-cover blur-sm scale-105 opacity-40 shadow-2xl" />
            )
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-6xl mx-auto h-full flex flex-col justify-end pb-12 px-8">
           <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-400 hover:text-white transition group">
              <div className="p-2 rounded-full bg-zinc-900/50 border border-zinc-800 group-hover:border-zinc-700 transition">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Voltar</span>
           </Link>

           <div className="flex flex-col md:flex-row gap-12 items-end md:items-center">
              {/* Main Portrait */}
              <div className="w-48 sm:w-64 md:w-80 aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative group mx-auto md:mx-0">
                {displayUrl ? (
                   isVideo ? (
                     <video src={displayUrl} autoPlay loop muted className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={displayUrl} alt={waifu.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700 italic">Sem Imagem</div>
                )}
                {/* Rarity Flare */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                   {waifu.rarities.map(r => (
                      <div key={r.rarityId} className="px-3 py-1 bg-zinc-950/80 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 shadow-xl">
                         <span className="text-lg">{r.rarity.emoji}</span>
                         <span className="text-[10px] font-black uppercase tracking-tighter text-white">{r.rarity.code}</span>
                      </div>
                   ))}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 space-y-6">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                       <Badge variant="secondary" className="bg-pink-600/20 text-pink-400 border-pink-500/30 px-3 py-1 text-xs uppercase font-bold tracking-widest">{waifu.sourceType}</Badge>
                       <span className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">{waifu.origem}</span>
                    </div>
                     <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl flex items-center gap-4">
                        {waifu.name}
                        {w.emoji_id && (
                           <span className="text-2xl opacity-50 font-mono font-normal">#{w.emoji_id}</span>
                        )}
                     </h1>
                 </div>

                 <div className="flex gap-4">
                    <button className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-900/20 active:scale-95">
                       Favoritar
                    </button>
                    <button className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl transition group">
                       <Share2 className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Details Sections */}
      <main className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
         <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
               <h3 className="text-2xl font-bold flex items-center gap-3 text-zinc-100 italic">
                  <div className="w-2 h-8 bg-pink-600 rounded-full" />
                  Sobre a personagem
               </h3>
               <p className="text-zinc-400 leading-relaxed text-lg">
                  {waifu.name} é uma das presenças mais marcantes de {waifu.origem}. 
                  Esta versão foi catalogada em {new Date(waifu.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
               </p>
            </section>

            {waifu.events.length > 0 && (
               <section className="space-y-6">
                  <h3 className="text-2xl font-bold flex items-center gap-3 text-zinc-100 italic">
                     <Calendar className="w-6 h-6 text-pink-500" />
                     Eventos Participantes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-300">
                     {waifu.events.map(e => (
                        <div key={e.eventId} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-4 hover:border-zinc-700 transition">
                           <span className="text-3xl">{e.event.emoji}</span>
                           <div>
                              <p className="font-bold text-white">{e.event.name}</p>
                              <p className="text-xs text-zinc-500 font-mono">{e.event.code}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            )}
         </div>

         {/* Stats Sidebar */}
         <aside className="space-y-8">
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <Gem className="w-32 h-32 rotate-12" />
               </div>
               <h4 className="text-sm font-black uppercase text-zinc-500 tracking-widest text-center border-b border-zinc-800 pb-4">Status no Bot</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl">
                     <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Popularidade</span>
                     <span className="text-2xl font-mono font-black text-pink-500">#{waifu.popularity || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl">
                     <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Cópias Ativas</span>
                     <span className="text-2xl font-mono font-black text-zinc-100">0</span>
                  </div>
               </div>
            </div>
         </aside>
      </main>

      <footer className="max-w-6xl mx-auto py-16 border-t border-zinc-900 text-center opacity-40">
         <p className="text-xs tracking-tighter">&copy; 2024 Domination-BOT - Todos os direitos reservados à {waifu.origem}</p>
      </footer>
    </div>
  );
}
