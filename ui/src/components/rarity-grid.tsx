"use client";

import { useState, startTransition } from "react";
import { toast } from "sonner";
import {
  Slider,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
} from "@/components/ui/slider";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
} from "@/components/ui/number-field";

export type Rarity = {
  id: number;
  code: string;
  name: string;
  emoji: string;
  weight: number;
  chance: string;
};

export default function RarityGrid({ rarities }: { rarities: Rarity[] }) {
  const [drafts, setDrafts] = useState<Record<number, number>>(
    () => Object.fromEntries(rarities.map((r) => [r.id, r.weight])),
  );
  const [savingId, setSavingId] = useState<number | null>(null);

  async function reload() {
    const { getRarities } = await import("@/actions/drop");
    const data = await getRarities();
    setDrafts(Object.fromEntries(data.map((r) => [r.id, r.weight])));
  }

  async function saveWeight(id: number) {
    const w = drafts[id];
    if (w === undefined || isNaN(w) || w < 0) {
      toast.error("Peso inválido");
      return;
    }
    setSavingId(id);
    try {
      const { updateRarityWeight } = await import("@/actions/drop");
      await updateRarityWeight(id, w);
      toast.success("Peso atualizado");
      startTransition(async () => {
        await reload();
      });
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSavingId(null);
    }
  }

  const totalWeight = rarities.reduce((s, r) => s + r.weight, 0);
  const maxWeight = Math.max(...rarities.map((r) => r.weight), 1);
  const sliderMax = Math.max(maxWeight * 2, 20);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rarities.map((rar) => {
        const value = drafts[rar.id] ?? rar.weight;
        const changed = value !== rar.weight;
        const saving = savingId === rar.id;
        return (
          <div
            key={rar.id}
            className="group rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md transition-all hover:border-violet-500/40"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{rar.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">{rar.name}</p>
                <p className="text-muted-foreground text-xs">{rar.code}</p>
              </div>
              <span className="shrink-0 text-lg font-bold text-violet-400">{rar.chance}%</span>
            </div>

            <Slider value={value} onValueChange={(v) => setDrafts((d) => ({ ...d, [rar.id]: v }))} min={0} max={sliderMax} step={1}>
              <SliderControl>
                <SliderTrack>
                  <SliderIndicator />
                  <SliderThumb />
                </SliderTrack>
              </SliderControl>
            </Slider>

            <div className="mt-3 flex items-center gap-2">
              <NumberField value={value} onValueChange={(v) => setDrafts((d) => ({ ...d, [rar.id]: v ?? 0 }))} min={0} max={sliderMax} step={1}>
                <NumberFieldGroup className="flex-1">
                  <NumberFieldDecrement />
                  <NumberFieldInput />
                  <NumberFieldIncrement />
                </NumberFieldGroup>
              </NumberField>
              {changed && (
                <button
                  type="button"
                  onClick={() => saveWeight(rar.id)}
                  disabled={saving}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RarityGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-border/70 bg-card/60 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="size-9 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
            <div className="h-4 w-8 rounded bg-muted" />
          </div>
          <div className="h-2.5 rounded-full bg-muted" />
          <div className="mt-3 flex gap-2">
            <div className="h-9 flex-1 rounded-lg bg-muted" />
            <div className="h-7 w-16 rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
