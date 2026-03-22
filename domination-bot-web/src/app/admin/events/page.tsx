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
import { Plus, Edit } from "lucide-react";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { code: "asc" },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Eventos</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure os eventos globais do bot.</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-500">
          <Link href="/admin/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Link>
        </Button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[80px]">Emoji</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="text-2xl text-center">{event.emoji}</TableCell>
                <TableCell className="font-mono font-bold text-zinc-100 uppercase">{event.code}</TableCell>
                <TableCell className="text-zinc-100">{event.name}</TableCell>
                <TableCell className="text-zinc-500 text-sm truncate max-w-xs">{event.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Link href={`/admin/events/${event.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                  Nenhum evento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
