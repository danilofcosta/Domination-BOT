"use client"

import * as React from "react"
import { getUsers } from "@/app/admin/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, Loader2Icon, UserIcon } from "lucide-react"

export function UserManagementTable() {
  const [users, setUsers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getUsers()
    setUsers(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredUsers = users.filter(u => 
    u.telegramId.includes(search) || 
    (u.telegramData && JSON.stringify(u.telegramData).toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full sm:w-64 md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9 bg-card/50 border-primary/10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead className="w-12">Avatar</TableHead>
                <TableHead className="hidden sm:table-cell">Telegram ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">Moedas</TableHead>
                <TableHead className="hidden lg:table-cell">Idioma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Carregando usuários...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-primary/5 hover:bg-primary/3">
                    <TableCell>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.telegramData?.first_name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono font-bold text-xs">{user.telegramId}</TableCell>
                    <TableCell className="font-bold text-sm">{user.telegramData?.first_name || "Desconhecido"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="font-black uppercase tracking-tighter shadow-sm border-primary/20 text-xs">
                        {user.profileType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-bold text-yellow-500 text-sm">
                      💰 {user.coins}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-medium text-muted-foreground text-sm">
                      {user.language}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
