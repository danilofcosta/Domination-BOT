"use client"

import * as React from "react"
import { getTelegramGroups, updateTelegramGroup, deleteTelegramGroup } from "@/app/admin/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SearchIcon, Loader2Icon, SettingsIcon, Trash2Icon, RefreshCwIcon, Users2Icon, SaveIcon } from "lucide-react"
import { toast } from "sonner"

interface TelegramGroupManagementProps {
  currentUser?: { profileType?: string } | null;
}

export function TelegramGroupManagement({ currentUser }: TelegramGroupManagementProps) {
  const [groups, setGroups] = React.useState<any[]>([])
  const [filteredGroups, setFilteredGroups] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [editingGroupId, setEditingGroupId] = React.useState<number | null>(null)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getTelegramGroups()
    setGroups(data)
    setFilteredGroups(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    const query = searchQuery.toLowerCase()
    if (!query) {
      setFilteredGroups(groups)
    } else {
      setFilteredGroups(groups.filter(g => 
        g.groupName?.toLowerCase().includes(query) ||
        g.groupId?.toLowerCase().includes(query)
      ))
    }
  }, [searchQuery, groups])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEdit = (group: any) => {
    setEditingGroupId(group.id)
  }

  const handleCancel = () => {
    setEditingGroupId(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (editingGroupId === null) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateTelegramGroup(editingGroupId, formData)
    
    if (res.success) {
      toast.success("Grupo atualizado com sucesso!")
      setEditingGroupId(null)
      fetchData()
    } else {
      toast.error("Erro ao atualizar grupo: " + res.error)
    }
    setIsSubmitting(false)
  }

  const canDelete = currentUser?.profileType && ["SUPREME", "SUPER_ADMIN", "ADMIN"].includes(currentUser.profileType)

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return
    const res = await deleteTelegramGroup(id, currentUser?.profileType)
    if (res.success) {
      toast.success("Grupo excluído!")
      fetchData()
    } else {
      toast.error("Erro ao excluir: " + res.error)
    }
  }

  const editingGroup = groups.find(g => g.id === editingGroupId)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 px-4 lg:px-6">
      {/* FORMULÁRIO DE EDIÇÃO */}
      <div className="xl:col-span-1">
        <Card className="bg-card/50 backdrop-blur-md border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tighter italic text-primary flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              {editingGroupId ? "Editar Grupo" : "Selecione um Grupo"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingGroupId ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="groupName">Nome do Grupo</Label>
                  <Input 
                    name="groupName" 
                    defaultValue={editingGroup?.groupName} 
                    required 
                    className="bg-muted/20 border-primary/5 rounded-xl" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="groupId">ID do Telegram (Somente Leitura)</Label>
                  <Input 
                    name="groupId" 
                    value={editingGroup?.groupId} 
                    readOnly 
                    className="bg-muted/40 border-primary/5 rounded-xl opacity-60" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="configuration">Configuração (JSON)</Label>
                  <Textarea 
                    name="configuration" 
                    defaultValue={JSON.stringify(editingGroup?.configuration || {}, null, 2)} 
                    rows={8}
                    className="bg-muted/20 border-primary/5 rounded-xl font-mono text-xs" 
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/10">
                    {isSubmitting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <><SaveIcon className="mr-2 h-4 w-4" /> Salvar</>}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="rounded-xl font-bold uppercase tracking-widest">
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                <Users2Icon className="h-12 w-12 opacity-20" />
                <p>Clique no ícone de editar em um grupo para alterar suas configurações.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE GRUPOS */}
      <div className="xl:col-span-2">
        <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
          <div className="p-4 border-b border-primary/10 bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
             <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Users2Icon className="h-4 w-4 text-primary" /> Grupos do Telegram
             </h3>
             <div className="flex gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:flex-initial sm:w-64">
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input
                   placeholder="Pesquisar grupos..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-9 bg-background/50"
                 />
               </div>
               <Button variant="ghost" size="icon" onClick={fetchData} className="rounded-full h-8 w-8">
                  <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
               </Button>
             </div>
          </div>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead>Nome do Grupo</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={4} className="h-64 text-center">Carregando grupos...</TableCell></TableRow>
              ) : filteredGroups.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center text-muted-foreground">Nenhum grupo encontrado.</TableCell></TableRow>
              ) : (
                filteredGroups.map((group) => (
                  <TableRow key={group.id} className="border-primary/5 hover:bg-primary/[0.03]">
                    <TableCell className="font-bold">{group.groupName}</TableCell>
                    <TableCell className="font-mono text-xs opacity-60">{group.groupId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(group.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-primary/60 hover:text-primary hover:bg-primary/10 rounded-full" onClick={() => handleEdit(group)}>
                        <SettingsIcon className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                      <Button variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDelete(group.id)}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                      )}
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
