"use client"

import * as React from "react"
import { updateCharacter, getEvents, getRarities } from "@/app/admin/actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, Loader2Icon, LinkIcon, UploadIcon, EditIcon, CheckSquareIcon, SquareIcon } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

export function EditCharacterModal({ character, type, onComplete }: { character: any, type: "waifu" | "husbando", onComplete: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mediaEntry, setMediaEntry] = React.useState<"url" | "upload">(character.media?.startsWith("http") ? "url" : "upload")
  
  const [availableEvents, setAvailableEvents] = React.useState<any[]>([])
  const [availableRarities, setAvailableRarities] = React.useState<any[]>([])
  
  const [selectedEvents, setSelectedEvents] = React.useState<number[]>([])
  const [selectedRarities, setSelectedRarities] = React.useState<number[]>([])

  React.useEffect(() => {
    if (isOpen) {
      // Carregar listas
      getEvents().then(setAvailableEvents)
      getRarities().then(setAvailableRarities)
      
      // Carregar seleções atuais
      const currentEvents = character[type === "waifu" ? "WaifuEvent" : "HusbandoEvent"]?.map((e: any) => e.eventId) || []
      const currentRarities = character[type === "waifu" ? "WaifuRarity" : "HusbandoRarity"]?.map((r: any) => r.rarityId) || []
      
      setSelectedEvents(currentEvents)
      setSelectedRarities(currentRarities)
    }
  }, [isOpen, character, type])

  const toggleEvent = (id: number) => {
    setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const toggleRarity = (id: number) => {
    setSelectedRarities(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
        const formData = new FormData(event.currentTarget)
        formData.append("eventIds", JSON.stringify(selectedEvents))
        formData.append("rarityIds", JSON.stringify(selectedRarities))
        
        const res = await updateCharacter(character.id, type, formData)

        if (res.success) {
          toast.success("Personagem atualizado!")
          setIsOpen(false)
          onComplete()
        } else {
          toast.error("Erro na atualização: " + res.error)
        }
    } catch (e) {
        toast.error("Ocorreu um erro")
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-primary/40 hover:text-primary">
          <EditIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Personagem</SheetTitle>
          <SheetDescription>Modifique os dados de {character.name}.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-6 pb-20">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input name="name" defaultValue={character.name} required />
            </div>
            <div className="grid gap-2">
              <Label>Origem</Label>
              <Input name="origem" defaultValue={character.origem} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Mídia</Label>
                <Select name="sourceType" defaultValue={character.sourceType}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="ANIME">Anime</SelectItem>
                      <SelectItem value="GAME">Jogo</SelectItem>
                      <SelectItem value="MANGA">Mangá</SelectItem>
                      <SelectItem value="MOVIE">Filme</SelectItem>
                   </SelectContent>
                </Select>
              </div>
            </div>

            {/* RELAÇÕES M:N */}
            <div className="grid grid-cols-2 gap-6 p-4 bg-muted/40 rounded-2xl border border-primary/5">
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Eventos</Label>
                    <ScrollArea className="h-[200px] border rounded-xl p-2 bg-background/50">
                        <div className="space-y-2">
                            {availableEvents.map(e => (
                                <div key={e.id} className="flex items-center gap-2">
                                    <Checkbox 
                                       id={`edit-ev-${e.id}`} 
                                       checked={selectedEvents.includes(e.id)}
                                       onCheckedChange={() => toggleEvent(e.id)}
                                    />
                                    <Label htmlFor={`edit-ev-${e.id}`} className="text-xs cursor-pointer">{e.emoji} {e.name}</Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Raridades</Label>
                    <ScrollArea className="h-[200px] border rounded-xl p-2 bg-background/50">
                        <div className="space-y-2">
                            {availableRarities.map(r => (
                                <div key={r.id} className="flex items-center gap-2">
                                    <Checkbox 
                                       id={`edit-ra-${r.id}`} 
                                       checked={selectedRarities.includes(r.id)}
                                       onCheckedChange={() => toggleRarity(r.id)}
                                    />
                                    <Label htmlFor={`edit-ra-${r.id}`} className="text-xs cursor-pointer">{r.emoji} {r.name}</Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* MÍDIA */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Visual</Label>
              <div className="flex bg-muted p-1 rounded-xl">
                 <Button type="button" variant={mediaEntry === "url" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-lg" onClick={() => setMediaEntry("url")}>URL</Button>
                 <Button type="button" variant={mediaEntry === "upload" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-lg" onClick={() => setMediaEntry("upload")}>Upload</Button>
              </div>
              {mediaEntry === "url" ? (
                 <Input name="mediaUrl" defaultValue={character.media} placeholder="Link HTTPS..." />
              ) : (
                 <Input type="file" name="file" accept="image/*" />
              )}
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 w-full p-6 bg-background border-t">
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-bold uppercase tracking-widest">
                {isSubmitting ? <Loader2Icon className="h-5 w-5 animate-spin" /> : "Salvar Alterações"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
