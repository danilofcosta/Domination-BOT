"use client"

import * as React from "react"
import { getRarities, createRarity, deleteRarity, updateRarity } from "@/app/admin/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SearchIcon, Loader2Icon, PlusIcon, Trash2Icon, RefreshCwIcon, StarIcon, Edit2Icon } from "lucide-react"
import { toast } from "sonner"

export function RarityManagement() {
  const [rarities, setRarities] = React.useState<any[]>([])
  const [filteredRarities, setFilteredRarities] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [editingRarity, setEditingRarity] = React.useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getRarities()
    setRarities(data)
    setFilteredRarities(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    const query = searchQuery.toLowerCase()
    if (!query) {
      setFilteredRarities(rarities)
    } else {
      setFilteredRarities(rarities.filter(r => 
        r.name?.toLowerCase().includes(query) ||
        r.code?.toLowerCase().includes(query) ||
        r.emoji?.includes(query)
      ))
    }
  }, [searchQuery, rarities])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createRarity(formData)
    if (res.success) {
      toast.success("Raridade criada com sucesso!")
      e.currentTarget.reset()
      setIsAddDialogOpen(false)
      fetchData()
    } else {
      toast.error("Erro ao criar raridade: " + res.error)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta raridade? Isso afetará personagens vinculados.")) return
    const res = await deleteRarity(id)
    if (res.success) {
      toast.success("Raridade excluída!")
      fetchData()
    } else {
      toast.error("Erro ao excluir: " + res.error)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRarity) return
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateRarity(editingRarity.id, formData)
    if (res.success) {
      toast.success("Raridade atualizada!")
      setIsEditDialogOpen(false)
      fetchData()
    } else {
      toast.error("Erro ao atualizar: " + res.error)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <StarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-black uppercase tracking-widest text-sm">Raridades Disponíveis</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={fetchData} className="rounded-full h-8 w-8">
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl gap-2">
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Raridade</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Nova Raridade</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Nome da Raridade</Label>
                  <Input id="add-name" name="name" required placeholder="Ex: Lendário" className="bg-muted/20 border-primary/5 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-code">Código Único</Label>
                  <Input id="add-code" name="code" required placeholder="Ex: legendary" className="bg-muted/20 border-primary/5 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-emoji">Emoji</Label>
                  <Input id="add-emoji" name="emoji" required placeholder="Ex: ✨" className="bg-muted/20 border-primary/5 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-emoji-id">Emoji ID (Opcional)</Label>
                  <Input id="add-emoji-id" name="emoji_id" placeholder="ID do emoji customizado..." className="bg-muted/20 border-primary/5 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-desc">Descrição (Opcional)</Label>
                  <Input id="add-desc" name="description" placeholder="Uma breve descrição..." className="bg-muted/20 border-primary/5 rounded-xl" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : <><PlusIcon className="h-4 w-4 mr-2" /> Criar</>}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <div className="p-3 border-b border-primary/10 bg-muted/20">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar raridades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-primary/5 hover:bg-transparent">
                <TableHead className="w-12">ID</TableHead>
                <TableHead className="w-16">Emoji</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Código</TableHead>
                <TableHead className="hidden lg:table-cell">Emoji ID</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={6} className="h-32 text-center">Carregando...</TableCell></TableRow>
              ) : filteredRarities.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Nenhuma raridade encontrada.</TableCell></TableRow>
              ) : (
                filteredRarities.map((rarity) => (
                  <TableRow key={rarity.id} className="border-primary/5 hover:bg-primary/[0.03]">
                    <TableCell className="font-mono text-muted-foreground">{rarity.id}</TableCell>
                    <TableCell className="text-2xl">{rarity.emoji}</TableCell>
                    <TableCell className="font-bold">{rarity.name}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs opacity-60 uppercase">{rarity.code}</TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">{rarity.emoji_id || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg" onClick={() => {
                          setEditingRarity(rarity);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDelete(rarity.id)}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Editar Raridade</DialogTitle>
          </DialogHeader>
          {editingRarity && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome da Raridade</Label>
                <Input id="edit-name" name="name" defaultValue={editingRarity.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Código Único</Label>
                <Input id="edit-code" name="code" defaultValue={editingRarity.code} required />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="edit-emoji">Emoji</Label>
                <Input id="edit-emoji" name="emoji" defaultValue={editingRarity.emoji} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-emoji-id">Emoji ID (Opcional)</Label>
                <Input id="edit-emoji-id" name="emoji_id" defaultValue={editingRarity.emoji_id || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-desc">Descrição</Label>
                <Input id="edit-desc" name="description" defaultValue={editingRarity.description || ""} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
