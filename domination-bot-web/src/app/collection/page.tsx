import { prisma } from "@/lib/prisma";
import { getTelegramImageUrl } from "@/lib/telegram";
import { MediaType } from "@prisma/client";
import Link from "next/link";
import { Search, Heart, UserCircle, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TelegramInitializer } from "@/components/telegram-initializer";
import { Suspense } from "react";

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ telegramId?: string }>;
}) {
  const { telegramId } = await searchParams;

  const user = telegramId
    ? await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
        include: {
          waifuCollection: { include: { character: true } },
          husbandoCollection: { include: { character: true } },
        },
      })
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <Suspense>
        <TelegramInitializer />
      </Suspense>
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Minha Coleção</h1>
          <p className="text-zinc-500 mt-2">Veja os personagens que você já conquistou.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        <form className="flex gap-4 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-xl">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input 
                name="telegramId"
                placeholder="Digite seu Telegram ID para ver sua coleção..." 
                defaultValue={telegramId}
                className="pl-12 bg-zinc-950 border-zinc-800 h-12 rounded-2xl focus:ring-purple-500"
              />
           </div>
           <Button type="submit" className="bg-purple-600 hover:bg-purple-500 h-12 px-8 rounded-2xl font-bold">
              Buscar
           </Button>
        </form>

        {user ? (
          <div className="space-y-16">
            {/* Waifus Section */}
            <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 italic">
                 <Heart className="w-6 h-6 text-pink-500" />
                 Minhas Waifus ({user.waifuCollection.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {user.waifuCollection.map(async (item) => {
                  const displayUrl = item.character.mediaType === MediaType.IMAGE_URL || item.character.mediaType === MediaType.VIDEO_URL
                    ? item.character.media
                    : await getTelegramImageUrl(item.character.media || "", "waifu");

                  return (
                    <Link key={item.id} href={`/waifus/${item.character.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all shadow-xl">
                      <div className="aspect-[3/4] relative">
                         {displayUrl ? (
                           <img src={displayUrl} alt={item.character.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-800">No Image</div>
                         )}
                         <div className="absolute top-2 right-2 px-2 py-1 bg-zinc-950/80 rounded-lg text-[10px] font-black text-white">x{item.count}</div>
                         <div className="absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-zinc-950 to-transparent">
                            <p className="text-xs font-bold truncate">{item.character.name}</p>
                         </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

             {/* Husbandos Section */}
             <section>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 italic">
                 <UserCircle className="w-6 h-6 text-blue-500" />
                 Meus Husbandos ({user.husbandoCollection.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {user.husbandoCollection.map(async (item) => {
                   const displayUrl = item.character.mediaType === MediaType.IMAGE_URL || item.character.mediaType === MediaType.VIDEO_URL
                    ? item.character.media
                    : await getTelegramImageUrl(item.character.media || "", "husbando");

                  return (
                    <Link key={item.id} href={`/husbandos/${item.character.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all shadow-xl">
                      <div className="aspect-[3/4] relative">
                         {displayUrl ? (
                           <img src={displayUrl} alt={item.character.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-800">No Image</div>
                         )}
                         <div className="absolute top-2 right-2 px-2 py-1 bg-zinc-950/80 rounded-lg text-[10px] font-black text-white">x{item.count}</div>
                         <div className="absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-zinc-950 to-transparent">
                            <p className="text-xs font-bold truncate">{item.character.name}</p>
                         </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          </div>
        ) : (
          telegramId && (
            <div className="py-32 text-center border-4 border-dashed border-zinc-900 rounded-[3rem]">
               <p className="text-zinc-600 font-black uppercase tracking-widest">Nenhum usuário encontrado com este ID</p>
            </div>
          )
        )}

        {!telegramId && (
           <div className="py-32 text-center border-4 border-dashed border-zinc-900 rounded-[3rem] bg-zinc-900/10">
              <Briefcase className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-600 font-black uppercase tracking-widest">Insira seu ID acima para começar</p>
           </div>
        )}
      </main>
    </div>
  );
}
