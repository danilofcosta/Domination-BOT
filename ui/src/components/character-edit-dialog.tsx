"use client";

import { useState, useEffect, useRef, useMemo, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkIcon, UploadIcon, CheckCircleIcon, XCircleIcon, LoaderIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { updateCharacter } from "@/actions/characters";
import { validateMediaUrl } from "@/actions/validateMedia";

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

const SOURCE_TYPES = ["ANIME", "GAME", "MANGA", "MOVIE"] as const;

interface CharacterEditDialogProps {
  type: "waifu" | "husbando";
  id: number;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: () => void;
}

export function CharacterEditDialog({
  type,
  id,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: CharacterEditDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setEditData(null);
    setNewMedia(null);
    setShowMediaChange(false);
    setMediaUrl("");
    setValidationResult(null);
    pendingFileRef.current = null;
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }

    (async () => {
      try {
        const res = await fetch(`/api/characters/${type}/${id}`);
        if (!res.ok) throw new Error();
        const data: EditData = await res.json();
        if (cancelled) return;
        setEditData(data);
        setEditForm({
          name: data.character.name,
          origem: data.character.origem,
          sourceType: data.character.sourceType,
        });
        setSelectedRarities(data.currentRarityIds);
        setSelectedEvents(data.currentEventIds);
      } catch {
        if (!cancelled) {
          toast.error("Erro ao carregar dados");
          setOpen(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleRarity(rarityId: number) {
    setSelectedRarities((prev) =>
      prev.includes(rarityId) ? prev.filter((x) => x !== rarityId) : [...prev, rarityId],
    );
  }

  function toggleEvent(eventId: number) {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((x) => x !== eventId) : [...prev, eventId],
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
      formData.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadResult = await res.json();
      if (!uploadResult.success) {
        toast.error(uploadResult.message);
        setSaving(false);
        return;
      }
      resolvedNewMedia = { type: "file", value: uploadResult.fileId, mimeType: pendingFileRef.current.type };
    }

    setSaving(true);
    startTransition(async () => {
      const result = await updateCharacter(type, id, {
        name: editForm.name,
        origem: editForm.origem,
        media: editData.character.media,
        mediaType: editData.character.mediaType,
        sourceType: editForm.sourceType,
        rarityIds: selectedRarities,
        eventIds: selectedEvents,
        ...(resolvedNewMedia ? { newMedia: resolvedNewMedia } : {}),
      });
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        pendingFileRef.current = null;
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl);
          setFilePreviewUrl(null);
        }
        onSaved?.();
      } else {
        toast.error(result.message);
      }
      setSaving(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Editar {type === "waifu" ? "Waifu" : "Husbando"} #{id}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
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
