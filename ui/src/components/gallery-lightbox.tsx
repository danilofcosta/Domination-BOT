"use client";

import { useState, useEffect, useCallback, useRef, useMemo, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, LinkIcon, UploadIcon, CheckCircleIcon, XCircleIcon, LoaderIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { updateCharacter } from "@/actions/characters";
import { validateMediaUrl } from "@/actions/validateMedia";

type GalleryItem = {
  id: number;
  _type: "waifu" | "husbando";
  name: string;
  resolvedUrl: string;
  isVideo: boolean;
  createdAt: Date;
};

interface GalleryLightboxProps {
  items: GalleryItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

const SOURCE_TYPES = ["ANIME", "GAME", "MANGA", "MOVIE"] as const;

type EditData = {
  character: {
    id: number;
    name: string;
    origem: string;
    slug: string;
    mediaType: string;
    media: string;
    sourceType: string;
  };
  displayUrl: string | null;
  isVideo: boolean;
  currentRarityIds: number[];
  currentEventIds: number[];
  allRarities: { id: number; code: string; name: string; emoji: string }[];
  allEvents: { id: number; code: string; name: string; emoji: string }[];
};

export function GalleryLightbox({ items, initialIndex, open, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [editForm, setEditForm] = useState({ name: "", origem: "", sourceType: "" });
  const [selectedRarities, setSelectedRarities] = useState<number[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [newMedia, setNewMedia] = useState<{ type: "url" | "file"; value: string; mimeType: string } | null>(null);
  const [showMediaChange, setShowMediaChange] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; mimeType?: string; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const item = items[index];

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : items.length - 1)), [items.length]);
  const next = useCallback(() => setIndex((i) => (i < items.length - 1 ? i + 1 : 0)), [items.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, prev, next]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("lightbox-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("lightbox-open");
    };
  }, [open]);

  async function openEdit() {
    if (!item) return;
    try {
      const res = await fetch(`/api/characters/${item._type}/${item.id}`);
      if (!res.ok) { toast.error("Erro ao carregar dados"); return; }
      const data: EditData = await res.json();
      setEditData(data);
      setEditForm({ name: data.character.name, origem: data.character.origem, sourceType: data.character.sourceType });
      setSelectedRarities(data.currentRarityIds);
      setSelectedEvents(data.currentEventIds);
      setNewMedia(null);
      setShowMediaChange(false);
      setMediaUrl("");
      setValidationResult(null);
      setEditOpen(true);
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleRarity(id: number) {
    setSelectedRarities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleEvent(id: number) {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleValidateUrl() {
    if (!mediaUrl.trim()) return;
    setValidating(true);
    setValidationResult(null);
    const result = await validateMediaUrl(mediaUrl.trim());
    setValidationResult(result);
    if (result.valid) {
      setNewMedia({ type: "url", value: mediaUrl.trim(), mimeType: result.mimeType || "" });
    }
    setValidating(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      toast.error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máx 30MB)`);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    pendingFileRef.current = file;
    setNewMedia({ type: "file", value: "pending", mimeType: file.type });
    setValidationResult({ valid: true, mimeType: file.type, message: "Arquivo selecionado — salve para fazer upload" });
  }

  async function handleSave() {
    if (!editData) return;

    let resolvedNewMedia = newMedia;

    if (pendingFileRef.current) {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", pendingFileRef.current);
      formData.append("type", item!._type);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadResult = await res.json();
      if (!uploadResult.success) {
        toast.error(uploadResult.message);
        setSaving(false);
        return;
      }
      resolvedNewMedia = { type: "file", value: uploadResult.fileId, mimeType: pendingFileRef.current.type };
    }

    console.log("[lightbox:handleSave] newMedia:", resolvedNewMedia ? JSON.stringify({ type: resolvedNewMedia.type, mimeType: resolvedNewMedia.mimeType, valuePreview: resolvedNewMedia.value.slice(0, 40) }) : "null");
    setSaving(true);
    startTransition(async () => {
      const result = await updateCharacter(item!._type, item!.id, {
        name: editForm.name,
        origem: editForm.origem,
        media: editData.character.media,
        mediaType: editData.character.mediaType,
        sourceType: editForm.sourceType,
        rarityIds: selectedRarities,
        eventIds: selectedEvents,
        ...(resolvedNewMedia ? { newMedia: resolvedNewMedia } : {}),
      });
      console.log("[lightbox:handleSave] result:", JSON.stringify(result));
      if (result.success) {
        toast.success(result.message);
        setEditOpen(false);
        pendingFileRef.current = null;
        if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
      } else {
        toast.error(result.message);
      }
      setSaving(false);
    });
  }

  if (!open || !item) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        >
          <XIcon className="size-6" />
        </button>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeftIcon className="size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRightIcon className="size-6" />
            </button>
          </>
        )}

        <div className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-4">
          {item.isVideo ? (
            <video
              src={item.resolvedUrl}
              className="max-h-[75vh] max-w-[90vw] rounded-lg object-contain"
              controls
              autoPlay
            />
          ) : (
            <img
              src={item.resolvedUrl}
              alt={item.name}
              className="max-h-[75vh] max-w-[90vw] rounded-lg object-contain"
            />
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80">
              {item.name}
            </span>
            <span className="text-xs text-white/40">
              #{item.id} · {item._type}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              asChild
            >
              <a href={`/characters/${item._type}/${item.id}`}>
                <InfoIcon className="mr-1 size-3" />
                Info
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={openEdit}
            >
              <PencilIcon className="mr-1 size-3" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Editar {item._type === "waifu" ? "Waifu" : "Husbando"} #{item.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">
            {editData?.displayUrl && !newMedia && (
              <div className="overflow-hidden rounded-lg border border-border/50">
                {editData.isVideo ? (
                  <video src={editData.displayUrl} className="w-full max-h-48 object-contain" controls />
                ) : (
                  <img src={editData.displayUrl} alt={editForm.name} className="w-full max-h-48 object-contain" />
                )}
              </div>
            )}

            {newMedia && validationResult?.valid && (
              <div className="overflow-hidden rounded-lg border border-border/50">
                {newMedia.type === "url" ? (
                  newMedia.mimeType.startsWith("video/") ? (
                    <video src={newMedia.value} className="w-full max-h-48 object-contain" controls />
                  ) : (
                    <img src={newMedia.value} alt="Preview" className="w-full max-h-48 object-contain" />
                  )
                ) : filePreviewUrl ? (
                  newMedia.mimeType.startsWith("video/") ? (
                    <video src={filePreviewUrl} className="w-full max-h-48 object-contain" controls />
                  ) : (
                    <img src={filePreviewUrl} alt="Preview" className="w-full max-h-48 object-contain" />
                  )
                ) : (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    Arquivo enviado
                  </div>
                )}
              </div>
            )}

            {validationResult && (
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                validationResult.valid
                  ? "border-green-500/30 bg-green-500/10 text-green-600"
                  : "border-red-500/30 bg-red-500/10 text-red-600"
              }`}>
                {validationResult.valid ? <CheckCircleIcon className="size-4 shrink-0" /> : <XCircleIcon className="size-4 shrink-0" />}
                <span>{validationResult.message}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input id="edit-name" name="name" value={editForm.name} onChange={handleEditChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-origem">Origem</Label>
                <Input id="edit-origem" name="origem" value={editForm.origem} onChange={handleEditChange} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-sourceType">Tipo de Fonte</Label>
                <select
                  id="edit-sourceType"
                  name="sourceType"
                  value={editForm.sourceType}
                  onChange={handleEditChange}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {SOURCE_TYPES.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                {!showMediaChange ? (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setShowMediaChange(true)}>
                    <LinkIcon className="mr-1 size-3" />
                    Alterar Mídia
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => {
                    setShowMediaChange(false);
                    setNewMedia(null);
                    setValidationResult(null);
                    setMediaUrl("");
                    pendingFileRef.current = null;
                    if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
                  }}>
                    Cancelar Mídia
                  </Button>
                )}
              </div>
            </div>

            {showMediaChange && (
              <div className="space-y-3 rounded-lg border border-border/70 p-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Nova mídia
                </p>
                <div className="space-y-2">
                  <Label htmlFor="edit-media-url">URL da mídia</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-media-url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://..."
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleValidateUrl}
                      disabled={validating || !mediaUrl.trim()}
                    >
                      {validating ? <LoaderIcon className="size-3 animate-spin" /> : "Validar"}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-popover px-2 text-xs text-muted-foreground">ou</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Upload de arquivo</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <LoaderIcon className="mr-1 size-3 animate-spin" />
                    ) : (
                      <UploadIcon className="mr-1 size-3" />
                    )}
                    {uploading ? "Enviando..." : "Selecionar arquivo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Máx 30MB. Formatos: imagem ou vídeo.
                  </p>
                </div>
              </div>
            )}

            {editData && (
              <>
                <div className="space-y-2">
                  <Label>Raridades</Label>
                  <SearchFilter
                    placeholder="Buscar raridade..."
                    items={editData.allRarities}
                    selectedIds={selectedRarities}
                    onToggle={toggleRarity}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Eventos</Label>
                  <SearchFilter
                    placeholder="Buscar evento..."
                    items={editData.allEvents}
                    selectedIds={selectedEvents}
                    onToggle={toggleEvent}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-popover pb-1">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchFilter({
  placeholder,
  items,
  selectedIds,
  onToggle,
}: {
  placeholder: string;
  items: { id: number; code: string; name: string; emoji: string }[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(lower));
  }, [query, items]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-8 pl-8 text-xs"
        />
      </div>
      <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border/70 p-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
              selectedIds.includes(item.id)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 bg-border/20 text-muted-foreground hover:bg-border/30"
            }`}
          >
            {item.emoji} {item.name}
          </button>
        ))}
        {filtered.length === 0 && (
          <span className="text-muted-foreground text-xs">Nenhum resultado</span>
        )}
      </div>
    </div>
  );
}
