"use client"

import * as React from "react"
import { getCharacters, deleteCharacter } from "@/app/admin/actions"
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
import { Badge } from "@/components/ui/badge"
import { SearchIcon, Loader2Icon, Trash2Icon, PlusIcon, CalendarIcon, StarIcon, HeartIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"
import { AddCharacterModal } from "./add-character-modal"
import { EditCharacterModal } from "./edit-character-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CharacterMedia } from "./character-media"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface CharacterManagementTableProps {
  initialType?: "waifu" | "husbando";
}

export function CharacterManagementTable({ initialType = "waifu" }: CharacterManagementTableProps) {
  const [type, setType] = React.useState<"waifu" | "husbando">(initialType)
  const [characters, setCharacters] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getCharacters(type, debouncedSearch)
    setCharacters(data)
    setIsLoading(false)
  }, [type, debouncedSearch])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir?")) return
    setIsDeleting(id)
    const res = await deleteCharacter(id, type)
    if (res.success) {
      toast.success("Excluído com sucesso")
      fetchData()
    } else {
      toast.error("Erro ao excluir: " + res.error)
    }
    setIsDeleting(null)
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 bg-card/50 border-primary/10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <AddCharacterModal onComplete={() => fetchData()} currentType={type} />
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-card/20 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-primary/5 hover:bg-transparent">
              <TableHead className="w-15 py-4">ID</TableHead>
              <TableHead className="w-20">Preview</TableHead>
              <TableHead className="font-bold">Detalhes</TableHead>
              <TableHead className="font-bold">Categorias</TableHead>
              <TableHead className="font-bold">Info</TableHead>
              <TableHead className="text-right font-bold pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-64 text-center">Sincronizando...</TableCell></TableRow>
            ) : characters.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-64 text-center">Nenhum registro.</TableCell></TableRow>
            ) : (
              characters.map((char) => (
                <TableRow key={char.id} className="group border-primary/5 hover:bg-primary/3">
                  <TableCell className="font-mono text-muted-foreground">{char.id}</TableCell>
                  <TableCell className="py-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/10 shadow-sm bg-muted">
                        <CharacterMedia item={char} type={type} />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">
                    <div className="flex flex-col">
                      <span className="text-lg">{char.name}</span>
                      <span className="text-xs font-normal opacity-60 flex items-center gap-2">
                        {char.origem}
                        <span className="flex items-center gap-1 text-red-500">
                          <HeartIcon className="w-3 h-3 fill-current" /> {char.likes || 0}
                        </span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                       {/* Eventos */}
                       {char[type === "waifu" ? "WaifuEvent" : "HusbandoEvent"]?.map((e: any) => (
                          <Tooltip key={e.eventId}>
                             <TooltipTrigger asChild>
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                                   {e.Event.emoji}
                                </Badge>
                             </TooltipTrigger>
                             <TooltipContent><p>{e.Event.name}</p></TooltipContent>
                          </Tooltip>
                       ))}
                       {/* Raridades */}
                       {char[type === "waifu" ? "WaifuRarity" : "HusbandoRarity"]?.map((r: any) => (
                          <Tooltip key={r.rarityId}>
                             <TooltipTrigger asChild>
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                   {r.Rarity.emoji}
                                </Badge>
                             </TooltipTrigger>
                             <TooltipContent><p>{r.Rarity.name}</p></TooltipContent>
                          </Tooltip>
                       ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {char.addby ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-6 text-[10px] rounded hover:bg-primary/10">
                            <UserIcon className="w-3 h-3 mr-1" /> Quem Add
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                           <DialogHeader>
                             <DialogTitle>Adicionado por:</DialogTitle>
                           </DialogHeader>
                           <div className="space-y-4">
                             <pre className="text-xs bg-muted p-4 rounded-xl overflow-x-auto text-muted-foreground border border-primary/10">
                               {JSON.stringify(char.addby, null, 2)}
                             </pre>
                           </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Sistema</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <EditCharacterModal character={char} type={type} onComplete={() => fetchData()} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(char.id)}
                        disabled={isDeleting === char.id}
                      >
                        {isDeleting === char.id ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <Trash2Icon className="h-4 w-4" />}
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
  )
}
