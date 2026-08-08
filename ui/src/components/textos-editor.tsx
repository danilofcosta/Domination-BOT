"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { saveTextos, type TextoEntry } from "@/actions/textos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Grupo = { type: string; items: TextoEntry[] };

type Props = {
  groups: Grupo[];
};

function resolvePlaceholders(
  value: string,
  byKey: Map<string, string>,
  seen = new Set<string>(),
): string {
  return value.replace(/\$\{(\w+)\}/g, (match, ref: string) => {
    if (seen.has(ref)) return match;
    const resolved = byKey.get(ref);
    if (resolved === undefined) return match;
    return resolvePlaceholders(resolved, byKey, new Set(seen).add(ref));
  });
}

function referencedKeys(value: string): string[] {
  return [...value.matchAll(/\$\{(\w+)\}/g)].map((m) => m[1]);
}

export function TextosEditor({ groups }: Props) {
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const byKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of allItems) map.set(item.key, item.value);
    return map;
  }, [allItems]);

  const [selectedType, setSelectedType] = useState(
    groups.find((g) => g.type === "top")?.type ?? groups[0]?.type ?? "",
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const currentItems = useMemo(
    () => groups.find((g) => g.type === selectedType)?.items ?? [],
    [groups, selectedType],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentItems;
    return currentItems.filter(
      (i) =>
        i.key.toLowerCase().includes(q) || i.value.toLowerCase().includes(q),
    );
  }, [currentItems, search]);

  const activeKey =
    selectedKey && filtered.some((i) => i.key === selectedKey)
      ? selectedKey
      : (filtered[0]?.key ?? null);

  const selectedEntry = useMemo(
    () => allItems.find((i) => i.key === activeKey) ?? null,
    [allItems, activeKey],
  );

  function draftFor(item: TextoEntry) {
    return drafts[item.key] ?? item.value;
  }

  function handleChange(key: string, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
    setDirty((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  function handleRevert(item: TextoEntry) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[item.key];
      return next;
    });
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(item.key);
      return next;
    });
  }

  async function persist(changes: { key: string; value: string }[]) {
    if (changes.length === 0) return;
    setSaving(true);
    try {
      const res = await saveTextos(changes);
      if (res.success) {
        const savedKeys = new Set(changes.map((c) => c.key));
        setDirty((prev) => {
          const next = new Set(prev);
          for (const k of savedKeys) next.delete(k);
          return next;
        });
        toast.success(
          res.count > 1
            ? `${res.count} textos salvos!`
            : `Texto "${changes[0]!.key}" salvo!`,
        );
      } else {
        toast.error(res.error ?? "Erro ao salvar.");
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setSaving(false);
    }
  }

  function handleSaveOne(item: TextoEntry) {
    void persist([{ key: item.key, value: draftFor(item) }]);
  }

  function handleSaveAll() {
    const changes = allItems
      .filter((i) => dirty.has(i.key))
      .map((i) => ({ key: i.key, value: draftFor(i) }));
    void persist(changes);
  }

  const previewText = selectedEntry ? draftFor(selectedEntry) : "";
  const previewResolved = resolvePlaceholders(previewText, byKey);
  const unknownRefs = useMemo(() => {
    if (!selectedEntry) return [];
    const refs = referencedKeys(previewText);
    return [...new Set(refs.filter((r) => !byKey.has(r)))];
  }, [selectedEntry, previewText, byKey]);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Configuração
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Textos do Bot
            </h1>
            <p className="text-muted-foreground mt-1 text-xs">
              {allItems.length} textos · alterações não salvas: {dirty.size}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={dirty.size === 0 || saving}
              onClick={handleSaveAll}
            >
              {saving ? "Salvando..." : "Salvar todas"}
            </Button>
            <a
              href="/setup/grupos"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              &larr; Voltar
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.type} value={g.type}>
                {g.type}
                <span className="text-muted-foreground"> ({g.items.length})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por chave ou texto..."
          className="w-full max-w-sm"
        />
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="flex max-h-[calc(100vh-16rem)] flex-col rounded-xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-md lg:sticky lg:top-24">
          <div className="border-b border-border/50 p-2 text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            {selectedType} · {filtered.length} texto(s)
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="text-muted-foreground p-3 text-xs">
                Nenhum texto encontrado.
              </p>
            )}
            {filtered.map((item) => {
              const isActive = item.key === activeKey;
              const isDirty = dirty.has(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedKey(item.key)}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 rounded-lg px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50",
                  )}
                >
                  <span className="flex w-full items-center gap-2">
                    <span className="font-mono text-xs font-medium truncate">
                      {item.key}
                    </span>
                    {item.isButton && (
                      <Badge
                        variant="secondary"
                        className="ml-auto shrink-0 rounded-full px-1.5 text-[9px] tracking-wide"
                      >
                        btn
                      </Badge>
                    )}
                    {isDirty && (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-amber-400"
                        aria-label="não salvo"
                      />
                    )}
                  </span>
                  <span className="text-muted-foreground w-full truncate text-[11px]">
                    {draftFor(item).split("\n")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col gap-6">
          {selectedEntry ? (
            <>
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {selectedEntry.key}
                    </span>
                    {selectedEntry.isButton && (
                      <Badge
                        variant="secondary"
                        className="rounded-full px-1.5 text-[9px] tracking-wide"
                      >
                        botão
                      </Badge>
                    )}
                  </div>
                  {selectedEntry.description && (
                    <span className="text-muted-foreground hidden text-xs sm:block">
                      {selectedEntry.description}
                    </span>
                  )}
                </div>

                <Textarea
                  value={previewText}
                  onChange={(e) =>
                    handleChange(selectedEntry.key, e.target.value)
                  }
                  rows={6}
                  className="font-mono text-sm leading-relaxed"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    disabled={!dirty.has(selectedEntry.key) || saving}
                    onClick={() => handleSaveOne(selectedEntry)}
                  >
                    {saving ? "Salvando..." : "Salvar este texto"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!dirty.has(selectedEntry.key)}
                    onClick={() => handleRevert(selectedEntry)}
                  >
                    Reverter
                  </Button>
                  {unknownRefs.length > 0 && (
                    <span className="text-muted-foreground text-xs">
                      Referências não encontradas:{" "}
                      <span className="font-mono text-amber-400">
                        {unknownRefs.join(", ")}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
                <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase">
                  Preview
                </p>
                <div className="flex items-start justify-start">
                  <div className="bg-muted/70 text-foreground relative max-w-full rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {previewResolved || " "}
                    </pre>
                  </div>
                </div>
                <p className="text-muted-foreground mt-2 text-[11px]">
                  Placeholders (${"{exemplo}"}) são resolvidos com o valor de
                  outros textos.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border/70 bg-card/60 p-6 text-sm shadow-xs backdrop-blur-md">
              Selecione um texto na lista para editar.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
