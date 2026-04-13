"use client";

import * as React from "react";
import { getEvents, getRarities } from "@/app/admin/actions";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2Icon,
  LinkIcon,
  UploadIcon,
  ImageIcon,
  XIcon,
  CheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/telegram/create_slug";
import { resolveMediaUrl } from "@/lib/uteis/resolveMediaUrl ";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

interface CharacterFormProps {
  character?: any;
  currentType: "waifu" | "husbando";
  onSubmit: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
  onComplete: () => void;
  onCancel: () => void;
}

const MEDIA_TYPE_OPTIONS = [
  { value: "IMAGE_URL", label: "Imagem URL" },
  { value: "VIDEO_URL", label: "Vídeo URL" },
  { value: "IMAGE_FILEID", label: "Imagem Telegram" },
  { value: "VIDEO_FILEID", label: "Vídeo Telegram" },
  { value: "IMAGE_LOCAL", label: "Imagem Upload" },
  { value: "VIDEO_LOCAL", label: "Vídeo Upload" },
] as const;

type MediaTypeValue =
  | "IMAGE_URL"
  | "VIDEO_URL"
  | "IMAGE_FILEID"
  | "VIDEO_FILEID"
  | "IMAGE_LOCAL"
  | "VIDEO_LOCAL";

function getMediaEntryFromType(
  mediaType: string | undefined,
): "url" | "upload" {
  if (!mediaType) return "upload";
  if (mediaType.includes("URL")) return "url";
  return "upload";
}

