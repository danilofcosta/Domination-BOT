import { prisma } from "@/lib/prisma";
import { getTelegramInfo } from "@/lib/telegram";
import { getRedis } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserInfoDialog } from "@/components/user-info-dialog";

async function unbanUser(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID não informado");
  await prisma.telegramUser.update({
    where: { id: Number(id) },
    data: { profileType: "USER" },
  });
  revalidatePath("/setup/limites");
  redirect("/setup/limites");
}

type DailyLimit = {
  userId: number;
  count: number;
};

type LimitPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LimitesPage({ searchParams }: LimitPageProps) {
  const params = await searchParams;
  const page = Math.max(
    1,
    typeof params.page === "string" ? Number(params.page) || 1 : 1,
  );
  const perPage = 20;

  const [bannedUsers, total] = await Promise.all([
    prisma.telegramUser.findMany({
      where: { profileType: "BANNED" },
      orderBy: { id: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        telegramId: true,
        telegramData: true,
        profileType: true,
      },
    }),
    prisma.telegramUser.count({ where: { profileType: "BANNED" } }),
  ]);

  let dailyLimits: DailyLimit[] = [];
  try {
    const redis = await getRedis();
    const keys: string[] = [];
    let cursor = "0";
    do {
      const result = await redis.scan(cursor, {
        MATCH: "daily_dominar:*",
        COUNT: 200,
      });
      cursor = result.cursor;
      keys.push(...(result.keys || result[1] || []));
    } while (cursor !== "0");

    if (keys.length > 0 && redis.mget) {
      const values = await redis.mget(...keys);
      dailyLimits = keys.map((k, i) => ({
        userId: Number(k.split(":")[1]),
        count: Number(values[i] ?? 0),
      }));
    } else if (keys.length > 0) {
      for (const k of keys) {
        const v = await redis.get(k);
        dailyLimits.push({
          userId: Number(k.split(":")[1]),
          count: Number(v ?? 0),
        });
      }
    }
  } catch (e) {
    console.error("Redis error:", e);
  }

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="flex items-center justify-between w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
            Bot Setup
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Limites e Bloqueios
          </h1>
        </div>
        <UserInfoDialog />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold">
            Usuários Banidos ({total})
          </h2>
          {bannedUsers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhum usuário banido.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    <th className="px-2 py-2 text-left">ID</th>
                    <th className="px-2 py-2 text-left">Telegram ID</th>
                    <th className="px-2 py-2 text-left">Nome</th>
                    <th className="px-2 py-2 text-left">Username</th>
                    <th className="px-2 py-2 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers.map((u) => {
                    const { firstName, lastName, username } = getTelegramInfo(
                      u.telegramData,
                    );
                    const name =
                      [firstName, lastName].filter(Boolean).join(" ") || "—";
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-border/30 transition-colors hover:bg-border/20"
                      >
                        <td className="px-2 py-2.5 text-xs text-muted-foreground">
                          {u.id}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-muted-foreground">
                          {String(u.telegramId)}
                        </td>
                        <td className="max-w-[120px] truncate px-2 py-2.5">
                          {name}
                        </td>
                        <td className="px-2 py-2.5 text-xs">
                          {username ? (
                            <span className="text-muted-foreground">
                              @{username}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <form action={unbanUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 backdrop-blur-md transition-colors hover:bg-emerald-500/20"
                            >
                              Desbanir
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/setup/limites?page=${page - 1}`}
                      className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-sm backdrop-blur-md transition-colors hover:bg-card"
                    >
                      Anterior
                    </Link>
                  )}
                  <span className="text-muted-foreground text-xs">
                    {page} / {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={`/setup/limites?page=${page + 1}`}
                      className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-sm backdrop-blur-md transition-colors hover:bg-card"
                    >
                      Próximo
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 p-5 shadow-xs backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold">Limite Diário (Redis)</h2>
          {dailyLimits.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhum limite diário ativo ou Redis indisponível.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    <th className="px-2 py-2 text-left">User ID</th>
                    <th className="px-2 py-2 text-right">Capturas Hoje</th>
                    <th className="px-2 py-2 text-center">Info</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyLimits.map((d) => (
                    <tr
                      key={d.userId}
                      className="border-b border-border/30 transition-colors hover:bg-border/20"
                    >
                      <td className="px-2 py-2.5">{d.userId}</td>
                      <td className="px-2 py-2.5 text-right font-mono">
                        {d.count}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <UserInfoDialog defaultTelegramId={String(d.userId)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
