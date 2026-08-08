"use client";

import { startTransition, useState } from "react";
import { toast } from "sonner";
import { saveConfig } from "@/actions/config";

type ConfigItem = { key: string; label: string; value: string };

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "";
  const s = Math.round(ms / 1000);
  if (s < 1) return `${ms}ms`;
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const restMin = m % 60;
  return restMin > 0 ? `${h}h ${restMin}min` : `${h}h`;
}

export function ConfigForm({ configs }: { configs: ConfigItem[] }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(configs.map((c) => [c.key, c.value])),
  );
  const [originals, setOriginals] = useState<Record<string, string>>(() =>
    Object.fromEntries(configs.map((c) => [c.key, c.value])),
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function handleChange(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(key: string) {
    const value = values[key] ?? "";
    setSavingKey(key);
    startTransition(async () => {
      try {
        const res = await saveConfig([{ key, value }]);
        if (res.success) {
          setOriginals((o) => ({ ...o, [key]: value }));
          toast.success("Configuração salva!");
        } else {
          toast.error(res.error ?? "Erro ao salvar configuração.");
        }
      } catch (e) {
        toast.error(String(e));
      } finally {
        setSavingKey(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      {configs.map((cfg) => {
        const value = values[cfg.key] ?? cfg.value;
        const changed = value !== originals[cfg.key];
        const duration = cfg.key.endsWith("_MS")
          ? formatDuration(Number(value))
          : "";
        const saving = savingKey === cfg.key;
        return (
          <div
            key={cfg.key}
            className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{cfg.label}</p>
                <p className="text-muted-foreground font-mono text-[11px]">{cfg.key}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  name={cfg.key}
                  type="number"
                  value={value}
                  onChange={(e) => handleChange(cfg.key, e.target.value)}
                  className="w-full sm:w-40 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md focus:border-ring focus:outline-hidden"
                />
                {duration && (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    ({duration})
                  </span>
                )}
                {changed && (
                  <button
                    type="button"
                    onClick={() => handleSubmit(cfg.key)}
                    disabled={saving}
                    className="rounded-lg border border-border/70 bg-card/60 px-4 py-2 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent disabled:opacity-60 transition-colors"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
