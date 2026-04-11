"use client"

import * as React from "react"
import { getEvents, createEvent, deleteEvent, updateEvent } from "@/app/admin/actions"
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
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SearchIcon, Loader2Icon, PlusIcon, Trash2Icon, RefreshCwIcon, CalendarIcon, Edit2Icon } from "lucide-react"
import { toast } from "sonner"

interface EventManagementProps {
  currentUser?: { profileType?: string } | null;
}

export function EventManagement({ currentUser }: EventManagementProps) {
  const [events, setEvents] = React.useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [editingEvent, setEditingEvent] = React.useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getEvents()
    setEvents(data)
    setFilteredEvents(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    const query = searchQuery.toLowerCase()
    if (!query) {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter(e => 
        e.name?.toLowerCase().includes(query) ||
        e.code?.toLowerCase().includes(query) ||
        e.emoji?.includes(query)
      ))
    }
  }, [searchQuery, events])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)
    const formData = new FormData(form)
    const res = await createEvent(formData)
    if (res.success) {
      toast.success("Evento criado com sucesso!")
      form.reset()
      setIsAddDialogOpen(false)
      fetchData()
    } else {
      toast.error("Erro ao criar evento: " + res.error)
    }
    setIsSubmitting(false)
  }

  const canDelete = currentUser?.profileType && ["SUPREME", "SUPER_ADMIN", "ADMIN"].includes(currentUser.profileType)

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este evento? Isso pode afetar personagens vinculados.")) return
    const res = await deleteEvent(id, currentUser?.profileType)
    if (res.success) {
      toast.success("Evento excluído!")
      fetchData()
    } else {
      toast.error("Erro ao excluir: " + res.error)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingEvent) return
    const form = e.currentTarget
    setIsSubmitting(true)
    const formData = new FormData(form)
    const res = await updateEvent(editingEvent.id, formData)
    if (res.success) {
      toast.success("Evento atualizado!")
      form.reset()
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
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="font-black uppercase tracking-widest text-sm">Eventos Registrados</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={fetchData} className="rounded-full h-8 w-8">
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl gap-2">
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Evento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Novo Evento</DialogTitle>
                <DialogDescription>Preencha os dados para criar um novo evento.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Nome do Evento</Label>
                  <Input id="add-name" name="name" required placeholder="Ex: Natal 2024" className="bg-muted/20 border-primary/5 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-code">Código Único</Label>
                  <Input id="add-code" name="code" required placeholder="Ex: natal_2024" className="bg-muted/20 border-primary/5 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-emoji">Emoji</Label>
                  <Input id="add-emoji" name="emoji" required placeholder="Ex: 🎄" className="bg-muted/20 border-primary/5 rounded-xl" />
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
              placeholder="Pesquisar eventos..."
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
                <TableHead className="w-24">Emoji ID</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={6} className="h-32 text-center">Carregando...</TableCell></TableRow>
              ) : filteredEvents.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Nenhum evento encontrado.</TableCell></TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id} className="border-primary/5 hover:bg-primary/[0.03]">
                    <TableCell className="font-mono text-muted-foreground">{event.id}</TableCell>
                    <TableCell className="text-2xl">{event.emoji}</TableCell>
                    <TableCell className="font-bold">{event.name}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs opacity-60 uppercase">{event.code}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{event.emoji_id || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg" onClick={() => {
                          setEditingEvent(event);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        {canDelete && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => handleDelete(event.id)}>
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        )}
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
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Editar Evento</DialogTitle>
            <DialogDescription>Edite os dados do evento selecionado.</DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome do Evento</Label>
                <Input id="edit-name" name="name" defaultValue={editingEvent.name} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Código Único</Label>
                <Input id="edit-code" name="code" defaultValue={editingEvent.code} required />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="edit-emoji">Emoji</Label>
                <Input id="edit-emoji" name="emoji" defaultValue={editingEvent.emoji} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-emoji-id">Emoji ID (Opcional)</Label>
                <Input id="edit-emoji-id" name="emoji_id" defaultValue={editingEvent.emoji_id || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-desc">Descrição</Label>
                <Input id="edit-desc" name="description" defaultValue={editingEvent.description || ""} />
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
