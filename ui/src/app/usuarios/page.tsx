import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCollectionDialog } from "@/components/user-collection-dialog";

const PROFILE_LABELS: Record<string, string> = {
  SUPREME: "Supremo",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderador",
  USER: "Usuário",
  BANNED: "Banido",
};

const PROFILE_COLORS: Record<string, string> = {
  SUPREME: "text-yellow-400",
  SUPER_ADMIN: "text-red-400",
  ADMIN: "text-orange-400",
  MODERATOR: "text-blue-400",
  USER: "text-muted-foreground",
  BANNED: "text-red-600",
};

type UserSearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UsuariosPage({ searchParams }: UserSearchParams) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const profileFilter =
    typeof params.profileType === "string" ? params.profileType : "";

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;
  let currentProfileType = "USER";
  if (sessionToken) {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      select: { userId: true },
    });
    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { telegramUserId: true },
      });
      if (user?.telegramUserId) {
        const tu = await prisma.telegramUser.findUnique({
          where: { id: user.telegramUserId },
          select: { profileType: true },
        });
        if (tu) currentProfileType = tu.profileType;
      }
    }
  }

  const canManage = currentProfileType === "SUPREME" || currentProfileType === "SUPER_ADMIN";

  const page = Math.max(
    1,
    typeof params.page === "string" ? Number(params.page) || 1 : 1,
  );
  const perPage = 20;

  let users: Array<{
    id: number;
    telegramId: bigint;
    telegramData: unknown;
    coins: number;
    profileType: string;
    language: string;
    favoriteWaifuId: number | null;
    favoriteHusbandoId: number | null;
  }>;
  let total: number;

  const userSelect = {
    id: true as const,
    telegramId: true as const,
    telegramData: true as const,
    coins: true as const,
    profileType: true as const,
    language: true as const,
    favoriteWaifuId: true as const,
    favoriteHusbandoId: true as const,
  };

  const where: Record<string, unknown> = {};
  if (profileFilter) where.profileType = profileFilter;

  if (search) {
    const all = await prisma.telegramUser.findMany({
      where: where as any,
      orderBy: { id: "asc" },
      select: userSelect,
    });
    const filtered = all.filter((u) => {
      const data = u.telegramData as Record<string, unknown> | null;
      const firstName = (data?.first_name as string) ?? "";
      const userName = (data?.username as string) ?? "";
      const fullName = `${firstName} ${(data?.last_name as string) ?? ""}`;
      const searchLower = search.toLowerCase();
      return (
        String(u.id) === search ||
        String(u.telegramId) === search ||
        firstName.toLowerCase().includes(searchLower) ||
        userName.toLowerCase().includes(searchLower) ||
        fullName.toLowerCase().includes(searchLower)
      );
    });
    total = filtered.length;
    users = filtered.slice((page - 1) * perPage, page * perPage);
  } else {
    [users, total] = await Promise.all([
      prisma.telegramUser.findMany({
        where: where as any,
        orderBy: { id: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: userSelect,
      }),
      prisma.telegramUser.count({ where: where as any }),
    ]);
  }

  const totalPages = Math.ceil(total / perPage);

  function buildHref(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (profileFilter) sp.set("profileType", profileFilter);
    if (page > 1) sp.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    return `/usuarios${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Gerenciamento
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Usuários ({total})
            </h1>
          </div>
        </div>
      </header>

      <form className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-50">
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Buscar
          </label>
          <input
            name="search"
            defaultValue={search}
            placeholder="ID, nome ou username do Telegram..."
            className="w-full rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
            Tipo
          </label>
          <select
            name="profileType"
            defaultValue={profileFilter}
            className="w-32 rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-border"
          >
            <option value="">Todos</option>
            {Object.entries(PROFILE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg border border-border/70 bg-card/60 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-card"
        >
          Filtrar
        </button>
        {(search || profileFilter) && (
          <Link
            href="/usuarios"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="w-full overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
        {users.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border/50 text-[11px] font-semibold tracking-[0.14em] uppercase">
                <th className="w-10 px-2 py-2 text-center">ID</th>
                <th className="px-2 py-2 text-left">Nome</th>
                <th className="px-2 py-2 text-left">Username</th>
                <th className="px-2 py-2 text-center">Tipo</th>
                <th className="px-2 py-2 text-center">Moedas</th>
                <th className="px-2 py-2 text-center">Idioma</th>
                <th className="px-2 py-2 text-center">Waifu Fav</th>
                <th className="px-2 py-2 text-center">Husbando Fav</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const data = u.telegramData as Record<string, unknown> | null;
                const firstName = (data?.first_name as string) ?? "";
                const lastName = (data?.last_name as string) ?? "";
                const username = (data?.username as string) ?? "";
                const name =
                  [firstName, lastName].filter(Boolean).join(" ") || "—";

                return (
                  <tr
                    key={u.id}
                    className="border-b border-border/30 transition-colors hover:bg-border/20"
                  >
                    <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
                      {u.id}
                    </td>
                    <td className="px-2 py-2.5">
                      <UserCollectionDialog
                        telegramId={String(u.telegramId)}
                        name={name}
                        profileType={u.profileType}
                        canManage={canManage}
                      />
                    </td>
                    <td className="px-2 py-2.5 text-xs">
                      {username ? (
                        <span className="text-muted-foreground">
                          @{username}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td
                      className={`px-2 py-2.5 text-center text-xs font-semibold ${PROFILE_COLORS[u.profileType]}`}
                    >
                      {PROFILE_LABELS[u.profileType]}
                    </td>
                    <td className="px-2 py-2.5 text-center">{u.coins}</td>
                    <td className="px-2 py-2.5 text-center text-xs">
                      {u.language}
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs">
                      {u.favoriteWaifuId ?? "—"}
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs">
                      {u.favoriteHusbandoId ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-sm backdrop-blur-md transition-colors hover:bg-card"
              >
                Anterior
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
              )
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-muted-foreground px-1">...</span>
                  )}
                  {p === page ? (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card/80 text-sm font-semibold">
                      {p}
                    </span>
                  ) : (
                    <Link
                      href={buildHref({ page: String(p) })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-sm backdrop-blur-md transition-colors hover:bg-card"
                    >
                      {p}
                    </Link>
                  )}
                </span>
              ))}
            {page < totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-sm backdrop-blur-md transition-colors hover:bg-card"
              >
                Próximo
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
