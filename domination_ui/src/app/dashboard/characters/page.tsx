"use client"

import { useEffect, useState } from "react"
import { fetchAllCharacters, fetchRarities, fetchEvents, createCharacter, updateCharacter } from "@/lib/api"
import type { Character, Rarity, Event } from "@/lib/types"
import { SourceType, MediaType } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Search, Pencil, Sparkles, Calendar, Image, Video, FileQuestion, Plus } from "lucide-react"

export default function CharactersPage() {
  const [waifus, setWaifus] = useState<Character[]>([])
  const [husbandos, setHusbandos] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "waifu" | "husbando">("all")

  const [rarityList, setRarityList] = useState<Rarity[]>([])
  const [eventList, setEventList] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editChar, setEditChar] = useState<Character | null>(null)
  const [editNome, setEditNome] = useState("")
  const [editOrigem, setEditOrigem] = useState("")
  const [editSourceType, setEditSourceType] = useState<string>("ANIME")
  const [editRarityIds, setEditRarityIds] = useState<number[]>([])
  const [editEventIds, setEditEventIds] = useState<number[]>([])
  const [editMedia, setEditMedia] = useState("")
  const [editMediaType, setEditMediaType] = useState<string>("IMAGE_URL")
  const [saving, setSaving] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<"waifu" | "husbando">("waifu")
  const [createNome, setCreateNome] = useState("")
  const [createOrigem, setCreateOrigem] = useState("")
  const [createSourceType, setCreateSourceType] = useState<string>("ANIME")
  const [createMedia, setCreateMedia] = useState("")
  const [createMediaType, setCreateMediaType] = useState<string>("IMAGE_URL")
  const [createRarityIds, setCreateRarityIds] = useState<number[]>([])
  const [createEventIds, setCreateEventIds] = useState<number[]>([])
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      setError(null)
      const [chars, rarities, events] = await Promise.all([
        fetchAllCharacters(),
        fetchRarities(),
        fetchEvents(),
      ])
      setWaifus(chars.waifus)
      setHusbandos(chars.husbandos)
      setRarityList(rarities)
      setEventList(events)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar personagens")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openEdit(c: Character) {
    setEditChar(c)
    setEditNome(c.name)
    setEditOrigem(c.origem)
    setEditSourceType(c.sourceType ?? "ANIME")
    setEditRarityIds(getRarities(c).map((r) => r.id))
    setEditEventIds(getEvents(c).map((e) => e.id))
    setEditMedia(c.media ?? "")
    setEditMediaType(c.mediaType ?? "IMAGE_URL")
    setEditOpen(true)
  }

  async function handleSave() {
    if (!editChar) return
    setSaving(true)
    try {
      await updateCharacter(editChar.id, editChar.type, {
        nome: editNome,
        origem: editOrigem,
        sourceType: editSourceType,
        media: editMedia || undefined,
        mediaType: editMediaType,
        rarities: editRarityIds.map(String),
        events: editEventIds.map(String),
      })
      await load()
      setEditOpen(false)
      setEditChar(null)
      toast("Personagem atualizado", {
        description: `${editNome} foi salvo com sucesso.`,
      })
    } catch (e) {
      toast("Erro ao salvar", {
        description: e instanceof Error ? e.message : "Tente novamente.",
      })
    } finally {
      setSaving(false)
    }
  }

  function getRarities(c: Character) {
    const list = "WaifuRarity" in c ? c.WaifuRarity : "HusbandoRarity" in c ? c.HusbandoRarity : []
    return list?.map((r) => r.Rarity) ?? []
  }

  function getEvents(c: Character) {
    const list = "WaifuEvent" in c ? c.WaifuEvent : "HusbandoEvent" in c ? c.HusbandoEvent : []
    return list?.map((e) => e.Event) ?? []
  }

  function MediaPreview({ character }: { character: Character }) {
    const m = character.media
    const mt = character.mediaType
    if (!m) return <span className="text-xs text-muted-foreground">—</span>
    if (mt === "IMAGE_URL" || mt === "IMAGE_LOCAL") {
      return (
        <img
          src={m}
          alt={character.name}
          className="h-10 w-10 rounded object-cover"
          loading="lazy"
        />
      )
    }
    if (mt === "VIDEO_URL" || mt === "VIDEO_LOCAL") {
      return (
        <video src={m} className="h-10 w-10 rounded object-cover" muted />
      )
    }
    return <FileQuestion className="size-5 text-muted-foreground" />
  }

  const all = [...waifus.map((c) => ({ ...c, type: "waifu" as const })), ...husbandos.map((c) => ({ ...c, type: "husbando" as const }))]

  const filtered = all.filter((c) => {
    if (filter !== "all" && c.type !== filter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="bg-background">
      <div className="mx-auto w-full 2xl:max-w-[1600px] px-6 py-8 pt-16 lg:pt-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Personagens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Navegue por todos os waifus e husbandos
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "waifu", "husbando"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Todos" : f === "waifu" ? "Waifus" : "Husbandos"}
              </Button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)} className="ml-auto">
            <Plus className="mr-1 size-4" />
            Adicionar
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {error}
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nenhum personagem encontrado.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {filtered.length} personagen{filtered.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Mídia</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Raridades</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead className="text-right">Popularidade</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={`${c.type}-${c.id}`}>
                      <TableCell>
                        <MediaPreview character={c} />
                      </TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant={c.type === "waifu" ? "default" : "secondary"}>
                          {c.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getRarities(c).length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            getRarities(c).map((r) => (
                              <Badge key={r.id} variant="outline" className="gap-1 px-1.5 py-0">
                                <Sparkles className="size-3" />
                                <span>{r.emoji}</span>
                                <span>{r.name}</span>
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getEvents(c).length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            getEvents(c).map((e) => (
                              <Badge key={e.id} variant="secondary" className="gap-1 px-1.5 py-0">
                                <Calendar className="size-3" />
                                <span>{e.emoji}</span>
                                <span>{e.name}</span>
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.origem}</TableCell>
                      <TableCell>{c.sourceType}</TableCell>
                      <TableCell className="text-right">{c.popularity}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="icon" onClick={() => openEdit(c)}>
                          <Pencil className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={editOpen} onOpenChange={(v) => { if (!v) { setEditChar(null) }; setEditOpen(v) }}>
          <DialogContent className="grid max-h-[85vh] grid-rows-[auto_1fr_auto] p-0 gap-0">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-2 mb-0">
              <DialogTitle>Editar Personagem</DialogTitle>
              <DialogDescription>
                Alterar dados de {editChar?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto px-6 pb-4">
              <div className="space-y-4">
                {(editMedia || editChar?.media) && (
                  <div className="flex justify-center rounded-lg border bg-muted/30 p-2">
                    {editMediaType === "IMAGE_URL" || editMediaType === "IMAGE_LOCAL" ? (
                      <img
                        src={editMedia || editChar?.media}
                        alt={editNome}
                        className="max-h-48 rounded object-contain"
                      />
                    ) : editMediaType === "VIDEO_URL" || editMediaType === "VIDEO_LOCAL" ? (
                      <video src={editMedia || editChar?.media} controls className="max-h-48 rounded" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{editMedia || editChar?.media}</span>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium">URL da Mídia</label>
                  <Input
                    value={editMedia}
                    onChange={(e) => setEditMedia(e.target.value)}
                    placeholder="URL ou file ID da imagem/vídeo"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo de Mídia</label>
                  <select
                    value={editMediaType}
                    onChange={(e) => setEditMediaType(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs"
                  >
                    {Object.values(MediaType).map((mt) => (
                      <option key={mt} value={mt}>{mt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Origem</label>
                  <Input value={editOrigem} onChange={(e) => setEditOrigem(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo de Fonte</label>
                  <select
                    value={editSourceType}
                    onChange={(e) => setEditSourceType(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs"
                  >
                    {Object.values(SourceType).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Raridades</label>
                  <div className="grid grid-cols-2 gap-1">
                    {rarityList.map((r) => {
                      const checked = editRarityIds.includes(r.id)
                      return (
                        <label
                          key={r.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setEditRarityIds(
                                checked
                                  ? editRarityIds.filter((id) => id !== r.id)
                                  : [...editRarityIds, r.id],
                              )
                            }
                            className="size-4 accent-primary"
                          />
                          <span>{r.emoji}</span>
                          <span>{r.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Eventos</label>
                  <div className="grid grid-cols-2 gap-1">
                    {eventList.map((e) => {
                      const checked = editEventIds.includes(e.id)
                      return (
                        <label
                          key={e.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setEditEventIds(
                                checked
                                  ? editEventIds.filter((id) => id !== e.id)
                                  : [...editEventIds, e.id],
                              )
                            }
                            className="size-4 accent-primary"
                          />
                          <span>{e.emoji}</span>
                          <span>{e.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-card px-6 py-4 mt-0">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="grid max-h-[85vh] grid-rows-[auto_1fr_auto] p-0 gap-0">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-2 mb-0">
              <DialogTitle>Adicionar Personagem</DialogTitle>
              <DialogDescription>Preencha os dados do novo personagem</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto px-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo</label>
                  <div className="flex gap-2">
                    {(["waifu", "husbando"] as const).map((t) => (
                      <Button
                        key={t}
                        variant={createType === t ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCreateType(t)}
                      >
                        {t === "waifu" ? "Waifu" : "Husbando"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">URL da Mídia</label>
                  <Input value={createMedia} onChange={(e) => setCreateMedia(e.target.value)} placeholder="URL ou file ID da imagem/vídeo" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo de Mídia</label>
                  <select
                    value={createMediaType}
                    onChange={(e) => setCreateMediaType(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs"
                  >
                    {Object.values(MediaType).map((mt) => (
                      <option key={mt} value={mt}>{mt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Nome</label>
                  <Input value={createNome} onChange={(e) => setCreateNome(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Origem</label>
                  <Input value={createOrigem} onChange={(e) => setCreateOrigem(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tipo de Fonte</label>
                  <select
                    value={createSourceType}
                    onChange={(e) => setCreateSourceType(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs"
                  >
                    {Object.values(SourceType).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Raridades</label>
                  <div className="grid grid-cols-2 gap-1">
                    {rarityList.map((r) => {
                      const checked = createRarityIds.includes(r.id)
                      return (
                        <label
                          key={r.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setCreateRarityIds(
                                checked
                                  ? createRarityIds.filter((id) => id !== r.id)
                                  : [...createRarityIds, r.id],
                              )
                            }
                            className="size-4 accent-primary"
                          />
                          <span>{r.emoji}</span>
                          <span>{r.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Eventos</label>
                  <div className="grid grid-cols-2 gap-1">
                    {eventList.map((e) => {
                      const checked = createEventIds.includes(e.id)
                      return (
                        <label
                          key={e.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setCreateEventIds(
                                checked
                                  ? createEventIds.filter((id) => id !== e.id)
                                  : [...createEventIds, e.id],
                              )
                            }
                            className="size-4 accent-primary"
                          />
                          <span>{e.emoji}</span>
                          <span>{e.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="border-t bg-card px-6 py-4 mt-0">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                setCreating(true)
                try {
                  await createCharacter({
                    type: createType,
                    nome: createNome,
                    origem: createOrigem,
                    sourceType: createSourceType,
                    media: createMedia,
                    mediaType: createMediaType,
                    rarities: createRarityIds.map(String),
                    events: createEventIds.map(String),
                  })
                  await load()
                  setCreateOpen(false)
                  setCreateNome("")
                  setCreateOrigem("")
                  setCreateMedia("")
                  setCreateMediaType("IMAGE_URL")
                  setCreateRarityIds([])
                  setCreateEventIds([])
                  toast("Personagem criado", {
                    description: `${createNome} foi adicionado com sucesso.`,
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
