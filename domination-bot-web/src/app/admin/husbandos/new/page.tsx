import { CharacterForm } from "@/components/character-form";
import { createHusbando } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function NewHusbandoPage() {
  const [events, rarities] = await Promise.all([
    prisma.event.findMany({ select: { id: true, name: true, emoji: true } }),
    prisma.rarity.findMany({ select: { id: true, name: true, emoji: true } }),
  ]);

  return (
    <div className="p-8">
      <CharacterForm 
        type="husbando" 
        events={events} 
        rarities={rarities} 
        onSubmit={createHusbando} 
      />
    </div>
  );
}
