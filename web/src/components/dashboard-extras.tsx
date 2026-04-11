"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Calendar, Star, Users, Grid3x3 } from "lucide-react";

interface ExtendedStats {
  totalUsers: number;
  totalCharacters: number;
  totalCollections: number;
  totalWaifus: number;
  totalHusbandos: number;
  totalLikes: number;
  totalDislikes: number;
  totalEvents: number;
  totalRarities: number;
  totalGroups: number;
}

interface TopItem {
  name: string;
  emoji: string;
  count: number;
}

interface RecentCharacter {
  id: number;
  name: string;
  origem: string;
  likes: number;
  createdAt: Date;
}

interface DashboardExtrasProps {
  stats: ExtendedStats;
  topEvents: TopItem[];
  topRarities: TopItem[];
  recentCharacters: {
    waifus: RecentCharacter[];
    husbandos: RecentCharacter[];
  };
}

export function DashboardExtras({ stats, topEvents, topRarities, recentCharacters }: DashboardExtrasProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<Heart className="size-5 text-pink-500" />}
          label="Total de Likes"
          value={stats.totalLikes.toLocaleString("pt-BR")}
          color="bg-pink-500/10"
        />
        <StatCard
          icon={<Eye className="size-5 text-orange-500" />}
          label="Total de Dislikes"
          value={stats.totalDislikes.toLocaleString("pt-BR")}
          color="bg-orange-500/10"
        />
        <StatCard
          icon={<Calendar className="size-5 text-green-500" />}
          label="Eventos"
          value={stats.totalEvents}
          color="bg-green-500/10"
        />
        <StatCard
          icon={<Star className="size-5 text-yellow-500" />}
          label="Raridades"
          value={stats.totalRarities}
          color="bg-yellow-500/10"
        />
        <StatCard
          icon={<Users className="size-5 text-blue-500" />}
          label="Grupos"
          value={stats.totalGroups}
          color="bg-blue-500/10"
        />
        <StatCard
          icon={<Grid3x3 className="size-5 text-purple-500" />}
          label="Coletas"
          value={stats.totalCollections.toLocaleString("pt-BR")}
          color="bg-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="size-5 text-green-500" />
              Eventos Mais Usados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento cadastrado</p>
            ) : (
              <div className="space-y-2">
                {topEvents.map((event, index) => (
                  <div key={event.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </Badge>
                      <span className="text-xl">{event.emoji}</span>
                      <span className="font-medium">{event.name}</span>
                    </div>
                    <Badge variant="secondary">{event.count} usos</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Star className="size-5 text-yellow-500" />
              Raridades Mais Usadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRarities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma raridade cadastrada</p>
            ) : (
              <div className="space-y-2">
                {topRarities.map((rarity, index) => (
                  <div key={rarity.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </Badge>
                      <span className="text-xl">{rarity.emoji}</span>
                      <span className="font-medium">{rarity.name}</span>
                    </div>
                    <Badge variant="secondary">{rarity.count} usos</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-pink-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-pink-500">Últimas Waifus</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCharacters.waifus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma waifu cadastrada</p>
            ) : (
              <div className="space-y-2">
                {recentCharacters.waifus.map((char) => (
                  <div key={char.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">#{char.id} {char.name}</p>
                      <p className="text-xs text-muted-foreground">{char.origem}</p>
                    </div>
                    <div className="flex items-center gap-1 text-pink-500">
                      <Heart className="size-3" />
                      <span className="text-xs font-bold">{char.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-blue-500">Últimos Husbandos</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCharacters.husbandos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum husbando cadastrado</p>
            ) : (
              <div className="space-y-2">
                {recentCharacters.husbandos.map((char) => (
                  <div key={char.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">#{char.id} {char.name}</p>
                      <p className="text-xs text-muted-foreground">{char.origem}</p>
                    </div>
                    <div className="flex items-center gap-1 text-blue-500">
                      <Heart className="size-3" />
                      <span className="text-xs font-bold">{char.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
