"use client"

import { useCollections } from "@/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserCircle, Hash } from "lucide-react"

export default function CollectionsPage() {
  const { data, isLoading, error } = useCollections(1, 1000)

  const collections = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <div className="bg-background">
      <div className="mx-auto w-full 2xl:max-w-[1600px] px-6 py-8 pt-16 lg:pt-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Coleções</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as coleções de personagens dos usuários
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {(error as Error).message}
            </CardContent>
          </Card>
        ) : collections.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma coleção encontrada.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {total} registro{total !== 1 ? "s" : ""} de coleção
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Usuário (Telegram ID)</TableHead>
                    <TableHead>Personagem ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead className="text-right">Adicionado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((c) => (
                    <TableRow key={`${c.type}-${c.id}`}>
                      <TableCell className="font-medium text-muted-foreground">#{c.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCircle className="size-4 text-muted-foreground" />
                          <span className="font-medium">{c.userId.toString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Hash className="size-4 text-muted-foreground" />
                          <span>{c.characterId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.type === "waifu" ? "default" : "secondary"} className="uppercase text-xs">
                          {c.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          {c.count}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
