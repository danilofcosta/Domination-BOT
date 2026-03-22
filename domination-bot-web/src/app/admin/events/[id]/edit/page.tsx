import { GenericMetadataForm } from "@/components/metadata-form";
import { updateEvent } from "@/app/admin/actions-extras";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = parseInt(id);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) notFound();

  const updateWithId = updateEvent.bind(null, eventId);

  return (
    <div className="p-8">
      <GenericMetadataForm title="Editar Evento" initialData={event} onSubmit={updateWithId} />
    </div>
  );
}
