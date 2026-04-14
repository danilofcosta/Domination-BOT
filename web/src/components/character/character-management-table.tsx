"use client"

import * as React from "react"
import { getCharacters, deleteCharacter, bulkUpdateCharacters, getEvents, getRarities } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { SearchIcon, XIcon, Edit3Icon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AddCharacterModal } from "./add-character-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "./data-table"
import { getColumns, Character } from "./columns"
import { VisibilityState } from "@tanstack/react-table"

interface CharacterManagementTableProps {
  initialType?: "waifu" | "husbando";
  currentUser?: { profileType?: string } | null;
}

export function CharacterManagementTable({ initialType = "waifu", currentUser }: CharacterManagementTableProps) {
  const [type, setType] = React.useState<"waifu" | "husbando">(initialType)
  const [characters, setCharacters] = React.useState<Character[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [idSearch, setIdSearch] = React.useState<number | null>(null)
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null)
  const [events, setEvents] = React.useState<any[]>([])
  const [rarities, setRarities] = React.useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = React.useState<string>("all")
  const [selectedRarity, setSelectedRarity] = React.useState<string>("all")
  const [selectedMediaType, setSelectedMediaType] = React.useState<string>("all")
  const [rowSelection, setRowSelection] = React.useState<VisibilityState>({})
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)
  const [bulkEvent, setBulkEvent] = React.useState<string>("none")
  const [bulkRarity, setBulkRarity] = React.useState<string>("none")
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false)

  React.useEffect(() => {
    async function loadFilters() {
      const [evts, rars] = await Promise.all([getEvents(), getRarities()])
      setEvents(evts)
      setRarities(rars)
    }
    loadFilters()
  }, [])

  const hasFilters = selectedEvent !== "all" || selectedRarity !== "all" || selectedMediaType !== "all"

  const clearFilters = () => {
    setSelectedEvent("all")
    setSelectedRarity("all")
    setSelectedMediaType("all")
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (search.startsWith("#")) {
        const parsed = parseInt(search.slice(1))
        setIdSearch(isNaN(parsed) ? null : parsed)
        setDebouncedSearch("")
      } else {
        setIdSearch(null)
        setDebouncedSearch(search)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    const eventId = selectedEvent !== "all" ? parseInt(selectedEvent) : undefined
    const rarityId = selectedRarity !== "all" ? parseInt(selectedRarity) : undefined
    const data = await getCharacters(type, debouncedSearch, idSearch || undefined, eventId, rarityId, selectedMediaType)
    setCharacters(data)
    setIsLoading(false)
    setRowSelection({})
  }, [type, debouncedSearch, idSearch, selectedEvent, selectedRarity, selectedMediaType])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return
    setIsDeleting(id)
    const res = await deleteCharacter(id, type, currentUser?.profileType)
    if (res.success) {
      toast.success("Excluído com sucesso")
      fetchData()
    } else {
      toast.error("Erro ao excluir: " + res.error)
    }
    setIsDeleting(null)
  }

  const columns = React.useMemo(
    () => getColumns({ type, currentUser, onDelete: handleDelete, onComplete: fetchData, isDeleting }),
    [type, currentUser, isDeleting, fetchData]
  )

  const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]).map(key => {
    const index = parseInt(key)
    return characters[index]?.id
  }).filter(Boolean) as number[]

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecione personagens primeiro")
      return
    }

    setIsBulkUpdating(true)
    const eventIds = bulkEvent === "remove" ? [] : (bulkEvent !== "none" ? [parseInt(bulkEvent)] : undefined)
    const rarityIds = bulkRarity === "remove" ? [] : (bulkRarity !== "none" ? [parseInt(bulkRarity)] : undefined)

    const res = await bulkUpdateCharacters(selectedIds, type, eventIds, rarityIds, currentUser?.profileType)
    
    if (res.success) {
      toast.success(`${res.updated} personagem(s) atualizado(s)`)
      setBulkDialogOpen(false)
      setBulkEvent("none")
      setBulkRarity("none")
      fetchData()
    } else {
      toast.error(res.error || "Erro ao atualizar")
    }
    setIsBulkUpdating(false)
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-muted/50 p-1 rounded-xl border border-primary/10 shadow-inner">
          <Button
            variant={type === "waifu" ? "default" : "ghost"}
            size="sm"
            onClick={() => setType("waifu")}
            className={`rounded-lg transition-all ${type === "waifu" ? "bg-pink-600 hover:bg-pink-700 shadow-md" : ""}`}
          >
            Waifus
          </Button>
          <Button
            variant={type === "husbando" ? "default" : "ghost"}
            size="sm"
            onClick={() => setType("husbando")}
            className={`rounded-lg transition-all ${type === "husbando" ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" : ""}`}
          >
            Husbandos
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[160px] bg-card/50 border-primary/10 rounded-xl">
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Eventos</SelectItem>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  {e.emoji} {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRarity} onValueChange={setSelectedRarity}>
            <SelectTrigger className="w-[160px] bg-card/50 border-primary/10 rounded-xl">
              <SelectValue placeholder="Raridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Raridades</SelectItem>
              {rarities.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.emoji} {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMediaType} onValueChange={setSelectedMediaType}>
            <SelectTrigger className="w-[160px] bg-card/50 border-primary/10 rounded-xl">
              <SelectValue placeholder="Mídia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Mídias</SelectItem>
              <SelectItem value="IMAGE_URL">🖼️ URL Imagem</SelectItem>
              <SelectItem value="VIDEO_URL">🎥 URL Vídeo</SelectItem>
              <SelectItem value="IMAGE_FILEID">🆔 ID Imagem</SelectItem>
              <SelectItem value="VIDEO_FILEID">🆔 ID Vídeo</SelectItem>
              <SelectItem value="IMAGE_LOCAL">📁 Local Imagem</SelectItem>
              <SelectItem value="VIDEO_LOCAL">📁 Local Vídeo</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <XIcon className="w-4 h-4 mr-1" /> Limpar
            </Button>
          )}

          <div className="relative w-full md:w-80 ml-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar... (#ID para buscar por ID)"
              className="flex h-9 w-full rounded-xl border border-primary/10 bg-card/50 pl-9 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <AddCharacterModal onComplete={() => fetchData()} currentType={type} />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
          <span className="text-sm font-medium">
            {selectedIds.length} selecionado(s)
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setRowSelection({})}>
              Limpar seleção
            </Button>
            <Button size="sm" onClick={() => setBulkDialogOpen(true)}>
              <Edit3Icon className="w-4 h-4 mr-1" /> Editar em massa
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Sincronizando...</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={characters}
          searchKey="name"
          searchPlaceholder="Filtrar por nome..."
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      )}

      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar em massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Selecionados: <Badge variant="secondary">{selectedIds.length}</Badge>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Evento</label>
              <Select value={bulkEvent} onValueChange={setBulkEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Manter atual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Manter atual</SelectItem>
                  <SelectItem value="remove">Remover evento</SelectItem>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.emoji} {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Raridade</label>
              <Select value={bulkRarity} onValueChange={setBulkRarity}>
                <SelectTrigger>
                  <SelectValue placeholder="Manter atual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Manter atual</SelectItem>
                  <SelectItem value="remove">Remover raridade</SelectItem>
                  {rarities.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.emoji} {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleBulkUpdate} disabled={isBulkUpdating}>
              {isBulkUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Atualizar {selectedIds.length} personagem(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
