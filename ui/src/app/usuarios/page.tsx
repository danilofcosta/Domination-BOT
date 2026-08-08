import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getTelegramInfo } from "@/lib/telegram";
import { UserTableRow } from "@/components/user-table-row";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProfileFilterSelect } from "@/components/profile-filter-select";

const PROFILE_LABELS: Record<string, string> = {
  SUPREME: "Supremo",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderador",
  USER: "Usuário",
  BANNED: "Banido",
};

const PROFILE_OPTIONS = [
  { value: "__all__", label: "Todos" },
  ...Object.entries(PROFILE_LABELS).map(([value, label]) => ({ value, label })),
];

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
      const { firstName, username } = getTelegramInfo(u.telegramData);
      const lastName = getTelegramInfo(u.telegramData).lastName;
      const fullName = `${firstName} ${lastName}`;
      const searchLower = search.toLowerCase();
      return (
        String(u.id) === search ||
        String(u.telegramId) === search ||
        firstName.toLowerCase().includes(searchLower) ||
        username.toLowerCase().includes(searchLower) ||
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
        <div className="min-w-50 flex-1">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="ID, nome ou username do Telegram..."
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="profileType">Tipo</Label>
          <div className="mt-1.5">
            <ProfileFilterSelect
              defaultValue={profileFilter}
              options={PROFILE_OPTIONS}
            />
          </div>
        </div>

        <Button type="submit">Filtrar</Button>
        {(search || profileFilter) && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/usuarios">Limpar</Link>
          </Button>
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
                const { firstName, lastName, username } = getTelegramInfo(
                  u.telegramData,
                );
                const name =
                  [firstName, lastName].filter(Boolean).join(" ") || "—";

                return (
                  <UserTableRow
                    key={u.id}
                    id={u.id}
                    telegramId={String(u.telegramId)}
                    name={name}
                    username={username}
                    profileType={u.profileType}
                    coins={u.coins}
                    language={u.language}
                    favoriteWaifuId={u.favoriteWaifuId}
                    favoriteHusbandoId={u.favoriteHusbandoId}
                    canManage={canManage}
                  />
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={buildHref({ page: String(page - 1) })}>
                  Anterior
                </Link>
              </Button>
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
                    <Button variant="secondary" disabled className="h-8 w-8 p-0">
                      {p}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Link href={buildHref({ page: String(p) })}>{p}</Link>
                    </Button>
                  )}
                </span>
              ))}
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={buildHref({ page: String(page + 1) })}>
                  Próximo
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
