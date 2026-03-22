import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UsersRound, Wallet, LayoutDashboard } from "lucide-react";

export default async function AdminDashboard() {
  const [waifuCount, husbandoCount, userCount, coinSum] = await Promise.all([
    prisma.characterWaifu.count(),
    prisma.characterHusbando.count(),
    prisma.user.count(),
    prisma.user.aggregate({ _sum: { coins: true } }),
  ]);

  const stats = [
    { title: "Total Waifus", value: waifuCount, icon: Users, color: "text-pink-500" },
    { title: "Total Husbandos", value: husbandoCount, icon: UsersRound, color: "text-blue-500" },
    { title: "Usuários", value: userCount, icon: Users, color: "text-green-500" },
    { title: "Moedas Totais", value: coinSum._sum.coins || 0, icon: Wallet, color: "text-yellow-500" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-pink-500" />
        <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adicionar gráficos ou listas recentes aqui depois */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">Nenhuma atividade recente registrada.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
