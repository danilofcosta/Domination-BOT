import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTelegramImageUrl } from "@/lib/telegram";
import { MediaType } from "@prisma/client";
import { ArrowLeft, Search, Filter } from "lucide-react";

export default async function WaifusPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const waifusRaw = await prisma.characterWaifu.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { origem: { contains: q, mode: 'insensitive' } }
      ]
    } : {},
    orderBy: { name: "asc" },
  });

  const waifus = await Promise.all(
    waifusRaw.map(async (w) => ({
      ...w,
      displayUrl:
        w.mediaType === MediaType.IMAGE_URL || w.mediaType === MediaType.VIDEO_URL
          ? w.media
          : await getTelegramImageUrl(w.media || "", "waifu"),
    }))
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 md:mb-16 space-y-6 md:space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition group">
            <div className="p-2 rounded-full bg-zinc-900/50 border border-zinc-800 group-hover:border-zinc-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium tracking-tight text-sm md:text-base">Início</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/husbandos" className="px-4 py-2 md:px-5 md:py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white font-medium text-xs md:text-sm">
              Husbandos
            </Link>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent tracking-tighter italic uppercase">
            Waifus
          </h1>
          <p className="text-zinc-500 max-w-2xl text-sm md:text-lg font-medium leading-relaxed">
            A elite absoluta das personagens femininas.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-2 md:pt-4">
          <form className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-600 group-focus-within:text-pink-500 transition-colors" />
            <input 
              type="text" 
              name="q"
              placeholder="Pesquisar..."
              defaultValue={q}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 focus:outline-none focus:border-pink-500/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-700 text-sm md:text-base font-medium"
            />
          </form>
          <button className="px-6 py-3 md:px-8 md:py-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all font-bold text-zinc-400 hover:text-white text-sm md:text-base">
            <Filter className="w-4 h-4 md:w-5 md:h-5" />
            Filtros
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
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
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 italic text-xs">Sem Imagem</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h3 className="font-extrabold truncate text-sm text-white drop-shadow-md group-hover:text-pink-400 transition-colors uppercase tracking-tight">{w.name}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 line-clamp-1 font-bold">{w.origem}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/10">
              <Search className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
              <p className="text-zinc-600 font-black uppercase tracking-widest text-xl">Nada encontrado</p>
              <p className="text-zinc-700 text-sm mt-2">Tente ajustar sua pesquisa ou explore as novidades na home.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-32 py-16 border-t border-zinc-900 text-center opacity-40">
        <p className="text-xs uppercase tracking-[0.4em] font-black">&copy; 2024 Domination-BOT - A Galeria de Elite</p>
      </footer>
    </div>
  );
}
