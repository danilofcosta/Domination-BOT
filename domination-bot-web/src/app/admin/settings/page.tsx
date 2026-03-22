import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, RefreshCw, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-zinc-500 text-sm mt-1">Ajuste parâmetros globais do bot e do painel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Economia */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Economia & Recompensas</CardTitle>
            <CardDescription>Ajuste os ganhos e taxas do jogo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily-coins">Moedas Diárias (Check-in)</Label>
              <Input id="daily-coins" type="number" defaultValue="100" className="bg-zinc-950 border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drop-multiplier">Multiplicador de Drops</Label>
              <Input id="drop-multiplier" type="number" step="0.1" defaultValue="1.0" className="bg-zinc-950 border-zinc-800" />
            </div>
          </CardContent>
        </Card>

        {/* Global Flags */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Status do Bot</CardTitle>
            <CardDescription>Ative ou desative funcionalidades globais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center space-x-3">
                <Checkbox id="maintenance" />
                <Label htmlFor="maintenance" className="font-medium cursor-pointer">Modo Manutenção</Label>
             </div>
             <div className="flex items-center space-x-3">
                <Checkbox id="events-active" defaultChecked />
                <Label htmlFor="events-active" className="font-medium cursor-pointer">Eventos Ativos</Label>
             </div>
             <div className="flex items-center space-x-3">
                <Checkbox id="drops-active" defaultChecked />
                <Label htmlFor="drops-active" className="font-medium cursor-pointer">Drops Habilitados</Label>
             </div>
          </CardContent>
        </Card>

        {/* Cache Control */}
        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
          <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                Gerenciamento de Cache
             </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
             <p className="text-sm text-zinc-400">Limpe o cache das imagens e URLs do Telegram caso encontre problemas.</p>
             <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800 hover:text-white">
                Limpar Cache Agora
             </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-red-900/30 md:col-span-2 border-dashed">
             <CardContent className="pt-6 flex items-center gap-4 text-red-500/80">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs uppercase tracking-widest font-bold">Atenção: Alterações aqui afetam o funcionamento de todos os usuários em tempo real.</p>
             </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
         <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 px-8">
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
         </Button>
      </div>
    </div>
  );
}
