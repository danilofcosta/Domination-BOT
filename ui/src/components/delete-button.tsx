"use client";

import { useActionState, useEffect } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ActionResult = { success: boolean; message: string };

type DeleteButtonProps = {
  id: number;
  label: string;
  action: (id: number) => Promise<ActionResult>;
};

export function DeleteButton({ id, label, action }: DeleteButtonProps) {
  const wrappedAction = async (_prev: unknown, formData: FormData): Promise<ActionResult | null> => {
    const id = Number(formData.get("id"));
    return await action(id);
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
          className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors"
          title="Deletar"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-80 sm:w-96">
        <DialogHeader>
          <DialogTitle>Deletar {label}</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar {label}? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              className="flex-1"
            >
              {pending ? "Deletando..." : "Deletar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
