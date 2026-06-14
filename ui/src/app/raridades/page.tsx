import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { EditSheet } from "@/components/edit-sheet";
import { AddDialog } from "@/components/add-dialog";
import { DeleteButton } from "@/components/delete-button";

async function updateRarity(formData: FormData) {
  "use server";
  try {
    const id = Number(formData.get("id"));
    const name = formData.get("name") as string;
    const emoji = formData.get("emoji") as string;
    const description = formData.get("description") as string;

    const weight = Number(formData.get("weight")) || 1;

    await prisma.rarity.update({
      where: { id },
      data: { name, emoji, description: description || null, weight },
    });

    revalidatePath("/raridades");
    return { success: true, message: "Raridade salva com sucesso!" };
  } catch (e) {
    return { success: false, message: "Erro: " + String(e) };
  }
}

async function createRarity(formData: FormData) {
  "use server";
  try {
    const code = (formData.get("code") as string).trim().toLowerCase().replace(/\s+/g, "_");
    const name = formData.get("name") as string;
    const emoji = formData.get("emoji") as string;
    const description = formData.get("description") as string;
    const weight = Number(formData.get("weight")) || 1;

    await prisma.rarity.create({
      data: { code, name, emoji, description: description || null, weight },
    });

    revalidatePath("/raridades");
    return { success: true, message: "Raridade criada com sucesso!" };
  } catch (e) {
    return { success: false, message: "Erro: " + String(e) };
  }
}

async function deleteRarity(id: number) {
  "use server";
  try {
    await prisma.rarity.delete({ where: { id } });
    revalidatePath("/raridades");
    return { success: true, message: "Raridade deletada com sucesso!" };
  } catch (e) {
    return { success: false, message: "Erro: " + String(e) };
  }
}

export default async function RaridadesPage() {
  const rarities = await prisma.rarity.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col gap-6 p-8">
      <header className="w-full shrink-0 rounded-xl border border-border/70 bg-card/60 p-3 shadow-xs backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Gerenciamento
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Raridades</h1>
          </div>
          <div className="flex items-center gap-2">
            <AddDialog
              title="Raridade"
              fields={[
                { name: "code", label: "Código", placeholder: "ex: lendario" },
                { name: "name", label: "Nome", placeholder: "ex: Lendário" },
                { name: "emoji", label: "Emoji", placeholder: "ex: 💎" },
                { name: "weight", label: "Peso", placeholder: "ex: 1", type: "number" },
                { name: "description", label: "Descrição", placeholder: "Descrição..." },
              ]}
              action={createRarity}
            />
            <Link
              href="/characters"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              &larr; Voltar
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rarities.map((r) => (
          <div
            key={r.id}
            className="group relative rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md"
          >
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <DeleteButton id={r.id} label={`"${r.name}"`} action={deleteRarity} />
              <EditSheet
                title={`Raridade #${r.id}`}
                hiddenFields={[{ name: "id", value: String(r.id) }]}
                fields={[
                  { name: "name", label: "Nome", defaultValue: r.name },
                  { name: "emoji", label: "Emoji", defaultValue: r.emoji },
                  { name: "weight", label: "Peso", defaultValue: String(r.weight), type: "number" },
                  { name: "description", label: "Descrição", defaultValue: r.description ?? "", placeholder: "Descrição..." },
                ]}
                action={updateRarity}
              />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <p className="text-lg font-semibold tracking-tight">{r.name}</p>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  #{r.id} · {r.code} · peso {r.weight}
                </p>
              </div>
            </div>
            {r.description && (
              <p className="text-muted-foreground text-sm">{r.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
