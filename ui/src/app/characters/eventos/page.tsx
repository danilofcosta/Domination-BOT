import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { EditSheet } from "@/components/edit-sheet";
import { AddDialog } from "@/components/add-dialog";
import { DeleteButton } from "@/components/delete-button";
import ExpandableText from "@/components/expandable-text";

export const dynamic = "force-dynamic";

async function updateEvent(formData: FormData) {
  "use server";
  try {
    const id = Number(formData.get("id"));
    const name = formData.get("name") as string;
    const emoji = formData.get("emoji") as string;
    const emojiId = (formData.get("emoji_id") as string)?.trim() || null;
    const description = formData.get("description") as string;

    await prisma.event.update({
      where: { id },
      data: { name, emoji, description: description || null, emoji_id: emojiId },
    });

    revalidatePath("/characters/eventos");
    return { success: true, message: "Evento salvo com sucesso!" };
  } catch {
    return { success: false, message: "Erro ao salvar evento." };
  }
}

async function createEvent(formData: FormData) {
  "use server";
  try {
    const code = (formData.get("code") as string).trim().toLowerCase().replace(/\s+/g, "_");
    const name = formData.get("name") as string;
    const emoji = formData.get("emoji") as string;
    const emojiId = (formData.get("emoji_id") as string)?.trim() || null;
    const description = formData.get("description") as string;

    await prisma.event.create({
      data: { code, name, emoji, description: description || null, emoji_id: emojiId },
    });

    revalidatePath("/characters/eventos");
    return { success: true, message: "Evento criado com sucesso!" };
  } catch (e) {
    return { success: false, message: "Erro: " + String(e) };
  }
}

async function deleteEvent(id: number) {
  "use server";
  try {
    await prisma.event.delete({ where: { id } });
    revalidatePath("/characters/eventos");
    return { success: true, message: "Evento deletado com sucesso!" };
  } catch (e) {
    return { success: false, message: "Erro: " + String(e) };
  }
}

export default async function EventosPage() {
  const events = await prisma.event.findMany({
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
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Eventos</h1>
          </div>
          <div className="flex items-center gap-2">
            <AddDialog
              title="Evento"
              fields={[
                { name: "code", label: "Código", placeholder: "ex: natal" },
                { name: "name", label: "Nome", placeholder: "ex: Natal" },
                { name: "emoji", label: "Emoji", placeholder: "ex: 🎄" },
                { name: "emoji_id", label: "Emoji ID", placeholder: "ex: 5355035722246016995" },
                { name: "description", label: "Descrição", placeholder: "Descrição..." },
              ]}
              action={createEvent}
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
        {events.map((e) => (
          <div
            key={e.id}
            className="group relative rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md"
          >
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <DeleteButton id={e.id} label={`"${e.name}"`} action={deleteEvent} />
              <EditSheet
                title={`Evento #${e.id}`}
                hiddenFields={[{ name: "id", value: String(e.id) }]}
                fields={[
                  { name: "name", label: "Nome", defaultValue: e.name },
                  { name: "emoji", label: "Emoji", defaultValue: e.emoji },
                  { name: "emoji_id", label: "Emoji ID", defaultValue: e.emoji_id ?? "", placeholder: "ex: 5355035722246016995" },
                  { name: "description", label: "Descrição", defaultValue: e.description ?? "", placeholder: "Descrição..." },
                ]}
                action={updateEvent}
              />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{e.emoji}</span>
              <div>
                <p className="text-lg font-semibold tracking-tight">{e.name}</p>
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  #{e.id} · {e.code}
                </p>
              </div>
            </div>
            {e.description && <ExpandableText text={e.description} />}
          </div>
        ))}
      </div>
    </div>
  );
}
