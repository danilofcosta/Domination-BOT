"use client";

import { useState, useEffect, startTransition } from "react";
import { toast } from "sonner";

type Rarity = { id: number; code: string; name: string; emoji: string; weight: number; chance: string };

export default function DropPage() {
  const [rarities, setRarities] = useState<Rarity[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    load();
  }, []);

  function load() {
    startTransition(async () => {
      const { getRarities } = await import("@/actions/drop");
      setRarities(await getRarities());
    });
  }

  function startEdit(r: Rarity) {
    setEditingId(r.id);
    setEditValue(String(r.weight));
  }

  async function saveWeight() {
    if (editingId === null) return;
    const w = parseInt(editValue, 10);
    if (isNaN(w) || w < 0) {
      toast.error("Peso inválido");
      return;
    }
    const { updateRarityWeight } = await import("@/actions/drop");
    await updateRarityWeight(editingId, w);
    toast.success("Peso atualizado");
    setEditingId(null);
    load();
  }

  const totalWeight = rarities.reduce((s, r) => s + r.weight, 0);
  const maxWeight = Math.max(...rarities.map((r) => r.weight), 1);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">Bot Setup</p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Raridades — Pesos e %</h1>
          <p className="text-muted-foreground mt-1 text-xs">Peso total: {totalWeight}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rarities.map((rar) => {
          const barWidth = (rar.weight / maxWeight) * 100;
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

              <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-border/40">
                <div
                  className="h-full rounded-full bg-violet-500/60 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {editingId === rar.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveWeight()}
                    className="w-full rounded-lg border border-border/70 bg-card/80 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-border"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={saveWeight}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-border/70 bg-card/60 px-2.5 py-1.5 text-xs transition-colors hover:bg-card"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">peso {rar.weight}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(rar)}
                    className="rounded-md border border-border/40 bg-card/80 px-2 py-0.5 text-[10px] opacity-0 transition-all hover:bg-card group-hover:opacity-100"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
