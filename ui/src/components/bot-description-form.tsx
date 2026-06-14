"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

type State = { success: boolean; message: string } | null;

export function BotDescriptionForm({
  type,
  description,
  shortDescription,
  updateAction,
}: {
  type: string;
  description: string;
  shortDescription: string;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const wrapped = async (_prev: State, formData: FormData): Promise<State> => {
    try {
      await updateAction(formData);
      return { success: true, message: "Descrição atualizada!" };
    } catch (e) {
      return { success: false, message: String(e) };
    }
  };

  const [state, formAction, pending] = useActionState(wrapped, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="type" value={type} />
      <div>
        <label htmlFor="description" className="text-muted-foreground block text-[10px] font-semibold tracking-[0.14em] uppercase mb-1">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={description}
          rows={2}
          className="w-full rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-xs backdrop-blur-md placeholder:text-muted-foreground/50 focus:border-ring focus:outline-hidden resize-none"
        />
      </div>
      <div>
        <label htmlFor="shortDescription" className="text-muted-foreground block text-[10px] font-semibold tracking-[0.14em] uppercase mb-1">
          Descrição curta
        </label>
        <input
          id="shortDescription"
          name="shortDescription"
          defaultValue={shortDescription}
          className="w-full rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-xs backdrop-blur-md placeholder:text-muted-foreground/50 focus:border-ring focus:outline-hidden"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
