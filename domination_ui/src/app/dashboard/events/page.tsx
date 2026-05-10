"use client"

import { useEffect, useState } from "react"
import { fetchEvents, createEvent, updateEvent } from "@/lib/api"
import type { Event } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<Event | null>(null)
  const [editName, setEditName] = useState("")
  const [editCode, setEditCode] = useState("")
  const [editEmoji, setEditEmoji] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editEmojiId, setEditEmojiId] = useState("")
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createCode, setCreateCode] = useState("")
  const [createEmoji, setCreateEmoji] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createEmojiId, setCreateEmojiId] = useState("")
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      const data = await fetchEvents()
      setEvents(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openEdit(e: Event) {
    setEditItem(e)
    setEditName(e.name)
    setEditCode(e.code)
    setEditEmoji(e.emoji)
    setEditDescription(e.description ?? "")
    setEditEmojiId(e.emoji_id ?? "")
    setEditOpen(true)
  }

  async function handleSave() {
    if (!editItem) return
    setSaving(true)
    try {
      await updateEvent(editItem.id, {
        name: editName,
        code: editCode,
        emoji: editEmoji,
        description: editDescription || undefined,
        emoji_id: editEmojiId || undefined,
      })
      await load()
      setEditOpen(false)
      setEditItem(null)
      toast("Evento atualizado", {
        description: `${editEmoji} ${editName} foi salvo com sucesso.`,
      })
    } catch (e) {
      toast("Erro ao salvar", {
        description: e instanceof Error ? e.message : "Tente novamente.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-background">
      <div className="mx-auto w-full 2xl:max-w-[1600px] px-6 py-8 pt-16 lg:pt-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Eventos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eventos especiais e campanhas
          </p>
          <Button onClick={() => setCreateOpen(true)} className="mt-4">
            <Plus className="mr-1 size-4" />
            Adicionar
          </Button>
        </header>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="group relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => openEdit(event)}
                >
                  <Pencil className="size-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>{event.emoji}</span>
                    <span>{event.name}</span>
                  </CardTitle>
                  {event.description && (
                    <CardDescription>{event.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Código: <code className="rounded bg-muted px-1 py-0.5">{event.code}</code>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={(v) => { if (!v) { setEditItem(null) }; setEditOpen(v) }}>
          <DialogContent className="grid max-h-[85vh] grid-rows-[auto_1fr_auto] p-0 gap-0">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-2 mb-0">
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>
                Alterar dados de {editItem?.emoji} {editItem?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto px-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Código</label>
                  <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Emoji</label>
                  <Input value={editEmoji} onChange={(e) => setEditEmoji(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Descrição</label>
                  <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Emoji ID</label>
                  <Input value={editEmojiId} onChange={(e) => setEditEmojiId(e.target.value)} placeholder="ID do emoji personalizado" />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-card px-6 py-4 mt-0">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="grid max-h-[85vh] grid-rows-[auto_1fr_auto] p-0 gap-0">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-2 mb-0">
              <DialogTitle>Adicionar Evento</DialogTitle>
              <DialogDescription>Preencha os dados do novo evento</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto px-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={createName} onChange={(e) => setCreateName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Código</label>
                  <Input value={createCode} onChange={(e) => setCreateCode(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Emoji</label>
                  <Input value={createEmoji} onChange={(e) => setCreateEmoji(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Descrição</label>
                  <Input value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Emoji ID</label>
                  <Input value={createEmojiId} onChange={(e) => setCreateEmojiId(e.target.value)} placeholder="ID do emoji personalizado" />
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-card px-6 py-4 mt-0">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                setCreating(true)
                try {
                  await createEvent({
                    name: createName,
                    code: createCode,
                    emoji: createEmoji,
                    description: createDescription || undefined,
                    emoji_id: createEmojiId || undefined,
                  })
                  await load()
                  setCreateOpen(false)
                  setCreateName("")
                  setCreateCode("")
                  setCreateEmoji("")
                  setCreateDescription("")
                  setCreateEmojiId("")
                  toast("Evento criado", {
                    description: `${createEmoji} ${createName} foi adicionado com sucesso.`,
                  })
                } catch (e) {
                  toast("Erro ao criar", {
                    description: e instanceof Error ? e.message : "Tente novamente.",
                  })
                } finally {
                  setCreating(false)
                }
              }} disabled={creating}>
                {creating ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
