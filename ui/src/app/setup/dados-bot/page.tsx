import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ConfigForm } from "@/components/config-form";

const FALLBACKS = {
  DROP: 100,
  UNDROP_OFFSET: 40,
  DAILY_LIMIT: 50,
};

const DEFAULTS: { key: string; label: string; value: string }[] = [
  { key: "GROUP_CLEANUP_INTERVAL_MS", label: "Intervalo de limpeza", value: "300000" },
  { key: "CAPTURE_LOCK_TIMEOUT_MS", label: "Timeout de captura", value: "10000" },
  { key: "DELETE_TIMEOUT_MS", label: "Timeout de exclusão", value: "60000" },
  { key: "UPLOAD_TIMEOUT_MS", label: "Timeout upload", value: "10000" },
  { key: "INLINE_QUERY_TIMEOUT_MS", label: "Timeout inline query", value: "2500" },
  { key: "DELETE_AFTER_DROP_MS", label: "Excluir após drop", value: "120000" },
  { key: "DAILY_LIMIT", label: "Limite diário de capturas", value: "50" },
  { key: "TIMEFAME", label: "Janela rate limit", value: "1000" },
  { key: "LIMIT", label: "Limite de msgs/s", value: "15" },
  { key: "BLOCK_DURATION_MS", label: "Duração do bloqueio", value: "900000" },
  { key: "DROP_MSG", label: "Mensagens para drop", value: "100" },
  { key: "UNDROP_MSG", label: "Reset após drop", value: "140" },
];

export default async function DadosBotPage() {
  const dbConfigs = await prisma.botConfig.findMany();

  const get = (key: string, fallback: number): number => {
    const row = dbConfigs.find((c) => c.key === key);
    return row ? Number(row.value) : fallback;
  };

  const dropMsg = get("DROP_MSG", FALLBACKS.DROP);
  const undropMsg = get("UNDROP_MSG", dropMsg + FALLBACKS.UNDROP_OFFSET);

  const configs = DEFAULTS.map((d) => {
    if (d.key === "DROP_MSG") return { ...d, value: String(dropMsg) };
    if (d.key === "UNDROP_MSG") return { ...d, value: String(undropMsg) };
    const db = dbConfigs.find((c) => c.key === d.key);
    return { ...d, value: db?.value ?? d.value };
  });

  const dropConfig = {
    dropMsg,
    undropMsg,
    dailyLimit: get("DAILY_LIMIT", FALLBACKS.DAILY_LIMIT),
  };

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Configuração do Bot
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dados do Bot</h1>
          </div>
          <Link
            href="/setup"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-md">
          <h2 className="text-sm font-semibold">Sistema de drop</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Valores efetivos lidos pelo bot (banco ou fallback).
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Mensagens para drop" value={dropConfig.dropMsg} />
            <Row label="Reset após drop" value={dropConfig.undropMsg} />
            <Row label="Limite diário de capturas" value={dropConfig.dailyLimit} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-[0.14em] uppercase">
          Constantes do Bot
        </h2>
        <ConfigForm configs={configs} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-border/30 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
