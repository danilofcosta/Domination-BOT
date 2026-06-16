"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createCharacter } from "@/actions/characters";
import { validateMediaUrl } from "@/actions/validateMedia";
import { LoaderIcon, UploadIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";

interface RarityOrEvent {
  id: number;
  code: string;
  name: string;
  emoji: string;
}

interface CreateCharacterDialogProps {
  type: "waifu" | "husbando";
  allRarities: RarityOrEvent[];
  allEvents: RarityOrEvent[];
}

const SOURCE_TYPES = ["ANIME", "GAME", "MANGA", "MOVIE"] as const;

export function CreateCharacterDialog({ type, allRarities, allEvents }: CreateCharacterDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", origem: "", sourceType: "ANIME" });
  const [selectedRarities, setSelectedRarities] = useState<number[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);

  const [mediaUrl, setMediaUrl] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; mimeType?: string; message: string } | null>(null);

  const [mediaValue, setMediaValue] = useState<string>("");
  const [mediaMime, setMediaMime] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const pendingFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      setMediaValue(mediaUrl.trim());
      setMediaMime(result.mimeType || "image/jpeg");
      setPreviewUrl(mediaUrl.trim());
      pendingFileRef.current = null;
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

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setMediaMime(file.type);
    setMediaValue("pending");
    pendingFileRef.current = file;
    setValidationResult({ valid: true, mimeType: file.type, message: "Arquivo selecionado — salve para fazer upload" });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.origem.trim()) {
      toast.error("Nome e origem são obrigatórios");
      return;
    }
    if (!mediaValue) {
      toast.error("Adicione uma mídia (URL ou upload)");
      return;
    }
    if (selectedRarities.length === 0) {
      toast.error("Selecione pelo menos uma raridade");
      return;
    }

    setSaving(true);

    let resolvedMedia = mediaValue;
    let resolvedMime = mediaMime;

    if (pendingFileRef.current) {
      const fd = new FormData();
      fd.append("file", pendingFileRef.current);
      fd.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const result = await res.json();

      if (!result.success) {
        toast.error(result.message);
        setSaving(false);
        return;
      }

      resolvedMedia = result.fileId;
      resolvedMime = result.mimeType;
    }

    const mediaType = resolvedMime.startsWith("video/")
      ? resolvedMedia.startsWith("http") ? "VIDEO_URL" : "VIDEO_FILEID"
      : resolvedMedia.startsWith("http") ? "IMAGE_URL" : "IMAGE_FILEID";

    const result = await createCharacter(type, {
      name: form.name.trim(),
      origem: form.origem.trim(),
      sourceType: form.sourceType,
      media: resolvedMedia,
      mediaType,
      rarityIds: selectedRarities,
      eventIds: selectedEvents,
    });

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setSaving(false);
  }

  function resetForm() {
    setForm({ name: "", origem: "", sourceType: "ANIME" });
    setSelectedRarities([]);
    setSelectedEvents([]);
    setMediaUrl("");
    setMediaValue("");
    setMediaMime("");
    setPreviewUrl(null);
    setValidationResult(null);
    pendingFileRef.current = null;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm">
          + {type === "waifu" ? "Waifu" : "Husbando"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Criar {type === "waifu" ? "Waifu" : "Husbando"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">
          {previewUrl && (
            <div className="overflow-hidden rounded-lg border border-border/50">
              {mediaMime.startsWith("video/") ? (
                <video src={previewUrl} className="w-full max-h-48 object-contain" controls />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain" />
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
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Ex: Zero Two" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="origem">Origem *</Label>
              <Input id="origem" name="origem" value={form.origem} onChange={handleChange} placeholder="Ex: Darling in the Franxx" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceType">Tipo de Fonte</Label>
            <select
              id="sourceType"
              name="sourceType"
              value={form.sourceType}
              onChange={handleChange}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {SOURCE_TYPES.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 rounded-lg border border-border/70 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Mídia *
            </p>

            <div className="space-y-2">
              <Label htmlFor="media-url">URL da mídia</Label>
              <div className="flex gap-2">
                <Input
                  id="media-url"
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

          <div className="space-y-2">
            <Label>Raridades</Label>
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border/70 p-3">
              {allRarities.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRarity(r.id)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                    selectedRarities.includes(r.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-border/20 text-muted-foreground hover:bg-border/30"
                  }`}
                >
                  {r.emoji} {r.name}
                </button>
              ))}
              {allRarities.length === 0 && (
                <span className="text-muted-foreground text-xs">Nenhuma raridade disponível</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eventos</Label>
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border/70 p-3">
              {allEvents.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEvent(e.id)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                    selectedEvents.includes(e.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-border/20 text-muted-foreground hover:bg-border/30"
                  }`}
                >
                  {e.emoji} {e.name}
                </button>
              ))}
              {allEvents.length === 0 && (
                <span className="text-muted-foreground text-xs">Nenhum evento disponível</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-popover pb-1">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Criando..." : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
