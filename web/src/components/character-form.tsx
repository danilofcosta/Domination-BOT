"use client"

import * as React from "react"
import { getEvents, getRarities } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Loader2Icon, LinkIcon, UploadIcon,
  ImageIcon, XIcon, CheckIcon
} from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { resolveMediaUrl } from "@/lib/uteis/resolveMediaUrl "
import { DialogFooter, DialogClose } from "@/components/ui/dialog"

interface CharacterFormProps {
  character?: any
  currentType: "waifu" | "husbando"
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  onComplete: () => void
  onCancel: () => void
}

export function CharacterForm({ character, currentType, onSubmit, onComplete, onCancel }: CharacterFormProps) {
  const isEditing = !!character
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [mediaEntry, setMediaEntry] = React.useState<"url" | "upload">(isEditing && character.media?.startsWith("http") ? "url" : "upload")
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isVideoPreview, setIsVideoPreview] = React.useState(false)

  const [availableEvents, setAvailableEvents] = React.useState<any[]>([])
  const [availableRarities, setAvailableRarities] = React.useState<any[]>([])
  const [selectedEvents, setSelectedEvents] = React.useState<number[]>([])
  const [selectedRarities, setSelectedRarities] = React.useState<number[]>([])

  React.useEffect(() => {
    getEvents().then(setAvailableEvents)
    getRarities().then(setAvailableRarities)

    if (character) {
      const currentEvents = character[currentType === "waifu" ? "WaifuEvent" : "HusbandoEvent"]?.map((e: any) => e.eventId) || []
      const currentRarities = character[currentType === "waifu" ? "WaifuRarity" : "HusbandoRarity"]?.map((r: any) => r.rarityId) || []
      
      setSelectedEvents(currentEvents)
      setSelectedRarities(currentRarities)
      
      if (character.media?.startsWith("http") || character.media?.startsWith("/")) {
        setPreviewUrl(character.media)
        setIsVideoPreview(character.mediaType?.includes("VIDEO") || false)
      } else if (character.media) {
        // Resolve telegram fileid
        resolveMediaUrl(character as any, currentType).then(result => {
          if (result && result.displayUrl) {
             setPreviewUrl(result.displayUrl)
             setIsVideoPreview(result.isVideo)
          }
        })
      }
    } else {
      setSelectedEvents([])
      setSelectedRarities([])
      setPreviewUrl(null)
      setIsVideoPreview(false)
    }
  }, [character, currentType])

  const toggleEvent = (id: number) => {
    setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const toggleRarity = (id: number) => {
    setSelectedRarities(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewUrl(e.target.value)
    setIsVideoPreview(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      setIsVideoPreview(file.type.includes("video"))
    }
  }

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.append("eventIds", JSON.stringify(selectedEvents))
      formData.append("rarityIds", JSON.stringify(selectedRarities))
      
      const res = await onSubmit(formData)

      if (res.success) {
        toast.success(isEditing ? "Personagem atualizado!" : "Personagem criado!")
        onComplete()
      } else {
        toast.error(res.error || "Erro na solicitação")
      }
    } catch {
      toast.error("Ocorreu um erro inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden gap-6">
       <ScrollArea className="flex-1 min-h-0 pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
            
            {/* LADO ESQUERDO: PREVIEW */}
            <div className="flex flex-col min-h-0 space-y-4 border p-3 rounded-2xl bg-muted/20">
               <Label className="text-xs font-bold text-center">Preview</Label>
               <div className="relative w-full h-full min-h-[240px] rounded-xl flex items-center justify-center overflow-hidden bg-muted sm:max-h-42  ">
                  {previewUrl ? (
                     isVideoPreview ? (
                        <video 
                           src={previewUrl} 
                           controls
                           autoPlay
                           loop
                           muted
                           className="w-full h-full object-cover"
                        />
                     ) : (
                        <img 
                           src={previewUrl} 
                           alt="Preview" 
                           className="w-full h-full object-cover sm:object-contain"
                        />
                     )
                  ) : (
                     <ImageIcon className="opacity-20 size-12" />
                  )}
               </div>

               <div className="flex gap-2">
                  <Button type="button" variant={mediaEntry === "url" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setMediaEntry("url")}>Link</Button>
                  <Button type="button" variant={mediaEntry === "upload" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setMediaEntry("upload")}>Upload</Button>
               </div>
            </div>

            {/* LADO DIREITO: DADOS E RELAÇÕES */}
            <div className="flex flex-col min-h-0 space-y-6">
                <div className="space-y-3">
                    <Input name="name" placeholder="Nome" defaultValue={character?.name} required />
                    <Input name="origem" placeholder="Origem" defaultValue={character?.origem} required />

                    {mediaEntry === "url" ? (
                       <div className="relative">
                           <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                           <Input 
                               name="mediaUrl" 
                               defaultValue={isEditing ? character.media : ""}
                               placeholder="URL da imagem (HTTPS...)" 
                               className="pl-9"
                               onChange={handleUrlChange}
                           />
                       </div>
                     ) : (
                       <div className="relative">
                           <UploadIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                           <Input 
                               type="file" 
                               name="file" 
                               accept="image/*,video/*" 
                               className="pl-9"
                               onChange={handleFileChange}
                           />
                       </div>
                     )}
                </div>
                
                <div className="flex gap-2">
                  {!isEditing && (
                    <Select name="type" key={currentType} defaultValue={currentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waifu">Waifu</SelectItem>
                        <SelectItem value="husbando">Husbando</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Select name="sourceType" defaultValue={character?.sourceType || "ANIME"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANIME">Anime</SelectItem>
                      <SelectItem value="GAME">Jogo</SelectItem>
                      <SelectItem value="MANGA">Mangá</SelectItem>
                      <SelectItem value="MOVIE">Filme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                    <Label>Eventos</Label>
                    <div className="h-[160px] overflow-auto border rounded-lg p-2 space-y-1 py-2">
                        {availableEvents.map(e => (
                            <div 
                              key={e.id} 
                              onClick={(ev) => {
                                ev.preventDefault();
                                toggleEvent(e.id);
                              }}
                              className={cn(
                                "p-2 rounded cursor-pointer text-sm flex items-center justify-between",
                                selectedEvents.includes(e.id) ? "bg-background/60" : "hover:bg-muted"
                              )}
                            >
                                <span>{e.emoji} {e.name}</span>
                                {selectedEvents.includes(e.id) && <CheckIcon className="size-4" />}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div>
                    <Label className="text-sm py-3"  >Raridades</Label>
                    <div className="h-[160px] overflow-auto border rounded-lg p-2 space-y-1">
                        {availableRarities.map(r => (
                            <div 
                              key={r.id} 
                              onClick={(ev) => {
                                ev.preventDefault();
                                toggleRarity(r.id);
                              }}
                              className={cn(
                                "p-2 rounded cursor-pointer text-sm flex items-center justify-between",
                                selectedRarities.includes(r.id) ? " bg-background/60" : "hover:bg-muted"
                              )}
                            >
                                <span>{r.emoji} {r.name}</span>
                                {selectedRarities.includes(r.id) && <CheckIcon className="size-4" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
       </ScrollArea>

      <DialogFooter className="pt-4 border-t flex gap-2">
         <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel}>
              <XIcon className="mr-2 size-4" /> Cancelar
            </Button>
          </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckIcon className="mr-2 size-4" />
          )}
          Salvar
        </Button>
      </DialogFooter>
    </form>
  )
}
