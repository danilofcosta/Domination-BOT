import { GenericMetadataForm } from "@/components/metadata-form";
import { updateRarity } from "@/app/admin/actions-extras";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditRarityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rarityId = parseInt(id);

  const rarity = await prisma.rarity.findUnique({
    where: { id: rarityId },
  });

  if (!rarity) notFound();

  const updateWithId = updateRarity.bind(null, rarityId);

  return (
    <div className="p-8">
      <GenericMetadataForm title="Editar Raridade" initialData={rarity} onSubmit={updateWithId} />
    </div>
  );
}
