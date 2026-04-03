"use client"

import * as React from "react"
import { createCharacter, getEvents, getRarities } from "@/app/admin/actions"
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
import { PlusIcon, Loader2Icon, LinkIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

export function AddCharacterModal({ onComplete }: { onComplete: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mediaEntry, setMediaEntry] = React.useState<"url" | "upload">("url")
  
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
    }
  }, [isOpen])

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
        
        const res = await createCharacter(formData)

        if (res.success) {
          toast.success("Personagem inicializado com sucesso!")
          setIsOpen(false)
          onComplete()
        } else {
          toast.error("Falha na implantação: " + res.error)
        }
    } catch (e) {
        toast.error("Erro inesperado")
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 bg-primary">
          <PlusIcon className="mr-2 h-5 w-5" />
          Inicializar Entrada
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-3xl font-black uppercase italic text-primary leading-tight">Comando do Sistema</SheetTitle>
          <SheetDescription>Inicialize um novo núcleo de personagem.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-8 pb-20">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Designação</Label>
              <Input name="name" placeholder="Ex: Rem" required className="h-12 text-lg font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Fonte de Origem</Label>
              <Input name="origem" placeholder="Ex: Re:Zero" required className="h-12" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Variante</Label>
                <Select name="type" defaultValue="waifu">
                  <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waifu" className="font-bold">Waifu</SelectItem>
                    <SelectItem value="husbando" className="font-bold">Husbando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Mídia</Label>
                <Select name="sourceType" defaultValue="ANIME">
                  <SelectTrigger className="h-12 font-bold"><SelectValue /></SelectTrigger>
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
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Vincular Eventos</Label>
                    <ScrollArea className="h-[200px] border rounded-xl p-2 bg-background/50">
                        <div className="space-y-2">
                            {availableEvents.map(e => (
                                <div key={e.id} className="flex items-center gap-2">
                                    <Checkbox 
                                       id={`add-ev-${e.id}`} 
                                       checked={selectedEvents.includes(e.id)}
                                       onCheckedChange={() => toggleEvent(e.id)}
                                    />
                                    <Label htmlFor={`add-ev-${e.id}`} className="text-xs cursor-pointer">{e.emoji} {e.name}</Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Vincular Raridades</Label>
                    <ScrollArea className="h-[200px] border rounded-xl p-2 bg-background/50">
                        <div className="space-y-2">
                            {availableRarities.map(r => (
                                <div key={r.id} className="flex items-center gap-2">
                                    <Checkbox 
                                       id={`add-ra-${r.id}`} 
                                       checked={selectedRarities.includes(r.id)}
                                       onCheckedChange={() => toggleRarity(r.id)}
                                    />
                                    <Label htmlFor={`add-ra-${r.id}`} className="text-xs cursor-pointer">{r.emoji} {r.name}</Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Protocolo Visual</Label>
              <div className="flex bg-muted p-1 rounded-xl">
                <Button type="button" variant={mediaEntry === "url" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-lg" onClick={() => setMediaEntry("url")}>Link Direto</Button>
                <Button type="button" variant={mediaEntry === "upload" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-lg" onClick={() => setMediaEntry("upload")}>Upload</Button>
              </div>
              {mediaEntry === "url" ? (
                <Input name="mediaUrl" placeholder="URL segura (HTTPS)..." required={mediaEntry === "url"} />
              ) : (
                <Input type="file" name="file" accept="image/*" required={mediaEntry === "upload"} />
              )}
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 w-full p-6 bg-background border-t">
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20">
              {isSubmitting ? <Loader2Icon className="h-5 w-5 animate-spin" /> : "Executar Criação"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
