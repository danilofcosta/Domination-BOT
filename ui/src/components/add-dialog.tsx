"use client";

import { useActionState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

type ActionResult = { success: boolean; message: string };

type AddDialogProps = {
  title: string;
  fields: { name: string; label: string; placeholder?: string; type?: string }[];
  action: (formData: FormData) => Promise<ActionResult>;
};

export function AddDialog({ title, fields, action }: AddDialogProps) {
  const wrappedAction = async (_prev: unknown, formData: FormData): Promise<ActionResult | null> => {
    return await action(formData);
  };
  const [state, formAction, pending] = useActionState(wrappedAction, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm shadow-xs backdrop-blur-md transition-colors hover:bg-card"
        >
          <PlusIcon className="h-4 w-4" />
          Adicionar
        </button>
      </DialogTrigger>
      <DialogContent className="w-80 sm:w-96">
        <DialogHeader>
          <DialogTitle>Adicionar {title}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label
                htmlFor={f.name}
                className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase"
              >
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type || "text"}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
              />
            </div>
          ))}
          <div className="mt-2 flex gap-2">
            <DialogClose asChild>
              <button
                type="button"
                className="flex-1 rounded-lg border border-border/70 bg-card/60 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-card"
              >
                Cancelar
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg border border-border/70 bg-card/80 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-card disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
