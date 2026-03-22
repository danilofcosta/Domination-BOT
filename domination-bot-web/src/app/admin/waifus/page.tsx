import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DeleteCharacterButton } from "@/components/delete-character-button";
import { deleteWaifu } from "@/app/admin/actions";
import { getTelegramImageUrl } from "@/lib/telegram";
import { MediaType } from "@prisma/client";

export default async function WaifusPage() {
  const waifusRaw = await prisma.characterWaifu.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        events: { include: { event: true } },
    }
  });

  const waifus = await Promise.all(waifusRaw.map(async (w) => ({
    ...w,
    displayUrl: w.mediaType === MediaType.IMAGE_URL || w.mediaType === MediaType.VIDEO_URL 
        ? w.media 
        : await getTelegramImageUrl(w.media || "", "waifu")
  })));

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Waifus</h1>
          <p className="text-zinc-500 text-sm mt-1">Adicione, edite ou remova waifus do catálogo.</p>
        </div>
        <Button asChild className="bg-pink-600 hover:bg-pink-500">
          <Link href="/admin/waifus/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova Waifu
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Buscar por nome ou origem..." 
            className="pl-10 bg-zinc-950 border-zinc-800 focus-visible:ring-pink-500 text-zinc-100"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Eventos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waifus.map((w) => (
              <TableRow key={w.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-mono text-xs text-zinc-500">{w.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-zinc-800 rounded overflow-hidden relative">
                       {w.displayUrl ? (
                           w.mediaType === MediaType.VIDEO_URL || w.mediaType === MediaType.VIDEO_FILEID ? (
                               <video src={w.displayUrl} muted className="w-full h-full object-cover" />
                           ) : (
                               // eslint-disable-next-line @next/next/no-img-element
                               <img src={w.displayUrl} alt="" className="w-full h-full object-cover" />
                           )
                       ) : (
                           <div className="w-full h-full bg-zinc-900" />
                       )}
                    </div>
                    <span className="font-medium text-zinc-100">{w.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-400">{w.origem}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-700 text-zinc-300">
                    {w.sourceType}
                  </Badge>
                </TableCell>
                <TableCell>
                    <div className="flex gap-1">
                        {w.events.map(e => (
                            <Badge key={e.eventId} variant="secondary" className="text-[9px] bg-zinc-800 h-5 text-zinc-300">
                                {e.event.emoji} {e.event.code}
                            </Badge>
                        ))}
                    </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                      <Link href={`/admin/waifus/${w.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <DeleteCharacterButton id={w.id} name={w.name} onDelete={deleteWaifu} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {waifus.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  Nenhuma waifu encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
