import { GenericMetadataForm } from "@/components/metadata-form";
import { createEvent } from "@/app/admin/actions-extras";

export default function NewEventPage() {
  return (
    <div className="p-8">
      <GenericMetadataForm title="Novo Evento" onSubmit={createEvent} />
    </div>
  );
}
