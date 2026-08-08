import { Suspense } from "react";
import RarityGrid, { RarityGridSkeleton, type Rarity } from "@/components/rarity-grid";

async function RarityGridLoader() {
  const { getRarities } = await import("@/actions/drop");
  const rarities = (await getRarities()) as Rarity[];
  return <RarityGrid rarities={rarities} />;
}

export default function DropPage() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">Bot Setup</p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Raridades — Pesos e %</h1>
        </div>
      </header>

      <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
        <h2 className="text-sm font-semibold">Como funciona</h2>
        <ul className="text-muted-foreground mt-2 space-y-1.5 text-xs">
          <li>
            Cada raridade tem um <span className="text-foreground font-medium">peso</span>. O peso é a
            &quot;quantidade de bilhetes&quot; dela no sorteio: quanto maior, maior a chance de cair.
          </li>
          <li>
            A <span className="text-foreground font-medium">chance (%)</span> de cada raridade é{" "}
            <code className="rounded bg-muted px-1 font-mono">peso ÷ peso total × 100</code> e é
            recalculada sozinha quando você altera qualquer peso.
          </li>
          <li>
            Arraste o <span className="text-foreground font-medium">controle deslizante</span> ou use as{" "}
            setas do campo numérico para mudar o peso, e confirme com{" "}
            <span className="text-emerald-400">Salvar</span>.
          </li>
        </ul>
      </div>

      <Suspense fallback={<RarityGridSkeleton />}>
        <RarityGridLoader />
      </Suspense>
    </div>
  );
}
