"use client"

import * as React from "react"
import { updateCharacter, getEvents, getRarities } from "@/app/admin/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2Icon, LinkIcon, UploadIcon, EditIcon, ImageIcon, XIcon, CheckIcon, SaveIcon } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export function EditCharacterModal({ character, type, onComplete }: { character: any, type: "waifu" | "husbando", onComplete: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mediaEntry, setMediaEntry] = React.useState<"url" | "upload">(character.media?.startsWith("http") ? "url" : "upload")
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(character.media?.startsWith("http") ? character.media : null)
  
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
      setPreviewUrl(character.media?.startsWith("http") ? character.media : null)
    }
  }, [isOpen, character, type])

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
        
        const res = await updateCharacter(character.id, type, formData)

        if (res.success) {
          toast.success("Personagem atualizado com sucesso!")
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-primary/40 hover:text-primary transition-colors">
          <EditIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl w-[95vw] sm:w-full max-h-[95vh] overflow-hidden flex flex-col p-4 sm:p-8 bg-background/95 backdrop-blur-xl border-primary/10 shadow-2xl rounded-[1.5rem] sm:rounded-[2rem]">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-2xl sm:text-4xl font-black uppercase italic text-primary leading-tight flex items-center gap-3">
             <EditIcon className="size-6 sm:size-8" /> Atualizar Registro
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[8px] sm:text-[10px]">Alteração nos dados do módulo {character.name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4 sm:gap-8">
           <ScrollArea className="flex-1 pr-2 sm:pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                
                {/* LADO ESQUERDO: PREVIEW */}
                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 block">Módulo Visual (Preview)</Label>
                   <div className="relative aspect-2/3 w-full bg-muted/40 rounded-2xl sm:rounded-3xl overflow-hidden border border-primary/10 group flex items-center justify-center shadow-inner">
                      {previewUrl ? (
                         <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                         />
                      ) : (
                         <div className="flex flex-col items-center gap-2 text-muted-foreground opacity-20">
                            <ImageIcon className="size-12 sm:size-16" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sem Imagem Direta</span>
                         </div>
                      )}

                      <div className="absolute top-4 left-4 right-4 flex bg-background/60 backdrop-blur-md p-1 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button type="button" variant={mediaEntry === "url" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-lg text-[9px] font-black uppercase" onClick={() => setMediaEntry("url")}>URL</Button>
                          <Button type="button" variant={mediaEntry === "upload" ? "secondary" : "ghost"} size="sm" className="flex-1 rounded-lg text-[9px] font-black uppercase" onClick={() => setMediaEntry("upload")}>Upload</Button>
                      </div>
                   </div>
                </div>

                {/* LADO DIREITO: DADOS E RELAÇÕES */}
                <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid gap-1.5 sm:gap-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 text-xs">Designação</Label>
                          <Input name="name" defaultValue={character.name} required className="h-10 sm:h-12 text-md sm:text-lg font-bold rounded-xl bg-card/40 border-primary/5" />
                        </div>
                        <div className="grid gap-1.5 sm:gap-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-50 text-xs">Fonte de Origem</Label>
                          <Input name="origem" defaultValue={character.origem} required className="h-10 sm:h-12 rounded-xl bg-card/40 border-primary/5" />
                        </div>

                        {/* MÍDIA LOGO ABAIXO DA ORIGEM */}
                        <div className="grid gap-3 p-3 sm:p-5 bg-primary/5 rounded-2xl border border-primary/10">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                               <ImageIcon className="size-3" /> Configuração Visual
                            </Label>
                             {mediaEntry === "url" ? (
                              <div className="relative">
                                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary opacity-40" />
                                  <Input 
                                      name="mediaUrl" 
                                      defaultValue={character.media}
                                      placeholder="Link HTTPS..." 
                                      className="pl-11 h-10 sm:h-12 rounded-xl bg-background border-primary/10"
                                      onChange={handleUrlChange}
                                  />
                              </div>
                            ) : (
                              <div className="relative">
                                  <UploadIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary opacity-40" />
                                  <Input 
                                      type="file" 
                                      name="file" 
                                      accept="image/*" 
                                      className="pl-11 h-10 sm:h-12 rounded-xl bg-background border-primary/10 file:bg-primary file:text-primary-foreground file:font-semibold"
                                      onChange={handleFileChange}
                                  />
                              </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Categoria de Mídia</Label>
                          <Select name="sourceType" defaultValue={character.sourceType}>
                            <SelectTrigger className="h-10 sm:h-12 font-bold rounded-xl bg-card/40 border-primary/5"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/10 backdrop-blur-md">
                              <SelectItem value="ANIME">Anime</SelectItem>
                              <SelectItem value="GAME">Jogo</SelectItem>
                              <SelectItem value="MANGA">Mangá</SelectItem>
                              <SelectItem value="MOVIE">Filme</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 bg-muted/20 rounded-2xl sm:rounded-3xl border border-primary/5">
                        <div className="space-y-3 sm:space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Protocolos de Evento</Label>
                            <ScrollArea className="h-[120px] sm:h-[220px] border border-primary/5 rounded-xl sm:rounded-2xl p-2 bg-background/40">
                                <div className="space-y-1">
                                    {availableEvents.map(e => (
                                        <div 
                                          key={e.id} 
                                          className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer group hover:bg-primary/10",
                                            selectedEvents.includes(e.id) ? "bg-primary/5 text-primary" : "text-muted-foreground"
                                          )}
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            toggleEvent(e.id);
                                          }}
                                        >
                                            <div className={cn(
                                              "size-4 rounded-md border-2 border-primary/20 flex items-center justify-center transition-all",
                                              selectedEvents.includes(e.id) ? "bg-primary border-primary" : "bg-transparent"
                                            )}>
                                              {selectedEvents.includes(e.id) && <CheckIcon className="size-3 text-white" />}
                                            </div>
                                            <span className="text-[11px] font-bold tracking-tight">{e.emoji} {e.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Nível de Raridade</Label>
                            <ScrollArea className="h-[120px] sm:h-[220px] border border-primary/5 rounded-xl sm:rounded-2xl p-2 bg-background/40">
                                <div className="space-y-1">
                                    {availableRarities.map(r => (
                                        <div 
                                          key={r.id} 
                                          className={cn(
                                            "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer group hover:bg-primary/10",
                                            selectedRarities.includes(r.id) ? "bg-primary/5 text-primary" : "text-muted-foreground"
                                          )}
                                          onClick={(ev) => {
                                            ev.preventDefault();
                                            toggleRarity(r.id);
                                          }}
                                        >
                                            <div className={cn(
                                              "size-4 rounded-md border-2 border-primary/20 flex items-center justify-center transition-all",
                                              selectedRarities.includes(r.id) ? "bg-primary border-primary" : "bg-transparent"
                                            )}>
                                              {selectedRarities.includes(r.id) && <CheckIcon className="size-3 text-white" />}
                                            </div>
                                            <span className="text-[11px] font-bold tracking-tight">{r.emoji} {r.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
              </div>
           </ScrollArea>

          <DialogFooter className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-primary/5 flex flex-col-reverse sm:flex-row gap-3">
             <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs opacity-60 hover:opacity-100 transition-all">
                  <XIcon className="mr-2 size-4" /> Cancelar
                </Button>
              </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs italic">
              {isSubmitting ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <SaveIcon className="size-5" /> Atualizar Protocolo
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
