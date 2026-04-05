"use client"

import * as React from "react"
import { createCharacter, getEvents, getRarities } from "@/app/admin/actions"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  PlusIcon, Loader2Icon, LinkIcon, UploadIcon,
  ImageIcon, XIcon, CheckIcon
} from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function AddCharacterModal({ onComplete }: { onComplete: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mediaEntry, setMediaEntry] = React.useState<"url" | "upload">("url")
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const [availableEvents, setAvailableEvents] = React.useState<any[]>([])
  const [availableRarities, setAvailableRarities] = React.useState<any[]>([])
  const [selectedEvents, setSelectedEvents] = React.useState<number[]>([])
  const [selectedRarities, setSelectedRarities] = React.useState<number[]>([])

  React.useEffect(() => {
    if (isOpen) {
      getEvents().then(setAvailableEvents)
      getRarities().then(setAvailableRarities)
      setSelectedEvents([])
      setSelectedRarities([])
      setPreviewUrl(null)
    }
  }, [isOpen])

  const toggleEvent = (id: number) =>
    setSelectedEvents(prev => prev.includes(id)
      ? prev.filter(e => e !== id)
      : [...prev, id])

  const toggleRarity = (id: number) =>
    setSelectedRarities(prev => prev.includes(id)
      ? prev.filter(r => r !== id)
      : [...prev, id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.append("eventIds", JSON.stringify(selectedEvents))
      formData.append("rarityIds", JSON.stringify(selectedRarities))

      const res = await createCharacter(formData)

      if (res.success) {
        toast.success("Personagem criado!")
        setIsOpen(false)
        onComplete()
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("Erro inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-5 w-5" />
          Inicializar Entrada
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl w-[95vw] h-[95vh] flex flex-col overflow-hidden">

        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <PlusIcon /> Criar Personagem
          </DialogTitle>
          <DialogDescription>
            Configure os dados do personagem
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden gap-6">

          {/* SCROLL */}
          <ScrollArea className="flex-1 min-h-0 pr-2">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">

              {/* LEFT - PREVIEW */}
              <div className="flex flex-col min-h-0 space-y-4 border p-3 rounded-2xl bg-muted/20">
                <Label className="text-xs font-bold text-center">Preview</Label>

                <div className="relative w-full h-full min-h-[240px] rounded-xl flex items-center justify-center overflow-hidden bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="opacity-20 size-12" />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => setMediaEntry("url")}>
                    Link
                  </Button>
                  <Button type="button" size="sm" onClick={() => setMediaEntry("upload")}>
                    Upload
                  </Button>
                </div>
              </div>

              {/* RIGHT - FORM */}
              <div className="flex flex-col min-h-0 space-y-6">

                {/* INPUTS */}
                <div className="space-y-3">
                  <Input name="name" placeholder="Nome" required />
                  <Input name="origem" placeholder="Origem" required />

                  {mediaEntry === "url" ? (
                    <Input
                      name="mediaUrl"
                      placeholder="URL da imagem"
                      onChange={(e) => setPreviewUrl(e.target.value)}
                    />
                  ) : (
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setPreviewUrl(URL.createObjectURL(file))
                      }}
                    />
                  )}
                </div>

                {/* SELECTS */}
                <div className="flex gap-2">
                  <Select name="type" defaultValue="waifu">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waifu">Waifu</SelectItem>
                      <SelectItem value="husbando">Husbando</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select name="sourceType" defaultValue="ANIME">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANIME">Anime</SelectItem>
                      <SelectItem value="GAME">Game</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* EVENTOS */}
                <div>
                  <Label>Eventos</Label>
                  <div className="h-[160px] overflow-auto border rounded-lg p-2 space-y-1">
                    {availableEvents.map(e => (
                      <div
                        key={e.id}
                        onClick={() => toggleEvent(e.id)}
                        className={cn(
                          "p-2 rounded cursor-pointer text-sm",
                          selectedEvents.includes(e.id)
                            ? "bg-primary text-white"
                            : "hover:bg-muted"
                        )}
                      >
                        {e.emoji} {e.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* RARIDADES */}
                <div>
                  <Label>Raridades</Label>
                  <div className="h-[160px] overflow-auto border rounded-lg p-2 space-y-1">
                    {availableRarities.map(r => (
                      <div
                        key={r.id}
                        onClick={() => toggleRarity(r.id)}
                        className={cn(
                          "p-2 rounded cursor-pointer text-sm",
                          selectedRarities.includes(r.id)
                            ? "bg-primary text-white"
                            : "hover:bg-muted"
                        )}
                      >
                        {r.emoji} {r.name}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </ScrollArea>

          {/* FOOTER */}
          <DialogFooter className="pt-4 border-t flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <XIcon className="mr-2 size-4" />
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <>
                  <CheckIcon className="mr-2 size-4" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}