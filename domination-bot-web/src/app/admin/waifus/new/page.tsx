import { CharacterForm } from "@/components/character-form";
import { createWaifu } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

export default async function NewWaifuPage() {
  const [events, rarities] = await Promise.all([
    prisma.event.findMany({ select: { id: true, name: true, emoji: true } }),
    prisma.rarity.findMany({ select: { id: true, name: true, emoji: true } }),
  ]);

  return (
    <div className="p-8">
      <CharacterForm 
        type="waifu" 
        events={events} 
        rarities={rarities} 
        onSubmit={createWaifu} 
      />
    </div>
  );
}
