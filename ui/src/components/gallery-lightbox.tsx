"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PencilIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, LoaderIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { deleteCharacter } from "@/actions/characters";
import { CharacterEditDialog } from "./character-edit-dialog";

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
  canManageCharacters?: boolean;
  onItemDeleted?: (type: "waifu" | "husbando", id: number) => void;
}

export function GalleryLightbox({ items, initialIndex, open, onClose, canManageCharacters, onItemDeleted }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const item = items[index];

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    const result = await deleteCharacter(item._type, item.id);
    setDeleting(false);
    if (result.success) {
      toast.success(result.message);
      setConfirmDelete(false);
      onItemDeleted?.(item._type, item.id);
    } else {
      toast.error(result.message);
    }
  }

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
            {canManageCharacters && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setEditOpen(true)}
                >
                  <PencilIcon className="mr-1 size-3" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-400/40 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2Icon className="mr-1 size-3" />
                  Excluir
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Excluir {item._type === "waifu" ? "Waifu" : "Husbando"} #{item.id}?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Tem certeza que deseja excluir{" "}
            <span className="font-semibold text-foreground">{item.name}</span>?
            Essa ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <LoaderIcon className="mr-1 size-3 animate-spin" />
              ) : (
                <Trash2Icon className="mr-1 size-3" />
              )}
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CharacterEditDialog
        type={item._type}
        id={item.id}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
