import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { EditSheet } from "@/components/edit-sheet";

async function updateGroup(formData: FormData) {
  "use server";
  try {
    const id = Number(formData.get("id"));
    const groupName = formData.get("groupName") as string;

    await prisma.telegramGroup.update({
      where: { id },
      data: { groupName },
    });

    revalidatePath("/setup/grupos");
    return { success: true, message: "Grupo salvo com sucesso!" };
  } catch {
    return { success: false, message: "Erro ao salvar grupo." };
  }
}

type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function GruposPage({ searchParams }: SearchParams) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const page = Math.max(1, typeof params.page === "string" ? Number(params.page) || 1 : 1);
  const perPage = 20;

  const groupSelect = { id: true, groupId: true, groupName: true, createdAt: true, updatedAt: true } as const;

  let groups: Array<{ id: number; groupId: bigint; groupName: string; createdAt: Date; updatedAt: Date }>;
  let total: number;

  if (search) {
    const all = await prisma.telegramGroup.findMany({
      select: groupSelect,
      orderBy: { id: "asc" },
    });
    const filtered = all.filter((g) => {
      const searchLower = search.toLowerCase();
      return (
        String(g.id) === search ||
        String(g.groupId) === search ||
        g.groupName.toLowerCase().includes(searchLower)
      );
    });
    total = filtered.length;
    groups = filtered.slice((page - 1) * perPage, page * perPage);
  } else {
    [groups, total] = await Promise.all([
      prisma.telegramGroup.findMany({
        select: groupSelect,
        orderBy: { id: "asc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.telegramGroup.count(),
    ]);
  }

  const totalPages = Math.ceil(total / perPage);

  function buildHref(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (page > 1) sp.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    return `/setup/grupos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Configuração do Bot
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Grupos ({total})
            </h1>
          </div>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          >
            &larr; Voltar
          </Link>
        </div>
      </header>

      <form className="flex flex-wrap items-end gap-3" action={buildHref({ search: "", page: "" })}>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="text-muted-foreground block text-[11px] font-semibold tracking-[0.14em] uppercase mb-1">
            Buscar
          </label>
          <input
            id="search"
            name="search"
            type="text"
            defaultValue={search}
            placeholder="ID, groupId ou nome..."
            className="w-full rounded-lg border border-border/70 bg-card/60 px-3 py-2 text-sm backdrop-blur-md placeholder:text-muted-foreground/50 focus:border-ring focus:outline-hidden"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-border/70 bg-card/60 px-4 py-2 text-sm font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Group ID</th>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Criado em</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/50 transition-colors">
                <td className="p-3 font-mono text-xs">{g.id}</td>
                <td className="p-3 font-mono text-xs">{String(g.groupId)}</td>
                <td className="p-3 font-medium">{g.groupName}</td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(g.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <EditSheet
                      title={`Grupo #${g.id}`}
                      hiddenFields={[{ name: "id", value: String(g.id) }]}
                      fields={[
                        { name: "groupName", label: "Nome do Grupo", defaultValue: g.groupName },
                      ]}
                      action={updateGroup}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
            >
              Anterior
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-1">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-muted-foreground px-1 text-xs">...</span>
                )}
                {p === page ? (
                  <span className="rounded-lg border border-border/70 bg-accent px-3 py-1.5 text-xs font-medium shadow-xs">
                    {p}
                  </span>
                ) : (
                  <Link
                    href={buildHref({ page: String(p) })}
                    className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
                  >
                    {p}
                  </Link>
                )}
              </span>
            ))}
          {page < totalPages && (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md hover:bg-accent transition-colors"
            >
              Próximo
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
