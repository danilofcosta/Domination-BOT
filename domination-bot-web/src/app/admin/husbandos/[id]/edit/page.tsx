import { CharacterForm } from "@/components/character-form";
import { updateHusbando } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditHusbandoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const characterId = parseInt(id);

  const [husbando, events, rarities] = await Promise.all([
    prisma.characterHusbando.findUnique({
      where: { id: characterId },
      include: { events: true, rarities: true },
    }),
    prisma.event.findMany({ select: { id: true, name: true, emoji: true } }),
    prisma.rarity.findMany({ select: { id: true, name: true, emoji: true } }),
  ]);

  if (!husbando) notFound();

  const updateWithId = updateHusbando.bind(null, characterId);

  return (
    <div className="p-8">
      <CharacterForm
        type="husbando"
        initialData={husbando}
        events={events}
        rarities={rarities}
        onSubmit={updateWithId}
      />
    </div>
  );
}