export function CharacterForm({
  character,
  currentType,
  onSubmit,
  onComplete,
  onCancel,
}: CharacterFormProps) {
  const isEditing = !!character;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mediaType, setMediaType] = React.useState<MediaTypeValue>(
    (character?.mediaType as MediaTypeValue) || "IMAGE_URL",
  );
  const [mediaEntry, setMediaEntry] = React.useState<"url" | "upload">(
    isEditing ? getMediaEntryFromType(character?.mediaType) : "upload",
  );
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isVideoPreview, setIsVideoPreview] = React.useState(false);
  const [currentMediaId, setCurrentMediaId] = React.useState<string | null>(
    null,
  );
  const [isResolving, setIsResolving] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [availableEvents, setAvailableEvents] = React.useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = React.useState<any[]>([]);
  const [availableRarities, setAvailableRarities] = React.useState<any[]>([]);
  const [filteredRarities, setFilteredRarities] = React.useState<any[]>([]);
  const [selectedEvents, setSelectedEvents] = React.useState<number[]>([]);
  const [selectedRarities, setSelectedRarities] = React.useState<number[]>([]);
  const [eventSearch, setEventSearch] = React.useState("");
  const [raritySearch, setRaritySearch] = React.useState("");

  const handleMediaTypeChange = async (newMediaType: MediaTypeValue) => {
    setMediaType(newMediaType);
    setMediaEntry(getMediaEntryFromType(newMediaType));

    if (
      isEditing &&
      character?.media &&
      (newMediaType === "IMAGE_FILEID" || newMediaType === "VIDEO_FILEID")
    ) {
      setIsResolving(true);
      try {
        const result = await resolveMediaUrl(character as any, currentType);
        if (result && result.displayUrl) {
          setPreviewUrl(result.displayUrl);
          setIsVideoPreview(result.isVideo);
        }
      } finally {
        setIsResolving(false);
      }
    }
  };

  const filterEvents = React.useCallback(
    (query: string) => {
      setEventSearch(query);
      const q = query.toLowerCase();
      if (!q) {
        setFilteredEvents(availableEvents);
      } else {
        setFilteredEvents(
          availableEvents.filter(
            (e) =>
              e.name?.toLowerCase().includes(q) ||
              e.code?.toLowerCase().includes(q) ||
              e.emoji?.includes(query),
          ),
        );
      }
    },
    [availableEvents],
  );

  const filterRarities = React.useCallback(
    (query: string) => {
      setRaritySearch(query);
      const q = query.toLowerCase();
      if (!q) {
        setFilteredRarities(availableRarities);
      } else {
        setFilteredRarities(
          availableRarities.filter(
            (r) =>
              r.name?.toLowerCase().includes(q) ||
              r.code?.toLowerCase().includes(q) ||
              r.emoji?.includes(query),
          ),
        );
      }
    },
    [availableRarities],
  );

  React.useEffect(() => {
    getEvents().then((data) => {
      setAvailableEvents(data);
      setFilteredEvents(data);
    });
    getRarities().then((data) => {
      setAvailableRarities(data);
      setFilteredRarities(data);
    });

    if (character) {
      const currentEvents =
        character[
          currentType === "waifu" ? "WaifuEvent" : "HusbandoEvent"
        ]?.map((e: any) => e.eventId) || [];
      const currentRarities =
        character[
          currentType === "waifu" ? "WaifuRarity" : "HusbandoRarity"
        ]?.map((r: any) => r.rarityId) || [];

      setSelectedEvents(currentEvents);
      setSelectedRarities(currentRarities);
      setMediaType((character.mediaType as MediaTypeValue) || "IMAGE_URL");
      setMediaEntry(getMediaEntryFromType(character.mediaType));
      setCurrentMediaId(character.media || null);

      if (
        character.media?.startsWith("http") ||
        character.media?.startsWith("/")
      ) {
        setPreviewUrl(character.media);
        setIsVideoPreview(character.mediaType?.includes("VIDEO") || false);
      } else if (character.media) {
        resolveMediaUrl(character as any, currentType).then((result) => {
          if (result && result.displayUrl) {
            setPreviewUrl(result.displayUrl);
            setIsVideoPreview(result.isVideo);
          }
        });
      }
    } else {
      setSelectedEvents([]);
      setSelectedRarities([]);
      setPreviewUrl(null);
      setIsVideoPreview(false);
      setMediaType("IMAGE_URL");
      setMediaEntry("upload");
      setCurrentMediaId(null);
    }
  }, [character, currentType]);

  const toggleEvent = (id: number) => {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const toggleRarity = (id: number) => {
    setSelectedRarities((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
    setIsVideoPreview(/\.(mp4|webm|mov|avi|mkv)$/i.test(url));
  };

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("O arquivo deve ter no máximo 20MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    const isVideo =
      file.type.includes("video") ||
      /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name);
    setIsVideoPreview(isVideo);
  };

  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            setMediaEntry("upload");
            processFile(file);
            if (fileInputRef.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInputRef.current.files = dt.files;
            }
          }
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      formData.append("eventIds", JSON.stringify(selectedEvents));
      formData.append("rarityIds", JSON.stringify(selectedRarities));
      formData.append("mediaType", mediaType);

      const res = await onSubmit(formData);

      if (res.success) {
        toast.success(
          isEditing ? "Personagem atualizado!" : "Personagem criado!",
        );
        onComplete();
      } else {
        toast.error(res.error || "Erro na solicitação");
      }
    } catch {
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmitForm}
      className="flex flex-col flex-1 min-h-0 overflow-hidden gap-6"
    >
      <ScrollArea className="flex-1 min-h-0 pr-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
          {/* LADO ESQUERDO: PREVIEW */}
          <div className="flex flex-col min-h-0 space-y-4 border p-3 rounded-2xl bg-muted/20">
            <Label className="text-xs font-bold text-center">Preview</Label>
            <div className="relative w-full h-full min-h-60 rounded-xl flex items-center justify-center overflow-hidden bg-muted sm:max-h-42  ">
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
              <Button
                type="button"
                variant={mediaEntry === "url" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setMediaEntry("url")}
              >
                Link
              </Button>
              <Button
                type="button"
                variant={mediaEntry === "upload" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setMediaEntry("upload")}
              >
                Upload
              </Button>
            </div>
          </div>

          {/* LADO DIREITO: DADOS E RELAÇÕES */}
          <div className="flex flex-col min-h-0 space-y-6">
            <div className="space-y-3">
              <Input
                name="name"
                placeholder="Nome"
                defaultValue={character?.name}
                required
              />
              <Input
                name="origem"
                placeholder="Origem"
                defaultValue={character?.origem}
                required
              />

              {isEditing && (
                <Select
                  value={mediaType}
                  onValueChange={(v) =>
                    handleMediaTypeChange(v as MediaTypeValue)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Mídia" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {isEditing &&
                currentMediaId &&
                (mediaType === "IMAGE_FILEID" ||
                  mediaType === "VIDEO_FILEID") && (
                  <div className="p-2 bg-muted rounded-lg space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Mídia Atual (Telegram)
                    </Label>
                    <p className="text-xs font-mono break-all">
                      {currentMediaId}
                    </p>
                    {isResolving ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2Icon className="size-3 animate-spin" />{" "}
                        Carregando preview...
                      </div>
                    ) : previewUrl ? (
                      <p className="text-xs text-green-600">
                        Preview disponível
                      </p>
                    ) : (
                      <p className="text-xs text-orange-600">
                        Preview não disponível
                      </p>
                    )}
                  </div>
                )}

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
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    capture="environment"
                    className="pl-9"
                    onChange={handleFileChange}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    Ctrl+V para colar
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isEditing && (
                <Select
                  name="type"
                  key={currentType}
                  defaultValue={currentType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waifu">Waifu</SelectItem>
                    <SelectItem value="husbando">Husbando</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select
                name="sourceType"
                defaultValue={character?.sourceType || "ANIME"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANIME">Anime</SelectItem>
                  <SelectItem value="GAME">Jogo</SelectItem>
                  <SelectItem value="MANGA">Mangá</SelectItem>
                  <SelectItem value="MOVIE">Filme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Eventos</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedEvents.length} selecionado(s)
                </span>
              </div>
              <Input
                placeholder="Pesquisar eventos..."
                value={eventSearch}
                onChange={(e) => filterEvents(e.target.value)}
                className="mb-2 h-8 text-xs"
              />
              <div className="h-40 overflow-auto border rounded-lg p-2 space-y-1 py-2">
                {filteredEvents.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Nenhum evento encontrado
                  </p>
                ) : (
                  filteredEvents.map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev) => {
                        ev.preventDefault();
                        toggleEvent(e.id);
                      }}
                      className={cn(
                        "p-2 rounded cursor-pointer text-sm flex items-center justify-between",
                        selectedEvents.includes(e.id)
                          ? "bg-background/60"
                          : "hover:bg-muted",
                      )}
                    >
                      <span>
                        {e.emoji} {e.name}
                      </span>
                      {selectedEvents.includes(e.id) && (
                        <CheckIcon className="size-4" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Raridades</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedRarities.length} selecionado(s)
                </span>
              </div>
              <Input
                placeholder="Pesquisar raridades..."
                value={raritySearch}
                onChange={(e) => filterRarities(e.target.value)}
                className="mb-2 h-8 text-xs"
              />
              <div className="h-40 overflow-auto border rounded-lg p-2 space-y-1">
                {filteredRarities.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Nenhuma raridade encontrada
                  </p>
                ) : (
                  filteredRarities.map((r) => (
                    <div
                      key={r.id}
                      onClick={(ev) => {
                        ev.preventDefault();
                        toggleRarity(r.id);
                      }}
                      className={cn(
                        "p-2 rounded cursor-pointer text-sm flex items-center justify-between",
                        selectedRarities.includes(r.id)
                          ? " bg-background/60"
                          : "hover:bg-muted",
                      )}
                    >
                      <span>
                        {r.emoji} {r.name}
                      </span>
                      {selectedRarities.includes(r.id) && (
                        <CheckIcon className="size-4" />
                      )}
                    </div>
                  ))
                )}
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
  );
}
