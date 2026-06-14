import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function saveConfig(formData: FormData) {
  "use server";
  const entries = Array.from(formData.entries()).filter(([k]) => k !== "type");
  try {
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.botConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value), label: key, type: "number" },
        }),
      ),
    );
    revalidatePath("/setup/config");
  } catch {
    throw new Error("Erro ao salvar configurações.");
  }
}

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function msLabel(value: string) {
  const ms = Number(value);
  if (!ms) return "";
  if (ms < 1000) return `(${ms}ms)`;
  if (ms < 60000) return `(${ms / 1000}s)`;
  return `(${ms / 60000}min)`;
}

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
  { key: "DROP", label: "Mensagens para drop", value: "100" },
  { key: "UNDROP", label: "Reset após drop", value: "140" },
];

export default async function ConfigPage({ searchParams }: SearchParams) {
  const dbConfigs = await prisma.botConfig.findMany();

  const configs = DEFAULTS.map((d) => {
    const db = dbConfigs.find((c) => c.key === d.key);
    return { ...d, value: db?.value ?? d.value };
  });

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Configuração
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Constantes do Bot</h1>
          </div>
          <Link
            href="/setup/grupos"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
      </header>

      <form action={saveConfig} className="space-y-3">
        {configs.map((cfg) => (
          <div
            key={cfg.key}
            className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{cfg.label}</p>
                <p className="text-muted-foreground font-mono text-[11px]">{cfg.key}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  name={cfg.key}
                  type="number"
                  defaultValue={cfg.value}
                  className="w-full sm:w-40 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md focus:border-ring focus:outline-hidden"
                />
                {cfg.key.endsWith("_MS") && (
                  <span className="text-muted-foreground shrink-0 text-xs">{msLabel(cfg.value)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="rounded-lg border border-border/70 bg-card/60 px-6 py-2 text-sm font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
        >
          Salvar todas
        </button>
      </form>
    </div>
  );
}
