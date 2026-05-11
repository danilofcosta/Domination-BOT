"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { fetchAllCharacters, fetchRarities, fetchEvents, fetchUsers, fetchCollections } from "@/lib/api"
import type { Character, Rarity, Event } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface DashboardData {
  waifus: Character[]
  husbandos: Character[]
  totalWaifus: number
  totalHusbandos: number
  rarities: Rarity[]
  events: Event[]
  totalUsers: number
  totalCollections: number
}

const sourceTypeColors: Record<string, string> = {
  ANIME: "var(--color-chart-1)",
  GAME: "var(--color-chart-2)",
  MANGA: "var(--color-chart-3)",
  MOVIE: "var(--color-chart-4)",
}

function statCard(title: string, value: number | string, loading: boolean) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="font-heading text-3xl font-semibold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

function processSourceData(waifus: Character[], husbandos: Character[]) {
  const all = [...waifus, ...husbandos]
  const counts: Record<string, number> = {}
  for (const c of all) {
    const key = c.sourceType ?? "ANIME"
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value, fill: sourceTypeColors[name] ?? "var(--color-chart-1)" }))
}

function processRarityData(characters: Character[], rarities: Rarity[]) {
  const rarityCount: Record<string, number> = {}
  for (const r of rarities) {
    rarityCount[r.name] = 0
  }
  for (const c of characters) {
    const raritiesList = "WaifuRarity" in c ? c.WaifuRarity : "HusbandoRarity" in c ? c.HusbandoRarity : []
    if (raritiesList) {
      for (const r of raritiesList) {
        const name = r.Rarity.name
        rarityCount[name] = (rarityCount[name] ?? 0) + 1
      }
    }
  }
  return Object.entries(rarityCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function processPopularityData(waifus: Character[], husbandos: Character[]) {
  const all = [...waifus, ...husbandos]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10)
  return all.map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name,
    popularity: c.popularity,
    type: "type" in c ? c.type : "unknown",
  }))
}

function processRecentData(waifus: Character[], husbandos: Character[]) {
  return [...waifus, ...husbandos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [chars, rarities, events, usersRes, collectionsRes] = await Promise.all([
          fetchAllCharacters(),
          fetchRarities(),
          fetchEvents(),
          fetchUsers(1, 1),
          fetchCollections(1, 1)
        ])
        setData({ ...chars, rarities, events, totalUsers: usersRes.total, totalCollections: collectionsRes.total })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao carregar dados")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Erro de Conexão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Não foi possível conectar à API em{" "}
              <code className="rounded bg-muted px-1 py-0.5">{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}</code>
            </p>
            <p className="mt-2 text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sourceData = data ? processSourceData(data.waifus, data.husbandos) : []
  const allChars = data ? [...data.waifus, ...data.husbandos] : []
  const rarityData = data ? processRarityData(allChars, data.rarities) : []
  const popularityData = data ? processPopularityData(data.waifus, data.husbandos) : []
  const recentData = data ? processRecentData(data.waifus, data.husbandos) : []

  return (
    <div className="bg-background">
      <div className="mx-auto w-full 2xl:max-w-[1600px] px-6 py-8 pt-16 lg:pt-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Painel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visão geral de todos os personagens, raridades e eventos
          </p>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCard("Total Waifus", data?.totalWaifus ?? 0, loading)}
          {statCard("Total Husbandos", data?.totalHusbandos ?? 0, loading)}
          {statCard("Raridades", data?.rarities.length ?? 0, loading)}
          {statCard("Eventos", data?.events.length ?? 0, loading)}
          {statCard("Coleções", data?.totalCollections ?? 0, loading)}
          {statCard("Usuários", data?.totalUsers ?? 0, loading)}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Personagens por Tipo de Fonte</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Personagens por Raridade</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rarityData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="var(--color-chart-2)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top 10 Mais Populares</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-80 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularityData} layout="vertical" barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={120} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="popularity" radius={[0, 4, 4, 0]} fill="var(--color-chart-3)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Personagens Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-right">Popularidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentData.map((c) => (
                      <TableRow key={`${c.type}-${c.id}`}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant={c.type === "waifu" ? "default" : "secondary"}>
                            {c.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.origem}</TableCell>
                        <TableCell className="text-right">{c.popularity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
