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
import { Search, User as UserIcon, Coins, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
          <p className="text-zinc-500 text-sm mt-1">Visualize e edite informações dos jogadores.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Buscar por Telegram ID..." 
            className="pl-10 bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500 text-zinc-100"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-zinc-950">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Moedas</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Coleção</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                <TableCell className="font-mono text-xs text-zinc-500">{user.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium text-zinc-100">
                    <UserIcon className="w-4 h-4 text-zinc-500" />
                    {user.telegramId.toString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Coins className="w-3 h-3 text-yellow-500" />
                    <span>{user.coins}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-wider border-zinc-700 ${
                    user.profileType === 'ADMIN' ? 'text-red-400 border-red-900/50 bg-red-950/20' : 
                    user.profileType === 'MODERATOR' ? 'text-blue-400 border-blue-900/50 bg-blue-950/20' : 
                    'text-zinc-400'
                  }`}>
                    {user.profileType}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                   -
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                        Editar
                    </Button>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
