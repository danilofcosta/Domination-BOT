"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CharacterMedia } from "./character-media"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HeartIcon, UserIcon } from "lucide-react"
import { EditCharacterModal } from "./edit-character-modal"

export interface Character {
  id: number
  name: string
  origem: string
  likes: number
  media?: string
  mediaType?: string
  addby?: any
  WaifuEvent?: { eventId: number; Event: { id: number; name: string; emoji: string } }[]
  WaifuRarity?: { rarityId: number; Rarity: { id: number; name: string; emoji: string } }[]
  HusbandoEvent?: { eventId: number; Event: { id: number; name: string; emoji: string } }[]
  HusbandoRarity?: { rarityId: number; Rarity: { id: number; name: string; emoji: string } }[]
}

interface ColumnsProps {
  type: "waifu" | "husbando"
  currentUser?: { profileType?: string } | null
  onDelete: (id: number) => void
  onComplete: () => void
  isDeleting: number | null
}

export function getColumns({ type, currentUser, onDelete, onComplete, isDeleting }: ColumnsProps): ColumnDef<Character>[] {
  const eventKey = type === "waifu" ? "WaifuEvent" : "HusbandoEvent"
  const rarityKey = type === "waifu" ? "WaifuRarity" : "HusbandoRarity"

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.id}</span>,
    },
    {
      accessorKey: "media",
      header: "Preview",
      cell: ({ row }) => (
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-primary/10 shadow-sm bg-muted">
          <CharacterMedia item={row.original} type={type} />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Detalhes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-lg font-bold">{row.original.name}</span>
          <span className="text-xs font-normal opacity-60 flex items-center gap-2">
            {row.original.origem}
            <span className="flex items-center gap-1 text-red-500">
              <HeartIcon className="w-3 h-3 fill-current" /> {row.original.likes || 0}
            </span>
          </span>
        </div>
      ),
    },
    {
      accessorKey: "categories",
      header: "Categorias",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {row.original[eventKey]?.map((e) => (
            <Tooltip key={e.eventId}>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {e.Event.emoji}
                </Badge>
              </TooltipTrigger>
              <TooltipContent><p>{e.Event.name}</p></TooltipContent>
            </Tooltip>
          ))}
          {row.original[rarityKey]?.map((r) => (
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
      ),
      enableSorting: false,
    },
    {
      accessorKey: "addby",
      header: "Info",
      cell: ({ row }) => (
        row.original.addby ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 text-[10px] rounded hover:bg-primary/10">
                <UserIcon className="w-3 h-3 mr-1" /> Quem Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionado por:</DialogTitle>
                <DialogDescription>Informações sobre quem adicionou este personagem.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <pre className="text-xs bg-muted p-4 rounded-xl overflow-x-auto text-muted-foreground border border-primary/10">
                  {JSON.stringify(row.original.addby, null, 2)}
                </pre>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">Sistema</span>
        )
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const char = row.original
        return (
          <div className="flex items-center gap-1">
            <EditCharacterModal character={char} type={type} onComplete={onComplete} />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(char.id)}
              disabled={isDeleting === char.id}
            >
              {isDeleting === char.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )
      },
    },
  ]
}
