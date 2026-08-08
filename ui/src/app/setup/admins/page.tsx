import Link from "next/link";
import {
  PermissionsMatrix,
  type PermissionDef,
  type RoleDef,
} from "@/components/permissions-matrix";
import { getPermissionMatrix } from "@/lib/permissions";

const ROLE_DEFS: RoleDef[] = [
  { value: "SUPREME", label: "Supremo", locked: true },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "MODERATOR", label: "Moderador" },
  { value: "USER", label: "Usuário" },
  { value: "BANNED", label: "Banido" },
];

const PERMISSION_DEFS: PermissionDef[] = [
  { value: "manage_admins", label: "Gerenciar admins", description: "Página Permissões" },
  { value: "manage_users", label: "Gerenciar usuários", description: "Página de usuários e ações" },
  { value: "manage_characters", label: "Gerenciar personagens", description: "Criar, editar e deletar personagens" },
  { value: "manage_events", label: "Gerenciar eventos", description: "Página de eventos" },
  { value: "manage_rarities", label: "Gerenciar raridades", description: "Página de raridades e pesos" },
  { value: "manage_groups", label: "Gerenciar grupos", description: "Grupos cadastrados" },
  { value: "manage_config", label: "Configurações do bot", description: "Dados do bot e textos" },
  { value: "manage_limits", label: "Limites e bloqueios", description: "Página de limites e banimentos" },
  { value: "manage_drop", label: "Dropar personagem", description: "Painel e configuração de drop" },
  { value: "view_users", label: "Ver usuários", description: "Visualizar lista de usuários" },
  { value: "view_logs", label: "Ver logs", description: "Visualizar logs de atividades" },
];

export default async function AdminsPage() {
  const matrix = await getPermissionMatrix();

  const initial: Record<string, string[]> = {};
  for (const role of ROLE_DEFS) initial[role.value] = matrix[role.value as keyof typeof matrix] ?? [];

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Bot Setup
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Permissões por cargo
            </h1>
          </div>
          <Link
            href="/setup"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
      </header>

      <PermissionsMatrix
        roles={ROLE_DEFS}
        permissions={PERMISSION_DEFS}
        initial={initial}
      />
    </div>
  );
}
