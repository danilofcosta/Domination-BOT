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

export default async function RaritiesPage() {
  const rarities = await prisma.rarity.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Raridades</h1>
          <p className="text-zinc-500 text-sm mt-1">Defina as classificações de personagens.</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-500">
          <Link href="/admin/rarities/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova Raridade
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
            {rarities.map((rarity) => (
              <TableRow key={rarity.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="text-2xl text-center">{rarity.emoji}</TableCell>
                <TableCell className="font-mono font-bold text-zinc-100 uppercase">{rarity.code}</TableCell>
                <TableCell className="text-zinc-100">{rarity.name}</TableCell>
                <TableCell className="text-zinc-500 text-sm truncate max-w-xs">{rarity.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Link href={`/admin/rarities/${rarity.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rarities.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                  Nenhuma raridade encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
