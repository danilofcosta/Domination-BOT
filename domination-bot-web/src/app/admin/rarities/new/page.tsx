import { GenericMetadataForm } from "@/components/metadata-form";
import { createRarity } from "@/app/admin/actions-extras";

export default function NewRarityPage() {
  return (
    <div className="p-8">
      <GenericMetadataForm title="Nova Raridade" onSubmit={createRarity} />
    </div>
  );
}
