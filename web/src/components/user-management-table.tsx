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
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por ID do Telegram..."
            className="pl-9 bg-card/50 border-primary/10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-primary/5 hover:bg-transparent">
              <TableHead className="w-25">Avatar</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo de Perfil</TableHead>
              <TableHead>Moedas</TableHead>
              <TableHead>Idioma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando usuários...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-primary/5 hover:bg-primary/3">
                  <TableCell>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                       {/* <UserIcon className="text-primary h-5 w-5" /> */}
                       <img src="https://i.pinimg.com/736x/57/a3/f6/57a3f6824101576a8d83a81d60e9bccb.jpg" alt="x"  className="rounded-full"/>

                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold">{user.telegramId}</TableCell>
                  <TableCell className="font-bold">{user.telegramData?.first_name || "Desconecido"
                }</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-black uppercase tracking-tighter shadow-sm border-primary/20">
                      {user.profileType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-yellow-500">
                    💰 {user.coins}
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {user.language}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
