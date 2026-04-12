"use client";

import * as React from "react";
import { Loader2Icon, SearchIcon, TrophyIcon, CrownIcon, MedalIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CollectionTop {
  characterId: number;
  characterName: string;
  characterOrigem: string;
  characterMedia: string | null;
  totalCount: number;
  uniqueOwners: number;
}

interface UserTop {
  userId: number;
  telegramId: string;
  telegramData: {
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  } | null;
  totalCharacters: number;
  waifuCount: number;
  husbandoCount: number;
}

interface CollectionStats {
  topWaifus: CollectionTop[];
  topHusbandos: CollectionTop[];
  topOwners: UserTop[];
  totalCollections: number;
  totalUsers: number;
}

async function getCollectionStatsFromServer(): Promise<CollectionStats> {
  const res = await fetch('/api/admin/collections', { cache: 'no-store' });
  if (!res.ok) {
    return {
      topWaifus: [],
      topHusbandos: [],
      topOwners: [],
      totalCollections: 0,
      totalUsers: 0,
    };
  }
  return res.json();
}

export function CollectionStats() {
  const [stats, setStats] = React.useState<CollectionStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [activeType, setActiveType] = React.useState<"waifus" | "husbandos" | "owners">("waifus");

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    try {
      setIsRefreshing(true);
      setIsLoading(true);
      const data = await getCollectionStatsFromServer();
      setStats(data);
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getFilteredList = () => {
    const searchLower = debouncedSearch.toLowerCase();
    
    if (activeType === "waifus") {
      return (stats?.topWaifus || []).filter(c => 
        c.characterName.toLowerCase().includes(searchLower) ||
        c.characterOrigem.toLowerCase().includes(searchLower)
      );
    }
    
    if (activeType === "husbandos") {
      return (stats?.topHusbandos || []).filter(c => 
        c.characterName.toLowerCase().includes(searchLower) ||
        c.characterOrigem.toLowerCase().includes(searchLower)
      );
    }
    
    return (stats?.topOwners || []).filter(u => 
      u.telegramData?.first_name?.toLowerCase().includes(searchLower) ||
      u.telegramData?.username?.toLowerCase().includes(searchLower) ||
      u.telegramId.includes(searchLower)
    );
  };

  const filteredList = getFilteredList();

  const getRankIcon = (index: number) => {
    if (index === 0) return <CrownIcon className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <MedalIcon className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <MedalIcon className="h-4 w-4 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-primary/10 bg-card/20 p-4 text-center">
          <p className="text-2xl font-black text-primary">{stats?.totalCollections || 0}</p>
          <p className="text-xs text-muted-foreground uppercase">Total Coleções</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-card/20 p-4 text-center">
          <p className="text-2xl font-black text-primary">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-muted-foreground uppercase">Total Usuários</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-card/20 p-4 text-center">
          <p className="text-2xl font-black text-pink-500">{stats?.topWaifus[0]?.totalCount || 0}</p>
          <p className="text-xs text-muted-foreground uppercase">Top Waifu</p>
        </div>
        <div className="rounded-2xl border border-primary/10 bg-card/20 p-4 text-center">
          <p className="text-2xl font-black text-blue-500">{stats?.topHusbandos[0]?.totalCount || 0}</p>
          <p className="text-xs text-muted-foreground uppercase">Top Husbando</p>
        </div>
      </div>

      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
        <TabsList className="w-full justify-start rounded-xl bg-card/50">
          <TabsTrigger value="waifus" className="rounded-lg">
            <TrophyIcon className="h-4 w-4 mr-2 text-pink-500" />
            Top Waifus
          </TabsTrigger>
          <TabsTrigger value="husbandos" className="rounded-lg">
            <TrophyIcon className="h-4 w-4 mr-2 text-blue-500" />
            Top Husbandos
          </TabsTrigger>
          <TabsTrigger value="owners" className="rounded-lg">
            <CrownIcon className="h-4 w-4 mr-2 text-yellow-500" />
            Top Donos
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="relative w-full sm:w-64 md:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Pesquisar ${activeType === 'owners' ? 'usuários' : 'personagens'}...`}
              className="pl-9 bg-card/50 border-primary/10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="waifus" className="mt-4">
          <div className="rounded-2xl border border-primary/10 bg-card/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-primary/5">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Personagem</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Donos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((item: any, index: number) => (
                  <TableRow key={`waifu-${item.characterId}-${index}`} className="border-primary/5">
                    <TableCell>{getRankIcon(index)}</TableCell>
                    <TableCell className="font-medium">{item.characterName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.characterOrigem}</TableCell>
                    <TableCell className="text-right font-mono">{item.totalCount}</TableCell>
                    <TableCell className="text-right font-mono">{item.uniqueOwners}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="husbandos" className="mt-4">
          <div className="rounded-2xl border border-primary/10 bg-card/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-primary/5">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Personagem</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Donos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((item: any, index: number) => (
                  <TableRow key={`husbando-${item.characterId}-${index}`} className="border-primary/5">
                    <TableCell>{getRankIcon(index)}</TableCell>
                    <TableCell className="font-medium">{item.characterName}</TableCell>
                    <TableCell className="text-muted-foreground">{item.characterOrigem}</TableCell>
                    <TableCell className="text-right font-mono">{item.totalCount}</TableCell>
                    <TableCell className="text-right font-mono">{item.uniqueOwners}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="owners" className="mt-4">
          <div className="rounded-2xl border border-primary/10 bg-card/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-primary/5">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="text-right">Waifus</TableHead>
                  <TableHead className="text-right">Husbandos</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((item: any, index: number) => (
                  <TableRow key={`owner-${item.userId}-${index}`} className="border-primary/5">
                    <TableCell>{getRankIcon(index)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={item.telegramData?.photo_url} />
                          <AvatarFallback>
                            {item.telegramData?.first_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{item.telegramData?.first_name} {item.telegramData?.last_name}</p>
                          {item.telegramData?.username && (
                            <p className="text-xs text-muted-foreground">@{item.telegramData.username}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-pink-500">{item.waifuCount}</TableCell>
                    <TableCell className="text-right font-mono text-blue-500">{item.husbandoCount}</TableCell>
                    <TableCell className="text-right font-mono font-bold">{item.totalCharacters}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
