import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTelegramImageUrl } from "@/lib/telegram";
import { MediaType } from "@prisma/client";

export default async function Home() {
  const waifusRaw = await prisma.characterWaifu.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  const husbandosRaw = await prisma.characterHusbando.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  // Resolve URLs com cache e tokens corretos
  const waifus = await Promise.all(
    waifusRaw.map(async (w) => ({
      ...w,
      displayUrl:
        w.linkweb && w.linkwebExpiresAt && new Date(w.linkwebExpiresAt) > new Date()
          ? w.linkweb
          : w.mediaType === MediaType.IMAGE_URL || w.mediaType === MediaType.VIDEO_URL
            ? w.media
            : await getTelegramImageUrl(w.media || "", "waifu"),
    }))
  );

  const husbandos = await Promise.all(
    husbandosRaw.map(async (h) => ({
      ...h,
      displayUrl:
        h.linkweb && h.linkwebExpiresAt && new Date(h.linkwebExpiresAt) > new Date()
          ? h.linkweb
          : h.mediaType === MediaType.IMAGE_URL || h.mediaType === MediaType.VIDEO_URL
            ? h.media
            : await getTelegramImageUrl(h.media || "", "husbando"),
    }))
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans transition-colors duration-500">
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="group cursor-default">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-blue-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
            Domination-BOT
          </h1>
          <p className="text-zinc-500 mt-2 italic font-medium tracking-tight">Explore a elite do universo colecionável</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-3 md:gap-4">
          <Link href="/collection" className="px-4 py-2 md:px-5 md:py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl hover:border-zinc-700 font-medium text-sm md:text-base">
            Coleção
          </Link>
          <Link href="/admin" className="px-4 py-2 md:px-5 md:py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl hover:border-zinc-700 text-sm md:text-base">
            Admin
          </Link>
          <button className="px-5 py-2 md:px-6 md:py-2.5 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-900/30 active:scale-95 text-sm md:text-base">
            Login
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto space-y-24">
        {/* Waifus Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black border-l-8 border-pink-600 pl-6 tracking-tighter uppercase italic">Waifus Recentes</h2>
              <p className="text-zinc-600 text-[10px] md:text-sm ml-8 font-bold tracking-widest uppercase">Novas adições à coleção feminina</p>
            </div>
            <Link href="/waifus" className="text-pink-500 hover:text-pink-400 transition text-[10px] md:text-sm font-black uppercase tracking-tighter bg-pink-500/10 px-4 py-2 rounded-xl border border-pink-500/20 w-fit">Ver tudo &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
            {waifus.length > 0 ? (
              waifus.map((w) => (
                <Link key={w.id} href={`/waifus/${w.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all duration-500 shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2">
                  <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                    {w.displayUrl ? (
                      w.mediaType !== MediaType.VIDEO_URL && w.mediaType !== MediaType.VIDEO_FILEID ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.displayUrl} alt={w.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <video src={w.displayUrl} autoPlay loop muted className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                      )
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-zinc-700">Sem Imagem</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                       <h3 className="font-black truncate text-sm text-white drop-shadow-md">{w.name}</h3>
                       <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5 line-clamp-1">{w.origem}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/20">
                <p className="text-zinc-600 font-black uppercase tracking-widest">Nenhuma waifu detectada</p>
              </div>
            )}
          </div>
        </section>

        {/* Husbandos Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black border-l-8 border-blue-600 pl-6 tracking-tighter uppercase italic">Husbandos Recentes</h2>
              <p className="text-zinc-600 text-[10px] md:text-sm ml-8 font-bold tracking-widest uppercase">Guerreiros recém-chegados à batalha</p>
            </div>
            <Link href="/husbandos" className="text-blue-500 hover:text-blue-400 transition text-[10px] md:text-sm font-black uppercase tracking-tighter bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 w-fit">Ver tudo &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
            {husbandos.length > 0 ? (
              husbandos.map((h) => (
                <Link key={h.id} href={`/husbandos/${h.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
                  <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                    {h.displayUrl ? (
                      h.mediaType !== MediaType.VIDEO_URL && h.mediaType !== MediaType.VIDEO_FILEID ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.displayUrl} alt={h.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <video src={h.displayUrl} autoPlay loop muted className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                      )
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-zinc-700">Sem Imagem</div>
                    )}
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 to-transparent opacity-80" />
                     <div className="absolute bottom-0 left-0 p-4 w-full">
                        <h3 className="font-black truncate text-sm text-white drop-shadow-md">{h.name}</h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5 line-clamp-1">{h.origem}</p>
                     </div>
                  </div>
                </Link>
              ))
            ) : (
               <div className="col-span-full py-24 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/20">
                <p className="text-zinc-600 font-black uppercase tracking-widest">Nenhum husbando detectado</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-40 pb-20 border-t border-zinc-900 text-center space-y-6">
        <div className="pt-12 flex justify-center gap-10 text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-black">
           <span className="hover:text-blue-500 transition-colors cursor-pointer">Github</span>
           <span className="hover:text-pink-500 transition-colors cursor-pointer">Discord</span>
           <span className="hover:text-purple-500 transition-colors cursor-pointer">Comandos</span>
        </div>
        <p className="text-zinc-800 text-[10px] font-medium tracking-widest uppercase">&copy; 2024 Domination-BOT. Engine de Entretenimento de Elite.</p>
     
     
      </footer>
      
    </div>
  );
}
