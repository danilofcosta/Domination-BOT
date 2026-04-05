"use client"

import * as React from "react"
import { createCharacter, getEvents, getRarities } from "@/app/admin/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, Loader2Icon, LinkIcon, UploadIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

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

  const toggleEvent = (id: number) => {
    setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const toggleRarity = (id: number) => {
    setSelectedRarities(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewUrl(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 bg-primary">
          <PlusIcon className="mr-2 h-5 w-5" />
          Inicializar Entrada
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-8 bg-background/95 backdrop-blur-xl border-primary/10 shadow-2xl rounded-[2rem]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-4xl font-black uppercase italic text-primary leading-tight flex items-center gap-3">
             <PlusIcon className="size-8" /> Comando do Sistema
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Inicialize um novo núcleo de personagem.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-8">
           <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* LADO ESQUERDO: INFO & PREVIEW */}
                <div className="space-y-8">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Protocolo Visual</Label>
                      
                      {/* PREVIEW BOX */}
                      <div className="relative aspect-2/3 w-full bg-muted/40 rounded-3xl overflow-hidden border border-primary/10 group flex items-center justify-center shadow-inner">
                         {previewUrl ? (
                            <img 
                               src={previewUrl} 
                               alt="Preview" 
                               className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                            />
                         ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-20">
                               <ImageIcon className="size-16" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Aguardando Mídia...</span>
                            </div>
                         )}

                         <div className="absolute top-4 left-4 right-4 flex bg-background/60 backdrop-blur-md p-1 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <Button type="button" variant={mediaEntry === "url" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-xl text-[10px] font-black uppercase" onClick={() => setMediaEntry("url")}>Link</Button>
                             <Button type="button" variant={mediaEntry === "upload" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-xl text-[10px] font-black uppercase" onClick={() => setMediaEntry("upload")}>Upload</Button>
                         </div>
                      </div>

                      {mediaEntry === "url" ? (
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 ml-1" />
                            <Input 
                                name="mediaUrl" 
                                placeholder="URL segura (HTTPS)..." 
                                required={mediaEntry === "url"} 
                                className="pl-11 h-12 rounded-xl bg-card/40 border-primary/5 focus:ring-primary/20"
                                onChange={handleUrlChange}
                            />
                        </div>
                      ) : (
                        <div className="relative group">
                            <UploadIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-40 ml-1 group-hover:text-primary transition-colors" />
                            <Input 
                                type="file" 
                                name="file" 
                                accept="image/*" 
                                required={mediaEntry === "upload"} 
                                className="pl-11 h-12 rounded-xl bg-card/40 border-primary/5 file:bg-primary file:text-primary-foreground file:font-bold file:rounded-lg file:text-xs file:mr-4 file:h-full file:cursor-pointer"
                                onChange={handleFileChange}
                            />
                        </div>
                      )}
                   </div>
                </div>

                {/* LADO DIREITO: DADOS E RELAÇÕES */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="grid gap-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Designação</Label>
                          <Input name="name" placeholder="Ex: Jinx" required className="h-12 text-lg font-bold rounded-xl bg-card/40 border-primary/5" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Fonte de Origem</Label>
                          <Input name="origem" placeholder="Ex: Arcane" required className="h-12 rounded-xl bg-card/40 border-primary/5" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Variante</Label>
                            <Select name="type" defaultValue="waifu">
                              <SelectTrigger className="h-12 font-bold rounded-xl bg-card/40 border-primary/5"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl border-primary/10">
                                <SelectItem value="waifu" className="font-bold">Waifu</SelectItem>
                                <SelectItem value="husbando" className="font-bold">Husbando</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Mídia</Label>
                            <Select name="sourceType" defaultValue="ANIME">
                              <SelectTrigger className="h-12 font-bold rounded-xl bg-card/40 border-primary/5"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-xl border-primary/10">
                                <SelectItem value="ANIME">Anime</SelectItem>
                                <SelectItem value="GAME">Jogo</SelectItem>
                                <SelectItem value="MANGA">Mangá</SelectItem>
                                <SelectItem value="MOVIE">Filme</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-muted/20 rounded-3xl border border-primary/5">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                               <PlusIcon className="size-3" /> Eventos
                            </Label>
                            <ScrollArea className="h-[180px] border border-primary/5 rounded-2xl p-2 bg-background/40">
                                <div className="space-y-1.5">
                                    {availableEvents.map(e => (
                                        <div key={e.id} className="flex items-center gap-3 p-1.5 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer group" onClick={() => toggleEvent(e.id)}>
                                            <Checkbox 
                                               id={`add-ev-${e.id}`} 
                                               checked={selectedEvents.includes(e.id)}
                                               onCheckedChange={() => {}} // Handle through div
                                            />
                                            <span className="text-[11px] font-medium leading-none group-hover:text-primary transition-colors">{e.emoji} {e.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                               <PlusIcon className="size-3" /> Raridades
                            </Label>
                            <ScrollArea className="h-[180px] border border-primary/5 rounded-2xl p-2 bg-background/40">
                                <div className="space-y-1.5">
                                    {availableRarities.map(r => (
                                        <div key={r.id} className="flex items-center gap-3 p-1.5 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer group" onClick={() => toggleRarity(r.id)}>
                                            <Checkbox 
                                               id={`add-ra-${r.id}`} 
                                               checked={selectedRarities.includes(r.id)}
                                               onCheckedChange={() => {}} // Handle through div
                                            />
                                            <span className="text-[11px] font-medium leading-none group-hover:text-primary transition-colors">{r.emoji} {r.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
              </div>
           </ScrollArea>

          <DialogFooter className="mt-8 pt-6 border-t border-primary/5">
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.4em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm italic">
              {isSubmitting ? <Loader2Icon className="h-5 w-5 animate-spin" /> : "Executar Protocolo de Criação"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
