"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  saveRolePermissions,
  restoreDefaultPermissions,
} from "@/actions/permissions";

export type PermissionDef = {
  value: string;
  label: string;
  description?: string;
};

export type RoleDef = {
  value: string;
  label: string;
  locked?: boolean;
};

function serialize(matrix: Record<string, Set<string>>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [role, set] of Object.entries(matrix)) {
    out[role] = [...set].sort();
  }
  return out;
}

function isEqual(
  a: Record<string, Set<string>>,
  b: Record<string, string[]>,
): boolean {
  for (const role of Object.keys(a)) {
    const sa = [...a[role]].sort().join(",");
    const sb = (b[role] ?? []).sort().join(",");
    if (sa !== sb) return false;
  }
  return true;
}

export function PermissionsMatrix({
  roles,
  permissions,
  initial,
}: {
  roles: RoleDef[];
  permissions: PermissionDef[];
  initial: Record<string, string[]>;
}) {
  const [matrix, setMatrix] = useState<Record<string, Set<string>>>(
    () => {
      const m: Record<string, Set<string>> = {};
      for (const role of roles) m[role.value] = new Set(initial[role.value] ?? []);
      return m;
    },
  );
  const [pending, startTransition] = useTransition();
  const dirty = !isEqual(matrix, initial);

  function toggle(role: string, permission: string) {
    setMatrix((prev) => {
      const next: Record<string, Set<string>> = {};
      for (const [r, s] of Object.entries(prev)) next[r] = new Set(s);
      if (next[role].has(permission)) next[role].delete(permission);
      else next[role].add(permission);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveRolePermissions(serialize(matrix));
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreDefaultPermissions();
      if (result.success) {
        toast.success(result.message);
        if (result.matrix) {
          const m: Record<string, Set<string>> = {};
          for (const role of roles)
            m[role.value] = new Set(result.matrix[role.value] ?? []);
          setMatrix(m);
        }
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-md">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border/50 text-[11px] font-semibold tracking-[0.14em] uppercase">
              <th className="min-w-64 px-4 py-3 text-left">Permissão</th>
              {roles.map((r) => (
                <th key={r.value} className="px-3 py-3 text-center">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((p, idx) => (
              <tr
                key={p.value}
                className={cn(
                  "border-b border-border/30 last:border-0",
                  idx % 2 === 1 && "bg-border/5",
                )}
              >
                <td className="px-4 py-2.5">
                  <p className="font-medium">{p.label}</p>
                  {p.description && (
                    <p className="text-muted-foreground text-xs">{p.description}</p>
                  )}
                </td>
                {roles.map((r) => {
                  const locked = r.locked || r.value === "SUPREME";
                  const active = matrix[r.value]?.has(p.value) ?? false;
                  return (
                    <td key={r.value} className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        disabled={locked || pending}
                        aria-pressed={active}
                        aria-label={`${r.label}: ${p.label}`}
                        onClick={() => toggle(r.value, p.value)}
                        className={cn(
                          "inline-flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors",
                          active
                            ? "border-emerald-500/50 bg-emerald-500/80"
                            : "border-border bg-border/40",
                          locked && "cursor-not-allowed opacity-60",
                        )}
                      >
                        <span
                          className={cn(
                            "size-4.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                            active && "translate-x-5",
                          )}
                        />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {dirty && (
          <Button type="button" onClick={handleSave} disabled={pending}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleRestore}
          disabled={pending}
        >
          {pending ? "Restaurando..." : "Restaurar padrão"}
        </Button>
        <p className="text-muted-foreground text-xs">
          Supremo (dono) sempre tem todas as permissões e não pode ser alterado.
        </p>
      </div>
    </div>
  );
}
