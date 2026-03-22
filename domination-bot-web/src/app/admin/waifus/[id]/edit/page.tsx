import { CharacterForm } from "@/components/character-form";
import { updateWaifu } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditWaifuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const characterId = parseInt(id);

  const [waifu, events, rarities] = await Promise.all([
    prisma.characterWaifu.findUnique({
      where: { id: characterId },
      include: { events: true, rarities: true },
    }),
    prisma.event.findMany({ select: { id: true, name: true, emoji: true } }),
    prisma.rarity.findMany({ select: { id: true, name: true, emoji: true } }),
  ]);

  if (!waifu) notFound();

  const updateWithId = updateWaifu.bind(null, characterId);

  return (
    <div className="p-8">
      <CharacterForm
        type="waifu"
        initialData={waifu}
        events={events}
        rarities={rarities}
        onSubmit={updateWithId}
      />
    </div>
  );
}
